import React, { useState } from 'react'

export default function Dashboard({ activeAnalysis, candidateName, filename }) {
  if (!activeAnalysis) {
    return (
      <div className="glass-card text-center" style={{ padding: '60px 20px' }}>
        <h3 style={{ fontSize: '22px', margin: '0 0 10px' }}>No active analysis</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Please upload a resume and paste a job description to get started.
        </p>
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState('skillgap')

  // Destructure active analysis info
  const {
    jobTitle = 'Target Job',
    score = 0,
    matchedKeywords = [],
    missingKeywords = [],
    skillGap = { matched: [], missing: [] },
    actionVerbsInfo = { score: 100, issues: [] },
    formattingChecks = [],
    readabilityInfo = { score: 100, gradeLevel: 'N/A', wordCount: 0 },
    careerProgression = { status: 'Stable', timeline: [], signals: [] },
    summary
  } = activeAnalysis

  // Circle circumference for r=45 is 283
  const strokeDashoffset = 283 - (283 * Math.min(100, Math.max(0, score))) / 100

  // Sentence rewriter preview state
  const [rewrittenSentences, setRewrittenSentences] = useState({})

  const handleRewrite = (issueIndex, synonym) => {
    const issue = actionVerbsInfo.issues[issueIndex]
    const regex = new RegExp(`\\b${issue.weakPhrase}\\b`, 'gi')
    
    // Capitalize synonym if weakPhrase was capitalized
    const isCapitalized = issue.weakPhrase[0] === issue.weakPhrase[0].toUpperCase()
    const finalSynonym = isCapitalized 
      ? synonym[0].toUpperCase() + synonym.slice(1) 
      : synonym

    const replaced = issue.sentence.replace(regex, `**${finalSynonym}**`)
    setRewrittenSentences(prev => ({
      ...prev,
      [issueIndex]: replaced
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  // Trigger JSON download of the report
  const handleDownloadReport = () => {
    const reportData = {
      candidateName,
      filename,
      jobTitle,
      score,
      summary,
      matchedKeywords,
      missingKeywords,
      readability: readabilityInfo,
      actionVerbs: actionVerbsInfo,
      formatting: formattingChecks,
      career: careerProgression
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${candidateName.replace(/\s+/g, '_')}_ATS_Report.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="dashboard-root">
      {/* Top Stats Section */}
      <div className="stats-grid">
        {/* Score Ring */}
        <div className="glass-card score-card accent-glow">
          <div className="circular-progress">
            <svg viewBox="0 0 100 100">
              <circle className="bg-ring" cx="50" cy="50" r="45" />
              <circle 
                className="progress-ring" 
                cx="50" 
                cy="50" 
                r="45" 
                strokeDasharray="283" 
                strokeDashoffset={strokeDashoffset} 
              />
            </svg>
            <span className="progress-val">{score}</span>
          </div>
          <div className="gauge-details">
            <span className="gauge-heading">ATS Match Score</span>
            <span className="gauge-subtitle">
              {score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Needs Optimization'}
            </span>
            <div className="gauge-bar-wrapper">
              <div className="gauge-bar-fill" style={{ width: `${score}%` }}></div>
            </div>
          </div>
        </div>

        {/* Readability Score */}
        <div className="glass-card">
          <span className="gauge-heading">Readability & Grammar</span>
          <h3 className="gauge-subtitle">{readabilityInfo.gradeLevel}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Ease score: <strong>{readabilityInfo.score}/100</strong> ({readabilityInfo.wordCount} words)
          </p>
          <div className="gauge-bar-wrapper">
            <div className="gauge-bar-fill" style={{ width: `${readabilityInfo.score}%`, background: 'var(--accent-blue)' }}></div>
          </div>
        </div>

        {/* Formatting Health */}
        <div className="glass-card">
          <span className="gauge-heading">Formatting Health</span>
          <h3 className="gauge-subtitle">
            {formattingChecks.filter(c => c.status === 'fail').length === 0 
              ? 'ATS Friendly Structure' 
              : `${formattingChecks.filter(c => c.status === 'fail').length} issues flagged`
            }
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Passed {formattingChecks.filter(c => c.status === 'pass').length} out of {formattingChecks.length} checks
          </p>
        </div>
      </div>

      {/* Floating/Action Row */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button className="theme-toggle-btn" onClick={handleDownloadReport} style={{ width: 'auto' }}>
          <span>📥</span> Download Report JSON
        </button>
        <button className="theme-toggle-btn" onClick={handlePrint} style={{ width: 'auto', border: '1px solid var(--accent-purple)' }}>
          <span>🖨️</span> Print PDF Report
        </button>
      </div>

      {/* Profile summary if exists */}
      {summary && (
        <div className="glass-card" style={{ marginBottom: '30px' }}>
          <h4 className="glass-card-title">📝 AI Profile Summary</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>{summary}</p>
        </div>
      )}

      {/* Detailed Analysis Tab Layout */}
      <div className="tab-container">
        <div className="tab-header">
          <button 
            className={`tab-link ${activeTab === 'skillgap' ? 'active' : ''}`}
            onClick={() => setActiveTab('skillgap')}
          >
            🎯 Skill Gap ({missingKeywords.length} Missing)
          </button>
          <button 
            className={`tab-link ${activeTab === 'verbs' ? 'active' : ''}`}
            onClick={() => setActiveTab('verbs')}
          >
            ⚡ Action Verbs & Impact
          </button>
          <button 
            className={`tab-link ${activeTab === 'formatting' ? 'active' : ''}`}
            onClick={() => setActiveTab('formatting')}
          >
            📋 Formatting Checklist
          </button>
          <button 
            className={`tab-link ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            📈 Career progression
          </button>
        </div>

        {/* Tab Contents */}
        <div className="tab-body">
          {/* 1. SKILL GAP ANALYSIS */}
          {activeTab === 'skillgap' && (
            <div className="glass-card">
              <h4 className="glass-card-title">Skill Gap Analysis</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                We compared your resume content against keywords extracted from the job description to find missing credentials.
              </p>

              <div className="skills-list-grid">
                <div>
                  <h5 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--status-success)' }}>
                    ✅ Matched Skills ({matchedKeywords.length})
                  </h5>
                  {matchedKeywords.length === 0 ? (
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>No matched keywords found in job description.</p>
                  ) : (
                    <div className="skill-tag-container">
                      {matchedKeywords.map((skill) => (
                        <span key={skill} className="skill-tag matched">✓ {skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h5 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--status-warning)' }}>
                    ⚠️ Missing Skills ({missingKeywords.length})
                  </h5>
                  {missingKeywords.length === 0 ? (
                    <p style={{ fontSize: '13.5px', color: 'var(--status-success)' }}>No missing keywords detected! Great coverage.</p>
                  ) : (
                    <div className="skill-tag-container">
                      {missingKeywords.map((skill) => (
                        <span key={skill} className="skill-tag missing">✕ {skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions course links */}
              {skillGap.missing && skillGap.missing.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h5 style={{ margin: '0 0 16px', fontSize: '16px' }}>📚 Recommended Learning Resources</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {skillGap.missing.slice(0, 6).map((item) => (
                      <div key={item.skill} className="glass-card" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <span style={{ fontWeight: '600', fontSize: '14.5px', color: 'var(--accent-purple)', textTransform: 'capitalize' }}>
                          {item.skill}
                        </span>
                        <div className="course-suggestions" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                          {item.courses?.map((course, cIdx) => (
                            <a 
                              key={cIdx} 
                              href={course.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="course-link"
                            >
                              🔗 {course.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. ACTION VERBS */}
          {activeTab === 'verbs' && (
            <div className="glass-card">
              <h4 className="glass-card-title">Action Verb & Impact Checker</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                We scanned your resume for weak, passive verbs (like "worked on" or "helped with") and suggest stronger alternatives.
              </p>

              {actionVerbsInfo.issues && actionVerbsInfo.issues.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--status-success)' }}>
                  🎉 Great job! No weak action verbs or passive phrases were flagged in your resume text.
                </div>
              ) : (
                <div className="action-verbs-list">
                  {actionVerbsInfo.issues?.map((issue, idx) => (
                    <div key={idx} className="action-verb-issue">
                      <p className="issue-sentence">
                        "{issue.sentence.replace(
                          new RegExp(`\\b${issue.weakPhrase}\\b`, 'i'),
                          `[MATCH]`
                        ).split('[MATCH]').map((part, pIdx, arr) => (
                          <React.Fragment key={pIdx}>
                            {part}
                            {pIdx < arr.length - 1 && <mark>{issue.weakPhrase}</mark>}
                          </React.Fragment>
                        ))}"
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Suggest replacing with:</span>
                        <div className="issue-suggestions-list">
                          {issue.suggestions?.map((synonym) => (
                            <button 
                              key={synonym} 
                              className="strong-suggestion-pill"
                              onClick={() => handleRewrite(idx, synonym)}
                            >
                              {synonym}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Micro-interaction: Rewriter Preview */}
                      {rewrittenSentences[idx] && (
                        <div 
                          style={{ 
                            marginTop: '12px', 
                            padding: '10px 14px', 
                            borderRadius: '8px', 
                            background: 'var(--status-success-bg)', 
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                            fontSize: '13.5px'
                          }}
                        >
                          <strong style={{ color: 'var(--status-success)' }}>Preview Rewrite:</strong>{' '}
                          <span 
                            dangerouslySetInnerHTML={{ 
                              __html: rewrittenSentences[idx].replace(/\*\*(.*?)\*\*/g, '<b style="color: var(--status-success)">$1</b>') 
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. FORMATTING CHECKLIST */}
          {activeTab === 'formatting' && (
            <div className="glass-card">
              <h4 className="glass-card-title">Formatting & Structure Validator</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                Ensures your document contains required identifiers and meets standard layout guidelines for ATS scanners.
              </p>

              <div className="format-checklist">
                {formattingChecks.map((check) => (
                  <div key={check.id} className="format-check-item">
                    <div className={`format-status-icon ${check.status}`}>
                      {check.status === 'pass' ? '✓' : check.status === 'fail' ? '✕' : '!'}
                    </div>
                    <div className="format-info">
                      <span className="format-name">{check.name}</span>
                      <span className="format-message">{check.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. CAREER PROGRESSION TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="glass-card">
              <h4 className="glass-card-title">Career Progression Insights</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                Chronological representation of roles found in your resume. We assess vertical progression and leadership growth.
              </p>

              {/* Status Header */}
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  background: careerProgression.status === 'Upward' ? 'var(--status-success-bg)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${careerProgression.status === 'Upward' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'}`,
                  marginBottom: '24px'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  Growth Pattern:{' '}
                  <span style={{ color: careerProgression.status === 'Upward' ? 'var(--status-success)' : 'var(--text-primary)' }}>
                    {careerProgression.status || 'Stable'}
                  </span>
                </span>
              </div>

              {/* Growth Signals */}
              {careerProgression.signals && careerProgression.signals.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h5 style={{ margin: '0 0 10px', fontSize: '14.5px', color: 'var(--text-secondary)' }}>Detected Growth Signals:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    {careerProgression.signals.map((signal, sIdx) => (
                      <li key={sIdx} style={{ marginBottom: '6px' }}>{signal}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vertical Timeline */}
              {(!careerProgression.timeline || careerProgression.timeline.length === 0) ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  Could not parse dates or chronological roles from the resume text. 
                  Make sure your resume lists job titles with years (e.g., "Software Developer, 2022 - 2024").
                </div>
              ) : (
                <div className="timeline-wrapper">
                  {careerProgression.timeline.map((node, nIdx) => (
                    <div key={nIdx} className={`timeline-node tier-${node.tier || 2}`}>
                      <div className="timeline-dot" />
                      <div className="timeline-time">{node.year}</div>
                      <div className="timeline-role">{node.title || node.roleLine}</div>
                      <div className="timeline-desc">
                        Level tier: {node.tier === 1 ? 'Internship' : node.tier === 3 ? 'Senior level' : node.tier === 4 ? 'Lead / Management' : node.tier === 5 ? 'Executive / Director' : 'Technical staff'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
