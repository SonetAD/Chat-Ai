require('dotenv').config();

const express = require('express');
const apiRoute = require('./apiRoute');

const app = express();

app.use(express.json());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/api', apiRoute);

app.listen(3000, () => {
  console.log('ChatAI is live on http://localhost:3000');
});
