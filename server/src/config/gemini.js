const axios = require('axios');

const geminiRequest = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const res = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:     0.3,
          maxOutputTokens: 8192
        }
      });

      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text;

    } catch (err) {
      const status = err.response?.status;

      // retry on 503 (overloaded) and 429 (rate limit)
      if ((status === 503 || status === 429) && attempt < retries) {
        const wait = attempt * 5000; // 5s, 10s, 15s
        console.log(`Gemini ${status} — retrying in ${wait/1000}s (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (status === 404) throw new Error('Gemini model not found — check your API key');
      if (status === 429) throw new Error('Gemini rate limit hit — please wait and try again');
      if (status === 503) throw new Error('Gemini is temporarily overloaded — please try again in a moment');
      if (status === 400) throw new Error('Gemini API error — document may be too large');
      if (status === 403) throw new Error('Gemini API key invalid or not authorized');
      throw new Error(`Gemini API error: ${err.message}`);
    }
  }
};

module.exports = { geminiRequest };