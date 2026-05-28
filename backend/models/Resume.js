import mongoose from 'mongoose'

const jobAnalysisSchema = new mongoose.Schema({
  jobTitle: { type: String, default: 'Job Description' },
  jobDescription: { type: String, default: '' },
  score: { type: Number, default: 0 },
  matchedKeywords: { type: [String], default: [] },
  missingKeywords: { type: [String], default: [] },
  skillGap: { type: mongoose.Schema.Types.Mixed, default: {} },
  actionVerbsInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
  formattingChecks: { type: mongoose.Schema.Types.Mixed, default: [] },
  readabilityInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
  careerProgression: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
})

const resumeSchema = new mongoose.Schema(
  {
    filename: { type: String, default: '' },
    candidateName: { type: String, default: 'Candidate' },
    resumeText: { type: String, required: true },
    
    // List of multiple job-specific tailoring analyses
    analyses: { type: [jobAnalysisSchema], default: [] },
    
    // Top-level fields (representing the active/most recent analysis for backwards compatibility)
    jobDescription: { type: String, default: '' },
    score: { type: Number, default: 0 },
    suggestions: { type: [String], default: [] },
    matchedKeywords: { type: [String], default: [] }
  },
  { timestamps: true }
)

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema)

export default Resume
