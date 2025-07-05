import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(`7912329677:AAETxCn5vms-r5QKVNMMppOgmaWqhfFL2mc`, {polling: true})

/*
bot.on('message',msg => {
    const { chat: {id}} = msg
    bot.sendMessage(id,'Привет, октагон!');

})*/


bot.onText(/\/help/,  msg => {
    const {chat: {id}} = msg
    bot.sendMessage(id, `/site - отправляет в чат ссылку на сайт октагона. 
    /creator - отправляет в чат ваше ФИО 
    /randomItem - случайный предмет
    /getItemByID [id] - найти предмет
    /deleteItem [id] - удалить предмет`);
})

bot.onText(/\/site/, msg => {
    const {chat: {id}} = msg;
    bot.sendMessage(id, 'сайт Октагона: https://octagon.su');
});


bot.onText(/\/creator/, msg => {
    const {chat: {id}} = msg;
    bot.sendMessage(id, 'Создатель бота: Порохов Данила');
});


const express = require('express');
const app = express();

const mysql = require("mysql2");
  


const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "ChatBotTests"
});


bot.onText(/\/randomItem/, (msg) => {
    const { chat: { id } } = msg;
    
    connection.query('SELECT * FROM Items ORDER BY RAND() LIMIT 1',
        (err, results) => {
            if (err) {
                console.error(err);
                return bot.sendMessage(id, 'Ошибка БД');
            }
            
            if (results.length === 0) {
                return bot.sendMessage(id, 'В базе нет предметов');
            }
            
            const item = results[0];
            bot.sendMessage(id, `(${item.id}) - ${item.name}: ${item.desc}`);
        }
    );
});




bot.onText(/\/deleteItem (\d+)/, (msg, s) => {
    const chatId = msg.chat.id;
    const itemId = s[1];
    
  
    connection.query(
        'DELETE FROM Items WHERE id = ?', [itemId],
        (err, results) => {
            if (err) {
                return bot.sendMessage(chatId, "Ошибка сервера при удалении");
            }
            
            if (results.affectedRows === 0) {
                bot.sendMessage(chatId, `${itemId} нету`);
            } else {
                bot.sendMessage(chatId, `${itemId} подбит`);
            }
        }
    );
});



bot.onText(/\/getItemByID (\d+)/, (msg, s) => {
    const chatId = msg.chat.id;
    const itemId = s[1];
    

    connection.query('SELECT * FROM Items WHERE id = ? LIMIT 1',[itemId],
        (err, results) => {
            if (err) return bot.sendMessage(chatId, "Ошибка сервера");
            
            
            if (results.length === 0) {
                bot.sendMessage(chatId, `нет такого `);
            } else {
                let item = results[0];
                bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
            }
        }
    );
});



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



 


connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
 });




app.get('/getAllItems', (request, response) => {
    
        connection.query("SELECT * FROM items", function(error, results)  {
            
            if (error) {
            response.send(null);
            } else {
            response.send(results); 
            }
            
        });
});


app.post('/addItem', (request, response) => {
    const { name, desc } = request.query;
    
    
    if (!name || !desc) {
        return response.send(null);
    }

    const sql = 'INSERT INTO Items (name, `desc`) VALUES (?, ?)';
    
    connection.query(sql, [name, desc], function(err) {
       
        if (err) return response.send(null);
        
        response.send({
                name: name,
                desc: desc
        });
    });
});


app.post('/deleteItem', (request, response) => {
    const { id } = request.query;
    
    // Проверка наличия обязательного параметра
    if (!id || isNaN(parseInt(id))) {
        return response.send(null);
    }

    const sql = 'DELETE FROM Items WHERE id = ?';
    
    connection.query(sql, [id], function(err, results) {
        if (err) return response.send(null);
        
        if (results.affectedRows === 0) {
            return response.send({}); 
        }
        
        response.send({
                id: id
        });
        
    });
});




app.post('/updateItem', (request, response) => {
    const { id, name, desc } = request.query;

  
    if (!id || isNaN(parseInt(id))) {
        return response.send(null);
    }
    if (!name && !desc) {
        return response.send(null);
    }

    
    let sql = 'UPDATE Items SET ';
    const params = [];
    let updates = [];
    
    if (name) {
        updates.push('name = ?');
        params.push(name);
    }
    if (desc) {
        updates.push('`desc` = ?');
        params.push(desc);
    }
    
    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

  
    connection.query(sql, params, function(err, results) {
        if (err) response.send(null);
        if (results.affectedRows === 0) { return response.send({}); }
        response.send({id: id, name:name , desc:desc});
    });
});



app.listen(3000);         