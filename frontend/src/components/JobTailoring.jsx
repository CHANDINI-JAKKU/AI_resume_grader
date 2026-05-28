import React, { useState } from 'react'
import { addJobAnalysis } from '../services/api'

export default function JobTailoring({ resumeId, analyses = [], activeAnalysis, onSelectAnalysis, onAddAnalysis }) {
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobDescription.trim()) {
      setError('Job description is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const title = jobTitle.trim() || 'Software Engineer Position'
      const data = await addJobAnalysis(resumeId, title, jobDescription)
      
      // Reset form
      setJobTitle('')
      setJobDescription('')
      setShowForm(false)

      if (onAddAnalysis) {
        onAddAnalysis(data.analyses, data.activeAnalysis)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to analyze job description')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="job-tailoring-root">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', margin: 0 }}>🎯 Job-Specific Tailoring</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: '4px 0 0' }}>
            Test your resume against different job descriptions to see how your score changes.
          </p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ padding: '10px 20px', fontSize: '14.5px' }}>
            + Test New Job
          </button>
        )}
      </div>

      {error && <div className="glass-card" style={{ background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger)', color: 'var(--status-danger)', padding: '14px 20px', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}

      {/* New Job Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card accent-glow" style={{ marginBottom: '30px' }}>
          <h3 className="glass-card-title">Test against New Job Description</h3>
          
          <div className="form-group">
            <label>Job Title / Company name:</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Frontend Engineer at Google"
              value={jobTitle} 
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Paste Job Description:</label>
            <textarea 
              className="form-control" 
              rows={8}
              placeholder="Paste the full job details, required skills, and duties here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Analyzing...' : 'Run Match Analysis'}
            </button>
            <button type="button" className="theme-toggle-btn" style={{ width: 'auto' }} onClick={() => setShowForm(false)} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grid of tested jobs */}
      <h3 className="glass-card-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Tested Positions ({analyses.length})</h3>
      {analyses.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't tested this resume against any job description yet.</p>
          <button className="theme-toggle-btn" onClick={() => setShowForm(true)} style={{ width: 'auto', margin: '15px auto 0' }}>
            Test Your First Job Description
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {analyses.map((an) => {
            const isActive = activeAnalysis && activeAnalysis._id === an._id
            return (
              <div 
                key={an._id} 
                className="glass-card" 
                style={{ 
                  cursor: 'pointer',
                  border: isActive ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                  boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                  background: isActive ? 'var(--accent-purple-glow)' : 'var(--bg-glass)'
                }}
                onClick={() => onSelectAnalysis(an)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', textTransform: 'capitalize' }}>
                    {an.jobTitle}
                  </h4>
                  <span 
                    style={{ 
                      fontSize: '15px', 
                      fontWeight: '800', 
                      background: an.score >= 80 ? 'var(--status-success-bg)' : an.score >= 60 ? 'var(--status-warning-bg)' : 'var(--status-danger-bg)',
                      color: an.score >= 80 ? 'var(--status-success)' : an.score >= 60 ? 'var(--status-warning)' : 'var(--status-danger)',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {an.score}% Match
                  </span>
                </div>
                
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '12px' }}>
                  {an.jobDescription}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Tested {new Date(an.createdAt).toLocaleDateString()}</span>
                  {isActive && <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>Active View</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
