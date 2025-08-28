// routes/sentiment.js
const express = require('express');
const router = express.Router();

const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT?.replace(/\/+$/, ''); // trim trailing /
const key = process.env.AZURE_LANGUAGE_KEY;
const region = process.env.AZURE_LANGUAGE_REGION || 'eastus';

router.post('/', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Provide "text" in the request body.' });
    }

    const url = `${endpoint}/language/:analyze-text?api-version=2023-04-01`;
    const payload = {
      kind: "SentimentAnalysis",
      analysisInput: {
        documents: [{ id: "1", language, text }]
      },
      parameters: {
        opinionMining: true // optional: aspect-based opinions
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Apim-Subscription-Region': region,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ message: 'Azure Language API error', details: errText });
    }

    const data = await response.json();

    // pull out the useful bits from the result
    const doc = data?.results?.documents?.[0];
    const overall = doc?.sentiment; // "positive" | "neutral" | "negative" | "mixed"
    const scores = doc?.confidenceScores; // { positive, neutral, negative }

    return res.json({
      sentiment: overall,
      confidence: scores,
      raw: data // keep for debugging; remove if you prefer a slim response
    });
  } catch (err) {
    console.error('Sentiment route error:', err);
    res.status(500).json({ message: 'Sentiment analysis failed', error: String(err) });
  }
});

module.exports = router;
