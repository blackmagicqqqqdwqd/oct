const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.send('<h1>Привет, Октагон!</h1>');
});

app.listen(3000);         