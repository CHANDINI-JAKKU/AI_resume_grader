import React, { useState, useEffect } from 'react'
import ResumeUploader from './components/ResumeUploader.jsx'
import Dashboard from './components/Dashboard.jsx'
import History from './components/History.jsx'
import JobTailoring from './components/JobTailoring.jsx'
import Gamification from './components/Gamification.jsx'
import { getResumeDetail } from './services/api'

export default function App() {
  const [activeTab, setActiveTab] = useState('upload') // Default tab is Upload
  const [activeResume, setActiveResume] = useState(null)
  const [activeAnalysis, setActiveAnalysis] = useState(null)
  const [refreshHistory, setRefreshHistory] = useState(0)
  
  // Theme state
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Handle a new upload result or history selection
  const handleResumeSelect = async (item) => {
    try {
      const id = item._id || item.resumeId
      if (!id) return

      const detailedData = await getResumeDetail(id)
      
      setActiveResume(detailedData)
      
      // Default to the first (most recent) analysis
      if (detailedData.analyses && detailedData.analyses.length > 0) {
        setActiveAnalysis(detailedData.analyses[0])
      } else {
        setActiveAnalysis(null)
      }
      
      // Navigate to dashboard tab
      setActiveTab('dashboard')
    } catch (err) {
      console.error('Failed to load resume details:', err.message)
    }
  }

  const handleUploadResult = (result) => {
    // Refresh history list
    setRefreshHistory(prev => prev + 1)
    
    // Select the newly uploaded resume
    handleResumeSelect(result)
  }

  // Handle addition of a new job analysis (Job Tailoring)
  const handleAddAnalysis = (updatedAnalyses, newActiveAnalysis) => {
    setActiveResume(prev => ({
      ...prev,
      analyses: updatedAnalyses
    }))
    setActiveAnalysis(newActiveAnalysis)
    setRefreshHistory(prev => prev + 1)
    
    // Redirect to dashboard to see results
    setActiveTab('dashboard')
  }

  // Handle manual select of a different job description
  const handleSelectAnalysis = (analysis) => {
    setActiveAnalysis(analysis)
    setActiveTab('dashboard')
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="logo-section">
            <div className="logo-icon">R</div>
            <span className="logo-text">Resume Grader</span>
          </div>

          <nav className="nav-links">
            <button 
              className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <span className="nav-icon">📤</span>
              <span>Upload & Grade</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              disabled={!activeResume}
              style={{ opacity: activeResume ? 1 : 0.5, cursor: activeResume ? 'pointer' : 'not-allowed' }}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard Analysis</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'tailoring' ? 'active' : ''}`}
              onClick={() => setActiveTab('tailoring')}
              disabled={!activeResume}
              style={{ opacity: activeResume ? 1 : 0.5, cursor: activeResume ? 'pointer' : 'not-allowed' }}
            >
              <span className="nav-icon">🎯</span>
              <span>Job Tailoring</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'gamification' ? 'active' : ''}`}
              onClick={() => setActiveTab('gamification')}
            >
              <span className="nav-icon">🏆</span>
              <span>Badges & Ranking</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="nav-icon">📂</span>
              <span>History</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        {/* Dynamic Header */}
        <header className="content-header">
          <div className="header-title-section">
            <h1>
              {activeTab === 'upload' && 'Upload Resume'}
              {activeTab === 'dashboard' && 'ATS Analysis Dashboard'}
              {activeTab === 'tailoring' && 'Job Description Tailoring'}
              {activeTab === 'gamification' && 'Student Gamification Center'}
              {activeTab === 'history' && 'Resume Submission History'}
            </h1>
            <p>
              {activeTab === 'upload' && 'Upload your PDF resume to run standard parser tests.'}
              {activeTab === 'dashboard' && 'Review your keywords coverage, formatting scores, and active suggestions.'}
              {activeTab === 'tailoring' && 'Compare your single resume against different job requirements.'}
              {activeTab === 'gamification' && 'Compete on scores, unlock achievement badges, and grade details.'}
              {activeTab === 'history' && 'Browse, select, and inspect previously graded resumes.'}
            </p>
          </div>

          {activeResume && (
            <div className="active-resume-badge">
              <div className="active-info">
                <span className="label">Active Resume</span>
                <div className="name">{activeResume.candidateName}</div>
              </div>
              
              {/* Dropdown Selector for Tailored Jobs */}
              {activeResume.analyses && activeResume.analyses.length > 0 && (
                <div style={{ marginLeft: '10px' }}>
                  <span className="label" style={{ display: 'block', fontSize: '10px' }}>Selected Target Job</span>
                  <select 
                    value={activeAnalysis?._id || ''} 
                    onChange={(e) => {
                      const sel = activeResume.analyses.find(a => a._id === e.target.value)
                      if (sel) handleSelectAnalysis(sel)
                    }}
                    className="form-control"
                    style={{ padding: '6px 12px', fontSize: '13px', width: 'auto', background: 'var(--bg-glass-hover)' }}
                  >
                    {activeResume.analyses.map(a => (
                      <option key={a._id} value={a._id}>
                        {a.jobTitle} ({a.score}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Tab Body Render */}
        <section className="tab-render-area">
          {activeTab === 'upload' && (
            <ResumeUploader onResult={handleUploadResult} />
          )}

          {activeTab === 'dashboard' && activeResume && (
            <Dashboard 
              activeAnalysis={activeAnalysis} 
              candidateName={activeResume.candidateName}
              filename={activeResume.filename}
            />
          )}

          {activeTab === 'tailoring' && activeResume && (
            <JobTailoring 
              resumeId={activeResume._id}
              analyses={activeResume.analyses}
              activeAnalysis={activeAnalysis}
              onSelectAnalysis={handleSelectAnalysis}
              onAddAnalysis={handleAddAnalysis}
            />
          )}

          {activeTab === 'gamification' && (
            <Gamification activeAnalysis={activeAnalysis} />
          )}

          {activeTab === 'history' && (
            <History 
              onSelect={handleResumeSelect} 
              refreshTrigger={refreshHistory} 
            />
          )}
        </section>
      </main>
    </div>
  )
}
