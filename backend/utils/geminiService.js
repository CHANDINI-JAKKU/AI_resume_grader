import axios from 'axios';

/**
 * Call Google Gemini API to analyze the resume and job description.
 * Uses standard HTTP requests via Axios to avoid heavy third-party library dependencies.
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @returns {Promise<object|null>} The parsed analysis results or null if API is disabled or fails.
 */
export const analyzeWithGemini = async (resumeText, jobDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.log('Gemini API: GEMINI_API_KEY is not set. Using local analysis engine.');
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert ATS (Applicant Tracking System) parser and professional career advisor.
Analyze the following resume against the job description.

RESUME TEXT:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Your task is to review the resume and provide feedback. You MUST return a JSON object containing the exact structure below. 
Do not include any backticks (like \`\`\`json), markdown formatting, or trailing text. Return ONLY the raw JSON string.

JSON Structure:
{
  "atsScore": 75, // integer from 0 to 100
  "summary": "A concise 2-sentence summary of the candidate's fit.",
  "grammarIssues": [
    {
      "sentence": "The original sentence with error.",
      "issue": "Explanation of the typo, grammar issue, or passive tone.",
      "correction": "The corrected sentence."
    }
  ],
  "actionVerbIssues": [
    {
      "sentence": "Original sentence with weak verb.",
      "weakPhrase": "worked on", // the weak phrase found
      "suggestions": ["spearheaded", "engineered", "led"] // strong action verbs
    }
  ],
  "careerInsights": {
    "status": "Upward", // Upward, Stable, or Transitioning
    "signals": [
      "Promoted from Intern to Software Engineer within 1 year.",
      "Demonstrates leadership by mentoring junior staff."
    ],
    "timeline": [
      {
        "roleLine": "Software Engineer at Google (2022 - Present)",
        "title": "Software Engineer",
        "tier": 3, // 1: Intern, 2: Junior/Mid, 3: Senior, 4: Lead/Manager, 5: Executive
        "year": "2022"
      }
    ]
  }
}
`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      console.warn('Gemini API: Received empty response from model.');
      return null;
    }

    // Parse the response text
    const cleanText = candidateText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
    const result = JSON.parse(cleanText);
    return result;
  } catch (error) {
    console.error('Gemini API Call Failed:', error.response?.data || error.message);
    return null;
  }
};
