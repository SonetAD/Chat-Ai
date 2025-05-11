const express = require('express');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log('ChatAI is live on http://localhost:3000');
});
