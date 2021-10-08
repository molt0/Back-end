const path = require("path");
const express = require("express"); //import express.js
const ejs = require("ejs");
const uuid4 = require("uuid4");
const chalk = require("chalk");
var serveStatic = require("serve-static"); //특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 열어주는 역할
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
var cors = require("cors");

const app = express();
const port = 1004;


app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cors());
app.set("view engine", "ejs");

let serverState = {
  dbConnected: true,
  port: port,
};

const mysql = require("mysql2");

const con = mysql.createConnection({
  host: "test.itsw.info",
  port: "3306",
  user: "sw202134",
  password: "sw202134",
  database: "sw202134",
});
// sw202134

//////////////////////////////////////////////////////////////////////////////
con.connect(function (err) {
  if (err) {
    res.send(err);
    return;
  }

  serverState.dbConnected = true;
});

//리스트
app.get("/userinfo", (req, res) => {
  const sql = "select * from users";
  con.query(sql, function (err, result, fields) {
    if (err) {
      res.send(err);
      return;
    }
    res.render("index", { user: result });
  });
});

//가입
app.post("/add", (req, res) => {
  req.body.uuid = uuid4();
  console.log(req.body);
  const sql = "INSERT INTO users SET ?";
  con.query(sql, req.body, function (err, result, fields) {
    if (err) {
      res.send(err);
      return;
    }
    console.log("등록 완료");
    // res.send('등록이 완료 되었습니다.');
    res.redirect("/login");
  });
});

app.post("/checkid", function (req, res) {
  let user_id = req.body.id;

  console.log(req.body.id);
  let sql = "select user_id from users where user_id=?";
  con.query(sql, [user_id], function (err, rows, fields) {
    console.log(rows);
    let checkid = new Object();
    checkid.tf = false;

    if (rows[0] === undefined) {
      checkid.tf = true;
      res.send(checkid);
    } else {
      checkid.tf = false;
      res.send(checkid);
    }
  });
});

//내용 Get으로 불러올 떄
app.get("/specific/:title/:artist/:typeQuery", (request, response) => {
  //아티스트(artist)와 노래(title) 나누기

  const title = request.params.title;
  const artist = request.params.artist;
  var type;

  switch (request.params.typeQuery) {
    case "intro":
      type = "content_intro";
      break;
    case "lyrics":
      type = "content_lyrics";
      break;
    case "info":
      type = "content_info";
      break;
    case "etc":
      type = "content_etc";
      break;
    case "relate":
      type = "content_relate";
      break;
    default:
      response.sendStatus(404, "알맞은 Type이 아닙니다");
      return;
  }

  con.query(
    `SELECT ${type} from Music WHERE title='${title}' AND artist='${artist}'`,
    (error, rows, fields) => {
      if (error) throw error;

      if (rows == "") {
        result = { title: title, artist: artist, type: type, content: false };
        response.send(JSON.stringify(result));
        return;
      }
      console.log("비었다!");

      result = { title: title, artist: artist, type: type, content: rows };
      response.send(JSON.stringify(result));

      console.log("Music info is: ", result);
    }
  );
});

// 내용이  POST로 왔을 때
app.post("/specific/:title/:artist/:typeQuery", (request, response) => {
  //save content!
	const sql = ''
});

// 최근 리스트

// //업데이트 폼
// app.get('/edit/:user_id', (req,res)=>{
//     const sql = "SELECT * FROM users WHERE user_id = ?";
//     con.query(sql,[req.params.user_id],function(err,result,fields){
//         if(err) {
//             res.send(err)
//             return;
//         };
//         res.render('edit',{user: result});
//     });
// });

// //업데이트
// app.post('/update/:user_id', (req,res)=>{
//     const sql = "UPDATE users SET ? WHERE user_id = " + req.params.user_id;
//     con.query(sql,req.body,function(err,result,fields){
//         if(err) {
//             res.send(err)
//             return;
//         };
//         console.log(result)
//         res.redirect('/userinfo');
//     });
// });

// //삭제
// app.get('/delete/:user_id', (req,res)=>{
//     const sql = "DELETE FROM users WHERE user_id = ?";
//     con.query(sql,[req.params.user_id],function(err,result,fields){
//         if(err) {
//             res.send(err)
//             return;
//         };
//         console.log(result)
//         res.redirect('/userinfo');
//     });
// });

const serverLog = (runState, dbState, port) => {
  if (dbState == true)
    console.log(
      chalk.bold("[Molto]: ") +
        "백엔드 MySQL 데이터베이스 연결 - " +
        chalk.yellowBright(`(연결됨)`)
    );

  if (runState == "success")
    console.log(
      chalk.bold("[Molto]:") +
        " 백엔드 코드가 오류없이 구동되었습니다! " +
        chalk.yellowBright(`(포트:${port})`)
    );
};

app.listen(port, () => {
  serverLog("success", serverState.dbConnected, serverState.port);
});
