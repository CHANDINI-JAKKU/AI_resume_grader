import React from 'react'

export default function Results({ result }) {
  if (!result) return null

  const { atsScore, matchedKeywords = [], suggestions = [], summary } = result

  return (
    <div className="results">
      <h2>Analysis Results</h2>
      {typeof atsScore === 'number' && (
        <div className="score">ATS score: {Math.round(atsScore)}</div>
      )}

      {summary && (
        <section>
          <h3>Summary</h3>
          <p>{summary}</p>
        </section>
      )}

      <section>
        <h3>Matched Keywords</h3>
        {matchedKeywords.length === 0 ? (
          <p>No matching keywords found.</p>
        ) : (
          <ul>
            {matchedKeywords.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Suggestions</h3>
        {suggestions.length === 0 ? (
          <p>No suggestions.</p>
        ) : (
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
