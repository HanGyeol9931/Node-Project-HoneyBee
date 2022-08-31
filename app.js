const express = require("express");
const bodyParser = require('body-parser');
const ejs = require("ejs");
const path = require("path");
const mysql = require("mysql2");
const img = require('./js/upload');
const { sequelize, User } = require("./model"); // 서버 객체 만들고
const app = express(); // express 설정1
// app.js가 있는 위치 __dirname views 폴더까지의 경로가 기본값 렌더링할 파일을 모아둔 폴더
// app.set express에 값을 저장가능 밑에 구문은 views키에 주소값 넣은부분
app.set('views' , path.join(__dirname,"view")); // path.join함수는매개변수를 받은 문자열들을 주소처럼 합쳐줌 path.join("a","b") = a/b 주소처럼 만들어줌
//app.set('views' , path.join(__dirname,"view")); // path.join함수는매개변수를 받은 문자열들을 주소처럼 합쳐줌 path.join("a","b") = a/b 주소처럼 만들어줌
app.engine("html",ejs.renderFile); // engine("파일타입",ejs 그릴때 방식)
app.set("view engine", "html"); // 뷰 엔진 설정을 html을 랜더링 할때 사용 하겠다.
app.use(express.urlencoded({extended:false})); // body 객체 사용
app.use(express.static(__dirname)); // css경로
app.use(express.static(path.join(__dirname,'/public'))); // 정적 파일 설정 (미들웨어) 3
app.use('/uploadimg',express.static(__dirname + '/uploadImg'));
app.use(bodyParser.urlencoded({extended:false})); // 정제 (미들웨어) 5
// 시퀄라이즈 구성 해보자 연결 및 테이블 생성 여기가 처음 매핑// sync 함수는 데이터 베이스 동기화 하는데 사용 필요한 테이블을 생성해준다.
// 필요한 테이블들이 다 생기고 매핑된다. 절대 어긋날 일이 없다.// 테이블 내용이 다르면 오류를 밷어냄 // 여기서 CREATE TABLE 문이 여기서 실행된다는것
sequelize
.sync({force : false}) // force 강제로 초기화를 시킬것인지. (테이블 내용을 다 비워줄것인지)
.then(()=>{ // 연결 성공
    console.log("DB연결 성공")
})
.catch((err)=>{ // 연결실패 
    console.log(err)
});

app.post("/create",(req,res)=>{
    // create이 함수를 사용하면 해당 테이블에 컬럼을 추가할 수 있다.
    const { nickName, userPassword, userId }  = req.body;
    const create = User.create({  
        nickName : nickName,
        userPassword : userPassword,
        userId : userId,
        userStop : 0,
        userWarning : 0,
        authority : "일반",
        // 위의 객체를 전달해서 컬럼을 추가할수있다.
    }).then((e)=>{ // 회원가입 성공 시
        res.send('<script>alert("회원가입을 축하합니다!"); document.location.href="/";</script>');
    })
    .catch((err)=>{ // 회원 가입 실패 시 
        res.send(err);
    });
});

app.get("/", (req,res)=>{  // 현재까지 메인인 log.html
    res.render("index");
});

//------------------------------로그인 및 쿠키 생성--------------------------------------------
app.post('/index',(req,res)=>{    
    const userid = req.body.userId;
    const userpw = req.body.userPassword;
    User.findOne({
        raw : true,
        where : {userId:userid,userPassword:userpw},
    }).then((e)=>{ // findOne을해서 담은 정보를 e에 넣음
        if(e === null){ // 유저아이디와 패스워드가 일치한 값이 없다면
            res.send('<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); window.location.href="/";</script>');
        }
        else if((userid && userpw) == ""){ // 유저아이디와 패스워드가 공란이라면 
            res.send('<script type="text/javascript">alert("아이디와 비밀번호를 입력해주세요."); window.location.href="/";</script>');
        }else{
            res.cookie("user",userid,{ // 로그인시 id로 쿠키만들기
            expires : new Date(Date.now() + 900000),
            httpOnly : true
            });
            res.render('myPage',{data : e});        
        }
    });
});
//------------------------------------로그아웃-----------------------------------------------------
app.get('/logout', (req,res)=>{
    res.clearCookie("user");
    res.redirect("/");
})
//-------------------------------프로파일픽쳐저장------------------------------------------
app.post("/myPage",img.upload.single('file'),(req,res)=>{
    console.log(req.body.nickname)
    const nickname = req.body.nickname;
    const profilePicture = req.body.profilePicture;
    User.update({  
        nickName : req.body.chageNickname, 
        profilePicture : "uploadimg/" + req.file.originalname.replace('.PNG',"")
    },
    {
        where: {
            nickName : nickname,
        }
    }
    ).then((e)=>{
        res.render('myPage',{data : {nickName:e.nickName, profilePicture:e.profilePicture}});  
    }).catch((err)=>{  
        console.log(err);
    });
});

// 서버 연결-------------------------------------------------
app.listen(3000,()=>{
    console.log("서버가 열렸습니다.");
});
