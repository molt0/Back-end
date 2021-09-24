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

// const title = "강남스타일"
// const artist = "lol"


//localhost:9090/specific/강남스타일:PSY/lyrics
app.get('/specific/:topicQuery/:typeQuery', (request, response) =>{
    //아티스트(artist)와 노래(title) 나누기
    const topicDivided = request.params.topicQuery.split(':')

    const title = topicDivided[0]
    const artist = topicDivided[1]
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
    
        if(rows == "")
            console.log("비었다!")

        
        console.log('Music info is: ', rows);

        result = { "title": title, "artist": artist, "content": rows}
        response.send(JSON.stringify(result))
    })
    
    
})




app.listen(port, ()=>{
    serverLog("success", port)
})



const serverLog = (status, port) =>{
    const chalk = require('chalk')
    if(status == "success")
        console.log(chalk.bold('[Molto]:') + ' 백엔드 서버가 성공적으로 구동되었습니다! '+chalk.yellowBright(`(포트:${port})`))
}