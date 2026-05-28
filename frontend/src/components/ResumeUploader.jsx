import React, { useState } from 'react'
import { uploadResume } from '../services/api'

export default function ResumeUploader({ onResult }) {
  const [file, setFile] = useState(null)
  const [candidateName, setCandidateName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await uploadResume(file, jobDescription, jobTitle, candidateName)
      
      // Clear inputs
      setFile(null)
      setCandidateName('')
      setJobTitle('')
      setJobDescription('')
      
      // Update parent component
      if (onResult) {
        onResult(result)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload and analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card uploader-card accent-glow">
      <h3 className="glass-card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
        📤 Grade Your Resume
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Jane Doe"
            value={candidateName} 
            onChange={(e) => setCandidateName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Target Job Title:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Frontend developer at Stripe"
            value={jobTitle} 
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Target Job Description:</label>
          <textarea 
            className="form-control" 
            rows={5}
            placeholder="Paste the full job requirements or duties here..."
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Upload Resume (PDF):</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFile}
              style={{ display: 'none' }}
              id="pdf-upload-input"
              required
            />
            <label 
              htmlFor="pdf-upload-input" 
              className="form-input-file"
              style={{ display: 'block' }}
            >
              {file ? `📄 ${file.name}` : '📁 Choose PDF Resume file'}
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Analyzing Resume...' : 'Analyze & Grade ATS Score'}
        </button>

        {error && (
          <div 
            style={{ 
              marginTop: '15px', 
              color: 'var(--status-danger)', 
              background: 'var(--status-danger-bg)', 
              padding: '10px 14px', 
              borderRadius: '8px', 
              fontSize: '13.5px',
              border: '1px solid rgba(239, 68, 68, 0.15)' 
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </form>
    </div>
  )
}
