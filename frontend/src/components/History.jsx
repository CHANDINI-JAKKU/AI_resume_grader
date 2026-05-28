import React, { useEffect, useState } from 'react'
import { getHistory } from '../services/api'

export default function History({ onSelect, refreshTrigger }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getHistory()
      .then((data) => {
        if (mounted) setItems(data)
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load history')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [refreshTrigger]) // Refetch whenever parent triggers a refresh (e.g. after uploading a new resume)

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading history…</div>
  if (error) return <div className="error">{error}</div>

  if (!items || items.length === 0) {
    return (
      <div className="glass-card text-center" style={{ padding: '30px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No history found. Try uploading a resume!</p>
      </div>
    )
  }

  return (
    <div className="history-root">
      <h3 className="glass-card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
        📂 Previous Analyses
      </h3>
      
      <div className="history-list">
        {items.map((it) => (
          <button 
            key={it._id} 
            className="history-item"
            onClick={() => onSelect && onSelect(it)}
          >
            <div className="history-info">
              <span className="history-name">{it.candidateName || 'Candidate'}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                📄 {it.filename || 'text-input'}
              </span>
              <span className="history-date">
                {new Date(it.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="history-score-badge">
              {it.score ?? it.atsScore ?? '—'}%
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
