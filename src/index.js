const express = require("express"); //import express.js
const chalk = require("chalk");
const mysql = require("mysql2");
const uuid4 = require("uuid4");
const cors = require("cors");

//플러그인
const dateTime = require("node-datetime");

const app = express();
const port = 1004;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.set("view engine", "ejs");

let status = {
  DBConnected: true,
  port: port,
};

// DB 정보
const db = mysql.createConnection({
  host: "localhost",
  port: "9999",
  user: "root",
  password: "test",
  database: "Molto",
});

// DB 연결 테스트
db.connect(function (err) {
  if (err) {
    res.send(err);
    return;
  }
  status.DBConnected = true;
});

//리스트
app.get("/userinfo", (req, res) => {
  const sql = "select * from users";
  db.query(sql, function (err, result, fields) {
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
  db.query(sql, req.body, function (err, result, fields) {
    if (err) {
      res.send(err);
      return;
    }
    console.log("등록 완료");
  });
});

app.post("/checkid", function (req, res) {
  let user_id = req.body.id;

  console.log(req.body.id);
  let sql = "select user_id from users where user_id=?";
  db.query(sql, [user_id], function (err, rows, fields) {
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

// 문서 내용 불러오기
app.get("/specific/:title/:artist/:typeQuery", (request, response) => {
 
  const title = request.params.title;
  const artist = request.params.artist;
  const type = request.params.typeQuery;

  db.query(
    `SELECT ${type} from Music WHERE title='${title}' AND artist='${artist}'`,
    (error, rows, fields) => {
      if (error) throw error;

      if (rows == "") {
        result = { title: title, artist: artist, type: type, contents: false, };
        response.send(JSON.stringify(result));
        console.log("데이터 없음");
        return;
      }

      result = { title: title, artist: artist, type: type, contents: rows[0],};
      response.send(JSON.stringify(result));
      console.log("Music info is: ", result);
    }
  );
});

//문서 생성 / 수정 날짜 반환 
app.get("/specific_/log/:title/:artist", (request, response)=>{

  const title = request.params.title;
  const artist = request.params.artist;

  db.query(
    `SELECT updated_at, created_at from Music WHERE title='${title}' AND artist='${artist}'`,
    (error, rows, fields) => {
      if (error) throw error;

      if (rows == "") {
        result = {updated_at: false, created_at : false, };
        response.send(JSON.stringify(result));
        console.log("로그 없음");
        return;
      }
         
    let rawUpdateDate = JSON.stringify(rows[0].updated_at)
    let rawCreateDate = JSON.stringify(rows[0].created_at)
    let ruDate = rawUpdateDate.substr(1, 10);
    let rcDate = rawCreateDate.substr(1, 10)

      result = { updated_at: ruDate, created_at: rcDate};
      response.send(JSON.stringify(result));
    }
  );

})

// 내용이  POST로 왔을 때
app.post("/specific/:title/:artist/:typeQuery", (request, response) => {
  const title = request.params.title;
  const artist = request.params.artist;
  const type = request.params.typeQuery;

  const body = JSON.stringify(request.body.savedContent);

  const defaultRow =
    '{"time": 1634822925666, "blocks": [{"id": "pYnFEuymaC", "data": {"text": "&nbsp;&nbsp;", "level": 2}, "type": "header"}], "version": "2.22.2"}';

  db.query(
    `SELECT title FROM Music WHERE title = '${title}' AND artist = '${artist}'`,
    (error, row, fields) => {
      if (error) throw error;
      console.log("POST 들어옴");
      console.log(row);

      if (row.length === 0) {
        console.log("POST - 내용이 존재하지 않음");
        let dt = dateTime.create();
        let date = dt.format("Y-m-d H:M:S");
        db.query(
          `INSERT INTO Music VALUES( 1, '${title}', '${artist}', '${body}', '${defaultRow}', '${defaultRow}', '${defaultRow}', '${defaultRow}', '${date}', '${date}')`,
          (error, row, fields) => {
            if (error) throw error;
            console.log(row);
            console.log("데이터가 생성됨");

            return;
          }
        );
      } else if (row[0].title === title) {
        console.log("해당 제목을 가진 문서가 존재함");
        //UPDATE문을 사용 (title과 artist가 params로 들어온거로)
        db.query(
          `UPDATE Music SET ${type} = '${body}' WHERE title = '${title}' AND artist = '${artist}'`,
          (error, row) => {
            if (error) throw error;

            console.log("update: " + row);
          }
        );
      }
    }
  );
});

//검색 기능
app.get("/search/:query", (request, response) => {
  const query = request.params.query;

  
  db.query(
    `SELECT title, artist, updated_at FROM Music WHERE title = '${query}' OR artist = '${query}'`,
    (error, row) => {
      if (error) throw error;

      if (row.length === 0){
        console.log("검색 결과 없음");
        response.json(({result: false}))
      }
      else if(row[0].title === query || row[0].artist === query){
        let resultArr = []

        for(i=0; i <= row.length-1; i++){
          let rawDate = JSON.stringify(row[i].updated_at)
          let resutDate = rawDate.substr(1, 10);
          console.log(resutDate)

          musicInfo =  {img:"음원_사진", artist: row[i].artist, name: row[i].title, time:200, like:3211, date: resutDate, type:"팝"} 
          resultArr.push(musicInfo)
        }
        console.log(row)
        console.log(resultArr)
        response.send({result: resultArr});

      }




      // result = { img: '음원_사진', artist: artist, time: 200, name: title, like: 999, date: "2020-20-20"};
    }
  );
});

//삭제
app.get("/delete/:user_id", (req, res) => {
  const sql = "DELETE FROM users WHERE user_id = ?";
  db.query(sql, [req.params.user_id], function (err, result, fields) {
    if (err) {
      res.send(err);
      return;
    }
    console.log(result);
    res.redirect("/userinfo");
  });
});

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
  serverLog("success", status.DBConnected, status.port);
});
