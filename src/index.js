const express = require('express') //import express.js
const app = express()
const port = 9090

// INFOMATION OF MySQL
const mysql      = require('mysql');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port     : '9999',
  password : 'test',
  database : 'Molto'
});

db.connect();

db.query('SELECT * from Music', (error, rows, fields) =>{
    if(error) throw error;
    console.log('User info is: ', rows);
})

db.end();


app.get('/', (request, response) =>{
    response.send("Hello Molto!")
})

app.listen(port, ()=>{
    serverLog("success", port)
})


const serverLog = (status, port) =>{
    const chalk = require('chalk')
    if(status == "success")
        console.log(chalk.bold('[Molto]:') + ' 백엔드 서버가 성공적으로 구동되었습니다! '+chalk.yellowBright(`(포트:${port})`))
}