const fs = require('fs');
const axios = require('axios');
const splitText = require('./splitText');
const loadAndEmbedFile = async (filePath) => {
  const rawText = fs.readFileSync(filePath, 'utf-8');
  const textChunks = splitText(rawText);

  const embedded = await Promise.all(
    textChunks.map(async (text) => {
      const res = await axios.post('http://localhost:11434/api/embeddings', {
        model: 'tinyllama',
        prompt: text,
      });
      return {
        text,
        embedding: res.data.embedding,
      };
    })
  );

  return embedded;
};

module.exports = loadAndEmbedFile;
