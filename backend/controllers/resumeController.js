import pdfParse from 'pdf-parse'
import Resume from '../models/Resume.js'
import {
  calculateReadability,
  checkActionVerbs,
  validateFormatting,
  analyzeSkillGap,
  detectCareerProgression,
} from '../utils/analysisEngine.js'
import { analyzeWithGemini } from '../utils/geminiService.js'

const parsePdfBuffer = async (buffer) => {
  try {
    const data = await pdfParse(buffer)
    return data.text || ''
  } catch (error) {
    throw new Error('Failed to parse PDF file')
  }
}

// Perform full analysis suite
const runAnalysis = async (resumeText, jobTitle, jobDescription) => {
  const title = jobTitle || 'Target Job Description'
  const desc = jobDescription || ''

  // 1. Run local heuristics
  const readabilityInfo = calculateReadability(resumeText)
  const actionVerbsInfo = checkActionVerbs(resumeText)
  const formattingChecks = validateFormatting(resumeText)
  const skillGap = analyzeSkillGap(resumeText, desc)
  const careerProgression = detectCareerProgression(resumeText)

  const matchedKeywords = skillGap.matched
  const missingKeywords = skillGap.missing.map(m => m.skill)

  // Calculate local score
  let skillMatchScore = 100
  if (matchedKeywords.length + missingKeywords.length > 0) {
    skillMatchScore = Math.round((matchedKeywords.length / (matchedKeywords.length + missingKeywords.length)) * 100)
  }
  const verbsScore = actionVerbsInfo.score
  const readabilityScore = readabilityInfo.score
  
  const passedFormatCount = formattingChecks.filter(c => c.status === 'pass').length
  const formattingScore = Math.round((passedFormatCount / formattingChecks.length) * 100)

  // Overall weighted score
  let score = Math.round((skillMatchScore * 0.4) + (verbsScore * 0.2) + (readabilityScore * 0.2) + (formattingScore * 0.2))

  // Suggestions list
  const suggestions = []
  if (missingKeywords.length > 0) {
    suggestions.push(`Add or emphasize these missing keywords: ${missingKeywords.slice(0, 6).join(', ')}`)
  }
  if (actionVerbsInfo.issues.length > 0) {
    suggestions.push(`Strengthen ${actionVerbsInfo.issues.length} sentences by replacing weak phrases like "${actionVerbsInfo.issues[0].weakPhrase}" with action verbs.`)
  }
  if (formattingChecks.some(c => c.status === 'fail')) {
    suggestions.push('Fix critical formatting issues like missing contact information.')
  }
  if (readabilityInfo.score < 50) {
    suggestions.push('Simplify sentence structure. The text is currently flagged as difficult to read.')
  }
  if (suggestions.length === 0) {
    suggestions.push('Resume looks solid! Customizing keywords for this specific role is recommended.')
  }

  const analysisObject = {
    jobTitle: title,
    jobDescription: desc,
    score,
    matchedKeywords,
    missingKeywords,
    skillGap,
    actionVerbsInfo,
    formattingChecks,
    readabilityInfo,
    careerProgression,
    createdAt: new Date()
  }

  // 2. Try Gemini (if configured)
  const geminiResult = await analyzeWithGemini(resumeText, desc)
  if (geminiResult) {
    console.log('Gemini API: Successfully completed analysis.');
    
    // Enrich with Gemini data
    analysisObject.score = geminiResult.atsScore || score
    
    if (geminiResult.summary) {
      analysisObject.summary = geminiResult.summary
    }

    if (geminiResult.actionVerbIssues && geminiResult.actionVerbIssues.length > 0) {
      analysisObject.actionVerbsInfo = {
        score: Math.max(30, 100 - (geminiResult.actionVerbIssues.length * 15)),
        issues: geminiResult.actionVerbIssues
      }
    }

    if (geminiResult.careerInsights) {
      analysisObject.careerProgression = {
        status: geminiResult.careerInsights.status || careerProgression.status,
        timeline: geminiResult.careerInsights.timeline || careerProgression.timeline,
        signals: geminiResult.careerInsights.signals || careerProgression.signals
      }
    }
  }

  return {
    analysisObject,
    suggestions
  }
}

// Upload/create a Resume document
export const uploadResume = async (req, res) => {
  try {
    const file = req.file
    const { resumeText: rawText, jobTitle, jobDescription, candidateName } = req.body

    let resumeText = rawText || ''

    if (file) {
      resumeText = await parsePdfBuffer(file.buffer)
    }

    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text or file is required' })
    }

    // Try extracting candidate name from first line if not provided
    const firstLineName = resumeText.split('\n')[0]?.trim().substring(0, 50) || 'Candidate'
    const name = candidateName || firstLineName

    const filename = file?.originalname || 'pasted-text'

    let analyses = []
    let score = 0
    let suggestions = []
    let matchedKeywords = []
    let desc = jobDescription || ''

    // If job description is present, analyze it right away
    if (desc) {
      const { analysisObject, suggestions: sList } = await runAnalysis(resumeText, jobTitle, desc)
      analyses.push(analysisObject)
      score = analysisObject.score
      suggestions = sList
      matchedKeywords = analysisObject.matchedKeywords
    }

    const resume = await Resume.create({
      filename,
      candidateName: name,
      resumeText,
      analyses,
      jobDescription: desc,
      score,
      suggestions,
      matchedKeywords,
    })

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resumeId: resume._id,
      candidateName: name,
      filename,
      atsScore: score, // support frontend atsScore key
      matchedKeywords,
      suggestions,
      analyses: resume.analyses,
      activeAnalysis: resume.analyses[0] || null
    })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Upload failed' })
  }
}

