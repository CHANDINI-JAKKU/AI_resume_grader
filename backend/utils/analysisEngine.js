// Local Resume Analytics Engine
// Implements local heuristic scoring and rules for ATS grading.

const COMMON_SKILLS = {
  // Front-end
  'javascript': [
    { name: 'freeCodeCamp JavaScript Course (Free)', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' },
    { name: 'MDN Web Docs - JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }
  ],
  'react': [
    { name: 'Official React Documentation (Free)', url: 'https://react.dev/learn' },
    { name: 'Scrimba Learn React Course (Free)', url: 'https://scrimba.com/learn/learnreact' }
  ],
  'vue': [{ name: 'Vue.js official Guide', url: 'https://vuejs.org/guide/introduction.html' }],
  'angular': [{ name: 'Angular.dev Official Guide', url: 'https://angular.dev/' }],
  'typescript': [{ name: 'TypeScript Handbook (Free)', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' }],
  'html': [{ name: 'W3Schools HTML Tutorial', url: 'https://www.w3schools.com/html/' }],
  'css': [{ name: 'MDN CSS Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics' }],
  'tailwind': [{ name: 'Tailwind CSS Documentation', url: 'https://tailwindcss.com/docs' }],
  'next.js': [{ name: 'Next.js Learning Dashboard', url: 'https://nextjs.org/learn' }],
  
  // Back-end & DB
  'node': [{ name: 'Node.js official Guides', url: 'https://nodejs.org/en/docs/guides' }],
  'express': [{ name: 'Express.js Getting Started', url: 'https://expressjs.com/en/starter/installing.html' }],
  'python': [
    { name: 'Kaggle Python Course (Free)', url: 'https://www.kaggle.com/learn/python' },
    { name: 'Python.org Beginners Guide', url: 'https://www.python.org/about/gettingstarted/' }
  ],
  'django': [{ name: 'Django Girls Tutorial', url: 'https://tutorial.djangogirls.org/' }],
  'flask': [{ name: 'Flask Documentation Tutorial', url: 'https://flask.palletsprojects.com/en/stable/tutorial/' }],
  'java': [{ name: 'Java Programming on Codecademy', url: 'https://www.codecademy.com/learn/learn-java' }],
  'spring': [{ name: 'Spring Boot Guide', url: 'https://spring.io/guides/gs/spring-boot/' }],
  'go': [{ name: 'A Tour of Go (Interactive)', url: 'https://go.dev/tour/' }],
  'rust': [{ name: 'The Rust Programming Language Book', url: 'https://doc.rust-lang.org/book/' }],
  'sql': [
    { name: 'SQLZoo Interactive Exercises', url: 'https://sqlzoo.net/' },
    { name: 'W3Schools SQL Tutorial', url: 'https://www.w3schools.com/sql/' }
  ],
  'mongodb': [{ name: 'MongoDB University Courses', url: 'https://learn.mongodb.com/' }],
  'postgresql': [{ name: 'Postgres Tutorial for Beginners', url: 'https://www.postgresqltutorial.com/' }],
  'graphql': [{ name: 'How to GraphQL Tutorial', url: 'https://www.howtographql.com/' }],
  'docker': [{ name: 'Docker Curriculum for Beginners', url: 'https://docker-curriculum.com/' }],
  'kubernetes': [{ name: 'Kubernetes Basics Tutorial', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' }],
  
  // General & Process
  'git': [{ name: 'GitHub Skills Interactive course', url: 'https://skills.github.com/' }],
  'ci/cd': [{ name: 'Red Hat CI/CD Guide', url: 'https://www.redhat.com/en/topics/devops/what-is-ci-cd' }],
  'aws': [{ name: 'AWS Cloud Practitioner Essentials', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/' }],
  'azure': [{ name: 'Microsoft Learn Azure Fundamentals', url: 'https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/' }],
  'gcp': [{ name: 'Google Cloud Skills Boost', url: 'https://www.cloudskillsboost.google/' }],
  'agile': [{ name: 'Atlassian Agile Coach Guide', url: 'https://www.atlassian.com/agile' }],
  'scrum': [{ name: 'Scrum Alliance Resource Library', url: 'https://www.scrumalliance.org/learn-about-scrum' }],
  'figma': [{ name: 'Figma for Beginners Course', url: 'https://www.figma.com/resource-library/figma-for-beginners/' }],
  'machine learning': [{ name: 'Coursera Machine Learning Specialization (Audit)', url: 'https://www.coursera.org/specializations/machine-learning-introduction' }],
  'data science': [{ name: 'Kaggle Intro to Data Science', url: 'https://www.kaggle.com/learn' }]
};

// Syllable counting algorithm
export const countSyllables = (word) => {
  let w = word.toLowerCase().trim();
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  w = w.replace(/^y/, '');
  const vowelGroups = w.match(/[aeiouy]{1,2}/g);
  return vowelGroups ? vowelGroups.length : 1;
};

// Flesch-Kincaid Readability Calculation
export const calculateReadability = (text) => {
  if (!text || text.trim().length === 0) {
    return { score: 0, gradeLevel: 'N/A', wordCount: 0, sentenceCount: 0 };
  }

  // Parse words and sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.match(/[a-zA-Z0-9']+/g)?.filter(w => w.length > 0) || [];
  
  if (words.length === 0 || sentences.length === 0) {
    return { score: 100, gradeLevel: 'Easy', wordCount: words.length, sentenceCount: sentences.length };
  }

  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  // Flesch-Kincaid formula
  let score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  score = Math.round(Math.max(0, Math.min(100, score)));

  let gradeLevel = 'Graduate Level';
  if (score >= 90) gradeLevel = '5th Grade (Very Easy)';
  else if (score >= 80) gradeLevel = '6th Grade (Easy)';
  else if (score >= 70) gradeLevel = '7th Grade (Fairly Easy)';
  else if (score >= 60) gradeLevel = '8th & 9th Grade (Standard)';
  else if (score >= 50) gradeLevel = '10th to 12th Grade (Fairly Difficult)';
  else if (score >= 30) gradeLevel = 'College Level (Difficult)';

  return {
    score,
    gradeLevel,
    wordCount: words.length,
    sentenceCount: sentences.length
  };
};

// Weak phrases and active alternative suggestions
const WEAK_PHRASES = {
  'worked on': ['led', 'engineered', 'developed', 'implemented', 'orchestrated'],
  'helped with': ['collaborated on', 'facilitated', 'orchestrated', 'contributed to'],
  'assisted in': ['supported', 'co-authored', 'contributed to', 'strengthened'],
  'responsible for': ['headed', 'managed', 'executed', 'implemented', 'supervised'],
  'handled': ['managed', 'coordinated', 'streamlined', 'oversaw'],
  'did': ['performed', 'executed', 'conducted', 'accomplished'],
  'made': ['created', 'produced', 'formulated', 'designed'],
  'took care of': ['managed', 'oversaw', 'supervised', 'administered'],
  'helped to': ['spearheaded', 'facilitated', 'drove', 'guided'],
  'part of': ['partnered in', 'collaborated with', 'contributed to']
};

export const checkActionVerbs = (text) => {
  if (!text) return { score: 100, issues: [] };

  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 10);
  const issues = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    for (const [weak, strongList] of Object.entries(WEAK_PHRASES)) {
      const regex = new RegExp(`\\b${weak}\\b`, 'i');
      if (regex.test(trimmed)) {
        issues.push({
          sentence: trimmed,
          weakPhrase: weak,
          suggestions: strongList
        });
        break; // Only trigger one issue per sentence to keep suggestions readable
      }
    }
  }

  // Deduct 15 points per issue, minimum score 30
  const score = Math.max(30, 100 - (issues.length * 15));

  return {
    score,
    issues
  };
};

// Formatting Rules Validator
export const validateFormatting = (text) => {
  if (!text) return [];

  const checks = [];

  // 1. Email check
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  checks.push({
    id: 'email',
    name: 'Email Contact Information',
    status: hasEmail ? 'pass' : 'fail',
    message: hasEmail 
      ? 'Valid email address detected.' 
      : 'No email address found. Contact information is crucial for ATS parsing.'
  });

  // 2. Phone check
  const hasPhone = /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/.test(text);
  checks.push({
    id: 'phone',
    name: 'Phone Number Info',
    status: hasPhone ? 'pass' : 'fail',
    message: hasPhone 
      ? 'Phone number detected.' 
      : 'No phone number found. Standard resumes require contact details.'
  });

  // 3. Word Count check
  const words = text.match(/[a-zA-Z0-9']+/g)?.length || 0;
  let wordStatus = 'pass';
  let wordMsg = `Word count is ${words} (ideal length: 400 - 800 words).`;
  if (words < 300) {
    wordStatus = 'warning';
    wordMsg = `Word count is too short (${words} words). A professional resume should contain at least 300-400 words.`;
  } else if (words > 1000) {
    wordStatus = 'warning';
    wordMsg = `Word count is long (${words} words). Ensure it fits on 1-2 pages and remains concise.`;
  }
  checks.push({
    id: 'word-count',
    name: 'Resume Length & Word Density',
    status: wordStatus,
    message: wordMsg
  });

  // 4. Social Links check
  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasGitHub = /github\.com/i.test(text);
  checks.push({
    id: 'socials',
    name: 'Professional Portfolios (LinkedIn/GitHub)',
    status: (hasLinkedIn || hasGitHub) ? 'pass' : 'warning',
    message: (hasLinkedIn && hasGitHub)
      ? 'LinkedIn and GitHub links both detected.'
      : (hasLinkedIn || hasGitHub)
        ? 'One professional profile link detected. Consider adding both LinkedIn and GitHub.'
        : 'No LinkedIn or GitHub profiles found. ATS systems look for these portfolio links.'
  });

  // 5. Columns/Tables layout check (Check for double spaces or tabs indicating column layouts)
  const tabsCount = (text.match(/\t/g) || []).length;
  const multiSpaces = (text.match(/ {3,}/g) || []).length;
  const isUnfriendlyLayout = tabsCount > 5 || multiSpaces > 15;
  checks.push({
    id: 'layout',
    name: 'ATS-Friendly Structure & Layout',
    status: isUnfriendlyLayout ? 'warning' : 'pass',
    message: isUnfriendlyLayout
      ? 'Detected potential multi-column tables or nested structures. ATS parsers prefer simple, single-column chronological layouts.'
      : 'Layout structures look clean. No unfriendly multi-column tables detected.'
  });

  return checks;
};

// Skill Gap Analysis
export const analyzeSkillGap = (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) {
    return { matched: [], missing: [] };
  }

  const rTextLower = resumeText.toLowerCase();
  const jTextLower = jobDescription.toLowerCase();
  
  // Find all skills listed in the job description
  const skillList = Object.keys(COMMON_SKILLS);
  const matched = [];
  const missing = [];

  for (const skill of skillList) {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(jTextLower)) {
      if (regex.test(rTextLower)) {
        matched.push(skill);
      } else {
        missing.push({
          skill,
          courses: COMMON_SKILLS[skill]
        });
      }
    }
  }

  // Fallback missing keywords that might not be in our database
  // Extract custom keywords from Job Description that are missing in Resume
  const jobTokens = jobDescription.toLowerCase().match(/[a-z]{3,}/g) || [];
  const resumeTokens = new Set(resumeText.toLowerCase().match(/[a-z]{3,}/g) || []);
  
  // Stopwords to filter
  const stopwords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'have', 'will', 'requirement', 'requirements', 'must', 'should', 'experience', 'year', 'years', 'working', 'ability', 'degree', 'computer', 'science', 'development']);
  
  const customMissing = [];
  const processed = new Set();
  
  for (const token of jobTokens) {
    if (!resumeTokens.has(token) && !stopwords.has(token) && !processed.has(token)) {
      processed.add(token);
      // Only flag if it appears 2 or more times in Job Description (indicates importance)
      const count = jobTokens.filter(t => t === token).length;
      if (count >= 2 && !skillList.includes(token)) {
        customMissing.push(token);
      }
    }
  }

  // Add custom missing keywords
  for (const skill of customMissing.slice(0, 5)) {
    missing.push({
      skill,
      courses: [
        { name: `Google search for free ${skill} courses`, url: `https://www.google.com/search?q=free+${encodeURIComponent(skill)}+courses` },
        { name: `YouTube tutorials on ${skill}`, url: `https://www.youtube.com/results?search_query=free+${encodeURIComponent(skill)}+tutorial` }
      ]
    });
  }

  return {
    matched,
    missing
  };
};

// Career Progression insights
export const detectCareerProgression = (text) => {
  if (!text) return { status: 'Unknown', timeline: [], signals: [] };

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Common job title keywords
  const titleKeywords = [
    'intern', 'trainee', 'developer', 'engineer', 'analyst', 'consultant', 
    'specialist', 'designer', 'lead', 'senior', 'manager', 'director', 
    'head', 'vp', 'vice president', 'founder', 'architect'
  ];

  // Regex to detect years (e.g. 2018 - 2021, 2022-Present, 2023)
  const dateRegex = /\b(19|20)\d{2}\b/;

  const timeline = [];
  const signals = [];

  for (const line of lines) {
    // Check if the line contains a job title keyword AND a date
    const hasTitle = titleKeywords.some(t => new RegExp(`\\b${t}\\b`, 'i').test(line));
    const hasDate = dateRegex.test(line);

    if (hasTitle && hasDate) {
      // Find the matched title keyword to assign a tier
      let matchedKeyword = 'engineer';
      for (const kw of titleKeywords) {
        if (new RegExp(`\\b${kw}\\b`, 'i').test(line)) {
          matchedKeyword = kw;
          break;
        }
      }

      // Assign a tier score for progression
      let tier = 2; // Mid level default
      if (['intern', 'trainee'].includes(matchedKeyword)) tier = 1;
      else if (['senior', 'architect', 'specialist'].includes(matchedKeyword)) tier = 3;
      else if (['lead', 'manager'].includes(matchedKeyword)) tier = 4;
      else if (['director', 'head', 'vp', 'president', 'founder'].includes(matchedKeyword)) tier = 5;

      timeline.push({
        roleLine: line,
        title: line.split(/[, \t-]/)[0].trim(),
        tier,
        year: line.match(dateRegex)[0]
      });
    }
  }

  // Sort timeline chronologically (earliest first)
  timeline.sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // Analyze progression
  let progressionStatus = 'Stable';
  let growthDetected = false;

  if (timeline.length > 1) {
    let growthSteps = 0;
    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].tier > timeline[i-1].tier) {
        growthSteps++;
      }
    }

    if (growthSteps > 0) {
      progressionStatus = 'Upward';
      growthDetected = true;
      signals.push(`Upward career growth detected: transitioned into higher level roles.`);
    }
  }

  // Leadership signals
  const leadershipKeywords = ['led', 'managed', 'supervised', 'mentored', 'headed', 'scaled team', 'coordinated'];
  let leadershipCount = 0;
  for (const kw of leadershipKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text)) {
      leadershipCount++;
    }
  }

  if (leadershipCount >= 2) {
    signals.push('Strong leadership signals found: text contains project oversight and team leadership terms.');
  }

  if (timeline.some(t => t.tier >= 4)) {
    signals.push('Management/Lead role detected: resume shows experience in a senior authority role.');
  }

  if (signals.length === 0) {
    signals.push('Consistent technical path: stable role responsibilities.');
  }

  return {
    status: progressionStatus,
    timeline,
    signals
  };
};
