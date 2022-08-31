const express = require("express");
const bodyParser = require('body-parser');
const ejs = require("ejs");
const path = require("path");
const mysql = require("mysql2");
const img = require('./js/upload');
const cookie = require("cookie-parser")
const socketio = require("socket.io")
const { sequelize, User } = require("./model"); // 서버 객체 만들고
const app = express(); // express 설정1
// 서버 연결-------------------------------------------------
const server = app.listen(3000,()=>{
    console.log("서버가 열렸습니다.");
});
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
app.use(cookie());
const io = socketio(server);
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
    if((nickName && userPassword) == ""){ 
        res.send('<script type="text/javascript">alert("아이디와 비밀번호를 입력해주세요."); window.location.href="/";</script>');
    }else{
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
        }).catch((err)=>{ // 회원 가입 실패 시 
            res.send(err);
        });
    }
});
    // .catch(()=>{
    //     if((nickName && userPassword)==""){ 
    //         res.send('<script type="text/javascript">alert("아이디와 비밀번호를 입력해주세요."); window.location.href="/";</script>');
    //     } else{
    //         res.send('<script>alert("회원가입을 축하합니다!"); document.location.href="/";</script>');
    //     }
    // }).then((e)=>{ // 회원가입 성공 시
    //     res.send('<script>alert("회원가입을 축하합니다!"); document.location.href="/";</script>');
    // })
   
app.get("/", (req,res)=>{  // 현재까지 메인인 log.html
    res.render("index");
});
app.get("/mypage", (req,res)=>{  // 현재까지 메인인 log.html
    User.findOne({
        raw : true,
        where: {userId : req.cookies.user}
    })
    .then((e)=>{
        res.render("myPage",{data : e});
    })
    .catch(()=>{
        res.redirect("/")
    })
});
app.get("/index", (req,res)=>{  // 현재까지 메인인 log.html
    User.findOne({
        raw : true,
        where: {userId : req.cookies.user}
    })
    .then((e)=>{
        res.render("start",{data : e});
    })
    .catch(()=>{
        res.redirect("/")
    })
});

//------------------------------로그인 및 쿠키 생성--------------------------------------------
app.post('/index',(req,res)=>{    
    const userid = req.body.userId;
    const userpw = req.body.userPassword;
    User.findOne({
        raw : true,
        where : {userId:userid,userPassword:userpw,userStop:0},
    }).then((e)=>{ // findOne을해서 담은 정보를 e에 넣음
        if(e === null){
            User.findOne({
                raw : true,
                where : {userId:userid,userPassword:userpw},
            })
            .then((e)=>{
                if(e.userStop >= 1){
                    console.log("이거실행3")
                    res.send(`<script>alert("정지된 아이디입니다.");window.location.href="/";</script>`)
                    return
                }
                else{
                    console.log("이거실행됌2")
                    res.send('<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); window.location.href="/";</script>');
                }
            })
            .catch((e)=>{
                    res.send('<script type="text/javascript">alert("존재하지 않는 아이디 거나 일치하지 않는 비밀번호 입니다."); window.location.href="/";</script>');
            }) // 유저아이디와 패스워드가 일치한 값이 없다면
        }
        else if((userid && userpw) == ""){ // 유저아이디와 패스워드가 공란이라면 
            res.send('<script type="text/javascript">alert("아이디와 비밀번호를 입력해주세요."); window.location.href="/";</script>');
        }else{
            res.cookie("user",userid,{ // 로그인시 id로 쿠키만들기
            expires : new Date(Date.now() + 900000),
            httpOnly : true
            });
            res.render('start',{data : e});          
        }
    })
    .catch(()=>{
        console.log("이거 실행됌")
    })
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
// 채팅방----------------------------------------------------
app.get("/chatting",(req,res)=>{
    User.findOne({
        raw : true,
        where: {userId : req.cookies.user}
    })
    .then((e)=>{
        res.render("chatting",{data : e});
    })
    .catch
})
// socketio-------------------------
const userArr = [];
const useridArr = [];
io.on("connection",(socket)=>{
    app.post("/userOut",(req,res)=>{
        const { nickname }   = req.body;
        User.findOne({
            raw : true,
            where : {nickName : nickname}
        })
        .then((e)=>{
            User.update({userStop : Number(e.userStop)+1},{where : {nickName : nickname}})
            io.to(useridArr[userArr.indexOf(nickname)]).emit("userOut",nickname)
            res.send(`${nickname}님이 강제퇴장 되었습니다.`)
        })
        .catch(()=>{
            console.log("err")
        })
    
    })
    // 유저떠날때
    socket.on('disconnect', () => {
        // 방떠나게 함
        io.emit("leaveRoom",userArr.splice(useridArr.indexOf(socket.id),1))
        // 유저 배열 제거
        useridArr.splice(useridArr.indexOf(socket.id),1)
        io.emit("userCount",userArr.length)
        io.emit("userShow",userArr)
        console.log("유저 떠남");
        console.log(userArr);
        if(userArr.length <= 0 ){
            io.emit("return")
        } 
        
    });
    console.log("유저 접속");
    
    socket.on("chat",(name,msg,socket)=>{
        // console.log(original)
        User.findOne({
            raw : true,
            where : {nickName : name}
        })
        .then((e)=>{
            if(e.authority == "관리자"){
                io.emit("adminChat",name,msg);
                return
            }
            else{
                io.emit("chat",name,msg);
            }
        })
        .catch((e)=>{
            console.log("err")
        })
    })
    socket.on("secretChat",(name,user,msg)=>{
        {
            io.to(user).emit("secretChat",name,user,msg);
            io.to(name).emit("secretChatYou",name,user,msg);
        }

    });
   socket.on("joinRoom",(name)=>{
        userArr.push(name);
        useridArr.push(socket.id);
        User.findOne({
            raw : true,
            where : {nickName : name}
        })
        .then((e)=>{
            if(e.authority == "관리자"){
                userArr.forEach((e)=>{
                    socket.join(e)
                    socket.join("관리자")
                })
                io.emit("userShow",userArr)
                io.emit("adminJoinRoom",name,userArr.length);
                return
            }
            else{
                io.emit("joinRoom",name,userArr.length);
                io.emit("userShow",userArr)
                socket.join(name);
            }
        })
        .catch((e)=>{
            console.log("err")
        })       
        console.log(userArr)
    });
});
app.post("/userWarning",(req,res)=>{
    const { nickname }   = req.body;
    User.findOne({
        raw : true,
        where : {nickName : nickname}
    })
    .then((e)=>{
        // console.log(Number(e.userWarning)+1)
        // User.update({userWarning : Number(e.userWarning)+1},{where : {nickName : nickname}})
        // res.send((Number(e.userWarning)+1)+"회 경고 입니다. 5회 이상 경고 시 퇴장입니다.")
        if(Number(e.userWarning) >= 4){
            User.update({userStop : Number(e.userStop)+1},{where : {nickName : nickname}})
            res.send("경고 초과로 강제 퇴장 되셨습니다.")
        }
        else{
            User.update({userWarning : Number(e.userWarning)+1},{where : {nickName : nickname}})
            res.send((Number(e.userWarning)+1)+"회 경고 입니다. 5회 이상 경고 시 퇴장입니다.")
        }
    })
    .catch((e)=>{
        console.log("err")
        console.log(e)
        res.send("에러남")
    })
})

