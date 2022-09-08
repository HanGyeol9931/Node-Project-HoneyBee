const dot = require("dotenv").config();

// 데이터 베이스 접속에 필요한 설정값 객체
const config = {
  dev: {
    username: "root",
    password: process.env.DATABASE_PASSWORD,
    database: "honey2",
    // 사용을 한다면 이곳에 주소를 넣어주면 됩니다.
    dialect: "mysql",
    timezone:"+09:00",
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    define: {
      timestamps: true,
    },
  },
};

module.exports = config;
