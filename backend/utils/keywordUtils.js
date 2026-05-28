const stopwords = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'your',
  'have',
  'will',
  'skill',
  'skills',
  'experience',
  'years',
  'work',
  'education',
  'project',
  'projects',
  'role',
  'using',
  'use',
  'you',
  'are',
  'able',
  'also',
])

export const extractKeywords = (text) => {
  if (!text) {
    return []
  }

  const tokens = text
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((token) => token.length > 2 && !stopwords.has(token)) || []

  const frequency = tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1
    return acc
  }, {})

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word)
}

export const calculateScore = (resumeKeywords, jobKeywords) => {
  if (!jobKeywords.length) {
    return 0
  }

  const matchCount = resumeKeywords.filter((keyword) =>
    jobKeywords.includes(keyword)
  ).length

  return Math.round((matchCount / jobKeywords.length) * 100)
}

export const generateSuggestions = (resumeKeywords, jobKeywords) => {
  const missingKeywords = jobKeywords.filter(
    (keyword) => !resumeKeywords.includes(keyword)
  )

  if (!missingKeywords.length) {
    return ['Resume keyword coverage looks strong.']
  }

  return [
    `Add or emphasize these keywords: ${missingKeywords.slice(0, 10).join(', ')}`,
    'Focus on matching the job description terms in your experience bullets.',
  ]
}
