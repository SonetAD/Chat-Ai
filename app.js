const express = require('express');
const apiRoute = require('./apiRoute');

const app = express();

app.use(express.json());

app.use('/api', apiRoute);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log('Chatbot is live on: http://localhost:3000');
});
