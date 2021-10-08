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


//내용 Get으로 불러올 떄
app.get('/specific/:title/:artist/:typeQuery', (request, response) =>{
    //아티스트(artist)와 노래(title) 나누기

    const title = request.params.title
    const artist = request.params.artist
    var type;

    switch(request.params.typeQuery){
        case 'intro':
            type = 'content_intro';
            break;
        case 'lyrics':
            type = 'content_lyrics';
            break;
        case 'info':
            type = 'content_info';
            break
        case 'etc':
            type = 'content_etc';
            break;
        case 'relate':
            type = 'content_relate';
            break;
        default:
            response.sendStatus(404, "알맞은 Type이 아닙니다")
            return;
    }

    db.query(`SELECT ${type} from Music WHERE title='${title}' AND artist='${artist}'`, (error, rows, fields) =>{
        if(error) throw error;
    
        if(rows == ""){
            result = {"title":title, "artist":artist, "type": type, "content": false}
            response.send(JSON.stringify(result))
            return
        }
            console.log("비었다!")

        result = { "title": title, "artist": artist, 'type':type, "content": rows}
        response.send(JSON.stringify(result))

        console.log('Music info is: ', result);
    })
    
    
})

// 내용이  POST로 왔을 때
app.post('/specific/:title/:artist/:typeQuery', (request, response) =>{
    //save content!
})

// 최근 리스트




app.listen(port, ()=>{
    serverLog("success", port)
})



const serverLog = (status, port) =>{
    const chalk = require('chalk')
    if(status == "success")
        console.log(chalk.bold('[Molto]:') + ' 백엔드 서버가 성공적으로 구동되었습니다! '+chalk.yellowBright(`(포트:${port})`))
}