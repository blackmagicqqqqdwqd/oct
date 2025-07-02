const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.send('<h1>Привет, октагон!</h1>');
});

app.get('/static', (request, response) => {
    response.send({
        header: "Hello",
        body: "Octagon NodeJS Test"
    });
});

app.get('/dynamic', (request, response) => {
    const { a, b, c } = request.query;
    
    if (a == undefined || b == undefined || c == undefined ||     isNaN(parseFloat(a)) || !isFinite(a) ||
    isNaN(parseFloat(b)) || !isFinite(b) ||
    isNaN(parseFloat(c)) || !isFinite(c)) {
        return response.send({
            header: "Error"
        });
    }

    const numA = parseFloat(a);
    const numB = parseFloat(b);
    const numC = parseFloat(c);
    const result = (numA * numB * numC) / 3;

    response.send({
        header: "Calculated",
        body: result.toString()
    });
});



app.listen(3000);         