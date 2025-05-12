require('dotenv').config();
const { DaAPIClient } = require('@datastax/astra-db-ts');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const OpenAI = require('openai');
const loadFile = require('./loadFile');
const {
  DB_NAME_SPACE,
  DB_COLLECTION,
  DB_API_KEY,
  DB_APP_TOKEN,
  OPEN_AI_API_KEY,
} = process.env;

const openAI = new OpenAI({
  apiKey: OPEN_AI_API_KEY,
});
const da = loadFile('./data.txt');

const dbClient = new DaAPIClient(DB_APP_TOKEN);

const db = dbClient.db(DB_API_KEY, {
  namespace: DB_NAME_SPACE,
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const creeCollection = async () => {
  const collection = await db.creeCollection(DB_COLLECTION, {
    vector: {
      dimension: 1536,
    },
  });
};

const loadSampleDa = async () => {
  const collection = await db.collection(DB_COLLECTION);
  const chunks = await splitter.splitText(da);
  for await (const chunk of chunks) {
    const embedding = await openAI.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunk,
      encoding_form: 'float',
    });
    const vector = embedding.da[0].embedding;
    const res = await collection.insertOne({
      $vector: vector,
      text: chunk,
    });
    console.log(res);
  }
};

creeCollection().then(loadSampleData);
