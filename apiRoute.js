const { DataAPIClient } = require('@datastax/astra-db-ts');
const OpenAI = require('openai');
const express = require('express');

const {
  DB_NAME_SPACE,
  DB_COLLECTION,
  DB_API_KEY,
  DB_APP_TOKEN,
  OPEN_AI_API_KEY,
} = process.env;

const apiRoute = express.Router();

const openAI = new OpenAI({
  apiKey: OPEN_AI_API_KEY,
});

const dbClient = new DataAPIClient(DB_APP_TOKEN);

const db = dbClient.db(DB_API_KEY, {
  namespace: DB_NAME_SPACE,
});

apiRoute.post('/ask', async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const embedding = await openAI.embeddings.create({
      model: 'text-embedding-3-small',
      input: prompt,
      encoding_form: 'float',
    });

    const collection = await db.collection(DB_COLLECTION);

    const find = collection.find(null, {
      sort: {
        $vector: embedding.data[0].embedding,
      },
      limit: 5,
    });

    let document = await find.toArray();
    const docMap = document?.map((doc) => doc.text);
    document = JSON.stringify(docMap);
    const template = {
      role: 'system',
      content: `You are the ai admission assistant for California State University(CSU).Use the context to give answer.If the context do not include the question answer,say that your current data is not have the answer.  ${document} END COntext.Question:${prompt}`,
    };

    const answer = await openAI.chat.completions.create({
      model: 'gpt-4',
      stream: false,
      messages: [template],
    });

    res.status(200).json({ answer: answer?.choices[0]?.message?.content });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = apiRoute;
