import React, { useEffect, useState } from 'react'
import { getLeaderboard } from '../services/api'

export default function Gamification({ activeAnalysis }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getLeaderboard()
      .then((data) => {
        if (mounted) setLeaderboard(data)
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load leaderboard')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [activeAnalysis]) // Refresh leaderboard whenever the active analysis changes (e.g. score changes)

  // Determine which badges are unlocked based on activeAnalysis
  const checkBadgeUnlocked = (badgeId) => {
    if (!activeAnalysis) return false
    
    const {
      score = 0,
      matchedKeywords = [],
      actionVerbsInfo = { issues: [] },
      formattingChecks = [],
      readabilityInfo = { score: 0 },
      careerProgression = { status: 'Stable' }
    } = activeAnalysis

    switch (badgeId) {
      case 'ats-champion':
        return score >= 85
      case 'action-hero':
        return actionVerbsInfo.issues?.length === 0
      case 'keyword-marksman':
        return matchedKeywords.length >= 5
      case 'format-approved':
        return formattingChecks.length > 0 && formattingChecks.filter(c => c.status === 'fail').length === 0
      case 'eloquent-author':
        return readabilityInfo.score >= 60 && readabilityInfo.score <= 80
      case 'career-ascender':
        return careerProgression.status === 'Upward'
      default:
        return false
    }
  }

  const badges = [
    {
      id: 'ats-champion',
      name: 'ATS Champion',
      desc: 'Achieve an ATS Match Score of 85% or higher.',
      icon: '🏆'
    },
    {
      id: 'action-hero',
      name: 'Action Hero',
      desc: 'Have zero weak action verbs or passive phrases.',
      icon: '⚡'
    },
    {
      id: 'keyword-marksman',
      name: 'Keyword Marksman',
      desc: 'Match 5 or more required keywords from description.',
      icon: '🎯'
    },
    {
      id: 'format-approved',
      name: 'Format Approved',
      desc: 'Pass all ATS formatting layout rules.',
      icon: '🛠️'
    },
    {
      id: 'eloquent-author',
      name: 'Eloquent Author',
      desc: 'Readability Ease is in the perfect professional zone (60-80).',
      icon: '✍️'
    },
    {
      id: 'career-ascender',
      name: 'Career Ascender',
      desc: 'Detect upward career growth or management trajectory.',
      icon: '📈'
    }
  ]

  const unlockedCount = badges.filter(b => checkBadgeUnlocked(b.id)).length

  return (
    <div className="gamification-root">
      {/* Top Header stats */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', margin: 0 }}>🏆 Gamification & Rewards</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: '4px 0 0' }}>
          Collect badges and climb the class leaderboard by optimizing your resume.
        </p>
      </div>

      {/* Badges showcase */}
      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <h3 className="glass-card-title" style={{ justifyContent: 'space-between' }}>
          <span>🏅 Unlocked Badges</span>
          <span style={{ fontSize: '14.5px', color: 'var(--accent-purple)', fontWeight: '700' }}>
            {unlockedCount} / {badges.length} Unlocked
          </span>
        </h3>
        
        <div className="badges-grid">
          {badges.map((badge) => {
            const isUnlocked = checkBadgeUnlocked(badge.id)
            return (
              <div 
                key={badge.id} 
                className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                title={badge.desc}
              >
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
                <span className="badge-desc">{badge.desc}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Class Leaderboard */}
      <div className="glass-card">
        <h3 className="glass-card-title">👥 Student ATS Leaderboard</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Loading Leaderboard...</div>
        ) : error ? (
          <div style={{ color: 'var(--status-danger)', padding: '10px' }}>{error}</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No student submissions yet. Climb the rankings first!</div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate Name</th>
                <th>Target Job</th>
                <th style={{ textAlign: 'center' }}>Badges</th>
                <th style={{ textAlign: 'right' }}>ATS Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((student, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`rank-badge rank-${student.rank}`}>
                      {student.rank <= 3 ? '' : student.rank}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{student.candidateName}</td>
                  <td style={{ textTransform: 'capitalize', fontSize: '13.5px' }}>{student.jobTitle}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: 'var(--accent-purple-glow)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {student.badgesUnlocked} 🏅
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: student.score >= 80 ? 'var(--status-success)' : student.score >= 60 ? 'var(--status-warning)' : 'var(--text-primary)' }}>
                    {student.score}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
