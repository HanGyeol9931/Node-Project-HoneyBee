const Sql = require('sequelize');
// User 클래스에서 시퀄라이즈 안에 모듈 객체의 기능을 상속시켜주기 위해서 User 클래스에서 Sql.Model 기능을 준다.
class User extends Sql.Model{
    // static init 메서드에서 테이블을 생성해주는건데 사용하면 테이블을 생성 및 연결까지(매핑) 구성 
    static init(sequelize){ // 상속받은 함수를 쓰려면 super 사용 // init함수의 첫번째 매개변수가 테이블의 구성
        // 컬럼이 뭐뭐있는지 그 타입과 속성이 뭔지 여기에 정리해서 테이블 생성 해줌 매핑해줌
        // 두번째 테이블 자체에 대한 설정값을 객체로 전달 
        return super.init(
            {
                
                nickName : {
                    type : Sql.STRING(20),
                    allowNull : false,
                    unique : true,
                },
                userPassword : {
                    type : Sql.STRING(255),
                    allowNull : false,
                },
                userId : {
                    type : Sql.STRING(255),
                    allowNull : false,
                    unique:true,
                },
                profilePicture : {
                    type : Sql.STRING,
                    allowNull:true,
                    BLOB : true,
                    defaultValue : 'https://static.nid.naver.com/images/web/user/default.png?type=s160',
                },
                userStop : {
                    type : Sql.STRING(20),
                    allowNull : false,
                },
                userWarning : {
                    type : Sql.STRING(20),
                    allowNull : false,
                },
                authority : {
                    type : Sql.STRING(20),
                    allowNull : false,
                }
                
            },

            {
                sequelize,
                timestamps : true, 
                underscored : false, 
                modelName : "User", 
                tableName : "users", 
                paranoid : false,
                charset : "utf8", 
                collate : "utf8_general_ci",
            }
        );
    }
    // 1:N (foreignkey) 외래키
    static associate(db){
        db.User.hasMany(db.Post, { foreignKey : "writer", sourceKey : "nickName" });
        
    }
    static render(db){
        db.User.belongsTo(db.Complaint, { foreignKey : "complaintUser", sourceKey : "nickName" });
    }
}

module.exports = User;