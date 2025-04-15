const { default: axios } = require('axios');
const express = require('express');
const loadAndEmbedFile = require('./loadAndEmbedFile');

const apiRoute = express.Router();

apiRoute.get('/ask', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(500).json({ error: 'prompt is required' });
  try {
    const embed = await loadAndEmbedFile('./data.txt');
    console.log(embed);
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'tinyllama',
      prompt: prompt,
      stream: false,
    });

    res.json({ answer: response.data.response.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LLM error', details: err.message });
  }
});

module.exports = apiRoute;
