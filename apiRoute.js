const { default: axios } = require('axios');
const express = require('express');
const loadAndEmbedFile = require('./loadAndEmbedFile');
const cosineSimilarity = require('./cosineSimilarity');

const apiRoute = express.Router();

let embeddedChunks = null;

apiRoute.use(async (req, res, next) => {
  if (!embeddedChunks) {
    embeddedChunks = await loadAndEmbedFile('./data.txt');
  }
  next();
});

apiRoute.post('/ask', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  try {
    // Get embedding for the user's question
    const userEmbedRes = await axios.post(
      'http://localhost:11434/api/embeddings',
      {
        model: 'tinyllama',
        prompt,
      }
    );
    const userEmbedding = userEmbedRes.data.embedding;

    // Find top 3 matching chunks
    const topChunks = embeddedChunks
      .map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(chunk.embedding, userEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((c) => c.text)
      .join('\n');

    // Feed top chunks as context to the model
    const finalPrompt = `Use the following context to answer the question:\n\n${topChunks}\n\nQuestion: ${prompt}\nAnswer:`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'tinyllama',
      prompt: finalPrompt,
      stream: false,
    });

    res.json({ answer: response.data.response.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LLM error', details: err.message });
  }
});

module.exports = apiRoute;
