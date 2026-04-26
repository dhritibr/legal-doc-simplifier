const { geminiRequest } = require('../../config/gemini');
const { tagRisks } = require('./riskTagger.service');

const LANGUAGE_NAMES = {
  english:   'English',
  hindi:     'Hindi',
  kannada:   'Kannada',
  tamil:     'Tamil',
  telugu:    'Telugu',
  malayalam: 'Malayalam',
  marathi:   'Marathi',
  bengali:   'Bengali'
};

const DOC_TYPE_CONTEXT = {
  rental:     'residential or commercial rental/lease agreement',
  employment: 'employment or job offer letter',
  loan:       'loan or credit agreement',
  nda:        'non-disclosure or confidentiality agreement',
  service:    'service or vendor agreement',
  other:      'legal document'
};

// clean Gemini response and parse JSON safely
const parseGeminiJSON = (raw) => {
  try {
    let cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const start = cleaned.indexOf('[');
    const end   = cleaned.lastIndexOf(']');

    if (start === -1 || end === -1 || end < start)
      throw new Error('No JSON array found in Gemini response');

    cleaned = cleaned.substring(start, end + 1);

    // fix common JSON issues Gemini sometimes produces
    cleaned = cleaned
      .replace(/,\s*]/g, ']')       // trailing commas in arrays
      .replace(/,\s*}/g, '}')       // trailing commas in objects
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' '); // control characters

    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned invalid JSON — try again: ${err.message}`);
  }
};

// Step 1 — extract and simplify clauses
const extractClauses = async (text, language, documentType) => {
  const langName   = LANGUAGE_NAMES[language] || 'English';
  const docContext = DOC_TYPE_CONTEXT[documentType] || 'legal document';

  // truncate text if too long for Gemini context
  const truncated = text.length > 12000 ? text.substring(0, 12000) + '...' : text;

  const prompt = `
You are a legal document analyst helping ordinary Indian citizens understand their legal documents.

This is a ${docContext}. Analyze it and extract the most important clauses.

Document text:
"""
${truncated}
"""

Instructions:
1. Extract exactly 5 clauses from this document
2. For each clause:
   - Write a short title (max 5 words)
   - Copy the most relevant original sentence or paragraph (max 3 sentences)
   - Write a simplified explanation in simple ${langName} that a person with 10th grade education can understand
   - Assign a risk level: "safe", "warning", or "danger"
   - If warning or danger, explain why in simple ${langName}
3. Risk level guide:
   - safe    = standard clause, no concern
   - warning = needs attention, may have implications
   - danger  = highly unfavorable, one-sided, or potentially exploitative

Respond ONLY with a valid JSON array. No extra text. No markdown. Example format:
[
  {
    "title": "Rent payment date",
    "original": "The tenant shall pay rent on or before the 5th of every month.",
    "simplified": "You must pay rent before the 5th of each month.",
    "riskLevel": "safe",
    "riskReason": ""
  },
  {
    "title": "Early termination penalty",
    "original": "If tenant vacates before lease end, 3 months rent will be forfeited.",
    "simplified": "If you leave before the agreement ends, you will lose 3 months rent.",
    "riskLevel": "danger",
    "riskReason": "Losing 3 months rent is a very heavy penalty. Most fair agreements charge only 1 month."
  }
]
`;

  const raw = await geminiRequest(prompt);
  console.log('RAW GEMINI RESPONSE:', raw.substring(0, 500));
  const clauses = parseGeminiJSON(raw);

  if (!Array.isArray(clauses))
    throw new Error('Gemini clause extraction returned unexpected format');

  return clauses;
};

// Step 2 — generate overall summary
const generateSummary = async (text, language, documentType) => {
  const langName   = LANGUAGE_NAMES[language] || 'English';
  const docContext = DOC_TYPE_CONTEXT[documentType] || 'legal document';
  const truncated  = text.length > 8000 ? text.substring(0, 8000) + '...' : text;

  const prompt = `
You are helping an ordinary Indian citizen understand a legal document.

This is a ${docContext}.

Document text:
"""
${truncated}
"""

Write a clear, simple summary in ${langName} covering:
1. What this document is about (1-2 sentences)
2. The main obligations of each party (2-3 sentences)
3. Key dates, amounts, or deadlines mentioned (1-2 sentences)
4. One overall risk assessment — is this document generally fair, one-sided, or has serious concerns?

Keep the summary under 150 words. Use simple language. Do not use legal jargon.
Write only the summary text — no headings, no bullet points, no JSON.
`;

  return await geminiRequest(prompt);
};

// main function called by document controller
const processDocument = async (text, language, documentType) => {
  try {
    console.log('Extracting clauses...');
    const clauses = await extractClauses(text, language, documentType);

    // wait 8 seconds between calls to avoid rate limiting
    console.log('Waiting before summary call...');
    await new Promise(r => setTimeout(r, 8000));

    console.log('Generating summary...');
    const summary = await generateSummary(text, language, documentType);

    const taggedClauses = tagRisks(clauses);
    return { summary, clauses: taggedClauses };

  } catch (err) {
    throw new Error(`Gemini processing failed: ${err.message}`);
  }
};

module.exports = { processDocument };