// Legacy endpoint mapping for backwards compatibility
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription, candidateName, jobTitle } = req.body

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: 'Resume text and job description are required' })
    }

    const { analysisObject, suggestions } = await runAnalysis(resumeText, jobTitle, jobDescription)

    const resume = await Resume.create({
      filename: 'analyzed-text',
      candidateName: candidateName || 'Candidate',
      resumeText,
      analyses: [analysisObject],
      jobDescription,
      score: analysisObject.score,
      suggestions,
      matchedKeywords: analysisObject.matchedKeywords,
    })

    res.status(200).json({
      resumeId: resume._id,
      atsScore: analysisObject.score,
      matchedKeywords: analysisObject.matchedKeywords,
      suggestions,
      activeAnalysis: analysisObject
    })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Analysis failed' })
  }
}

// Fetch all uploaded resumes history
export const getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 }).limit(50)
    
    // Format history list with backward compatible keys
    const historyList = resumes.map(r => {
      const activeAnalysis = r.analyses[0] || null
      return {
        _id: r._id,
        filename: r.filename,
        candidateName: r.candidateName,
        createdAt: r.createdAt,
        atsScore: activeAnalysis ? activeAnalysis.score : r.score,
        score: activeAnalysis ? activeAnalysis.score : r.score,
        matchedKeywords: activeAnalysis ? activeAnalysis.matchedKeywords : r.matchedKeywords,
        suggestions: r.suggestions,
        jobDescription: r.jobDescription,
        activeAnalysis
      }
    })

    res.status(200).json(historyList)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch history' })
  }
}

// Fetch a single resume in detail with all its tailoring runs
export const getResumeDetail = async (req, res) => {
  try {
    const { id } = req.params
    const resume = await Resume.findById(id)
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    res.status(200).json({
      _id: resume._id,
      filename: resume.filename,
      candidateName: resume.candidateName,
      resumeText: resume.resumeText,
      analyses: resume.analyses,
      createdAt: resume.createdAt
    })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch resume details' })
  }
}

// Add a job tailoring analysis (create new job description run)
export const addJobAnalysis = async (req, res) => {
  try {
    const { id } = req.params
    const { jobTitle, jobDescription } = req.body

    if (!jobDescription) {
      return res.status(400).json({ message: 'Job description is required' })
    }

    const resume = await Resume.findById(id)
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    const { analysisObject } = await runAnalysis(resume.resumeText, jobTitle, jobDescription)

    // Append to analyses
    resume.analyses.unshift(analysisObject) // Prepend so it becomes the latest/active run
    
    // Also sync top level for backwards compatibility
    resume.score = analysisObject.score
    resume.jobDescription = jobDescription
    resume.matchedKeywords = analysisObject.matchedKeywords

    await resume.save()

    res.status(201).json({
      message: 'Job analysis added successfully',
      analyses: resume.analyses,
      activeAnalysis: analysisObject,
      atsScore: analysisObject.score
    })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add job analysis' })
  }
}

// Gamification Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 }).limit(100)

    const leaderboard = []
    
    for (const r of resumes) {
      for (const a of r.analyses) {
        // Calculate unlocked badges count
        let badgesCount = 0
        if (a.score >= 85) badgesCount++ // ATS Champion
        if (a.actionVerbsInfo?.issues?.length === 0) badgesCount++ // Action Hero
        if (a.matchedKeywords?.length >= 5) badgesCount++ // Keyword Master
        if (a.formattingChecks?.filter(c => c.status === 'fail').length === 0) badgesCount++ // Format Approved
        if (a.readabilityInfo?.score >= 60 && a.readabilityInfo?.score <= 80) badgesCount++ // Eloquent
        if (a.careerProgression?.status === 'Upward') badgesCount++ // Career Climber

        leaderboard.push({
          candidateName: r.candidateName || 'Anonymous Student',
          jobTitle: a.jobTitle,
          score: a.score,
          badgesUnlocked: badgesCount,
          date: a.createdAt || r.createdAt
        })
      }
    }

    // Sort leaderboard by score descending, then badgesUnlocked descending
    leaderboard.sort((a, b) => b.score - a.score || b.badgesUnlocked - a.badgesUnlocked)

    // Slice top 10
    const topRanked = leaderboard.slice(0, 10).map((item, index) => ({
      rank: index + 1,
      ...item
    }))

    res.status(200).json(topRanked)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch leaderboard' })
  }
}

