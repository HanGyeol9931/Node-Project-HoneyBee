// index.js가 모델 안에 모델 js파일들을 모아서 사용하는 곳
const Sql = require('sequelize');
// config.js에서 module.exports = config 내보내기를 하고
// require("../config/config") 가져오면 내보낸 객체가 가져와진다.
const config = require('../config/config');
const User = require('./users');
//const MyPage = require('./mypage');

// 시퀄라이즈 객체 생성 옵션을 적용한 객체 만들어 놓는다. 
const sequelize = new Sql(
    config.dev.database,
    config.dev.username,
    config.dev.password,
    config.dev
);

// 내보내기 위해서 빈객체 만든것.
const db = {};
// 그 빈 객체에 sequelize 키값으로 시퀄라이즈 객체 만든것을 넣어준다.
// User도 내보내서 사용할 예정이라 키값에 추가해주고
db.sequelize = sequelize;
db.User = User;
//db.MyPage = MyPage;

// 이 구문이 없으면 테이블이 생성되지 않는다.
User.init(sequelize);
//MyPage.init(sequelize);
//관계형 맺어주는 함수 사용
//User.associate(db);
//MyPage.associate(db);

// 보내고 싶은 값을 다 넣은 객체를 내보낸것
module.exports = db;