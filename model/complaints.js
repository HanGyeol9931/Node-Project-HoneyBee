const Sql = require('sequelize'); // User 클래스에서 시퀄라이즈 안에 모듈 객체의 기능을 상속시켜주기 위해서 User 클래스에서 Sql.Model 기능을 준다.
class Complaint extends Sql.Model{ // static init 메서드에서 테이블을 생성해주는건데 사용하면 테이블을 생성 및 연결까지(매핑) 구성 
    static init(sequelize){ // 상속받은 함수를 쓰려면 super 사용 // init함수의 첫번째 매개변수가 테이블의 구성
        // 컬럼이 뭐뭐있는지 그 타입과 속성이 뭔지 여기에 정리해서 테이블 생성 해줌 매핑해줌 // 두번째 테이블 자체에 대한 설정값을 객체로 전달 
        return super.init(
            {
                complaintUser : {
                    type : Sql.STRING(20),
                    allowNull : false,
                    unique : true,
                },
                complaintedUser : {
                    type : Sql.STRING(255),
                    allowNull : false,
                },
                complaintContents : {
                    type : Sql.TEXT,
                    allowNull : false,
                },
            },
            {
                sequelize,
                timestamps : true, 
                underscored : false, 
                modelName : "Complaint", 
                tableName : "complaints", 
                paranoid : false,
                charset : "utf8", 
                collate : "utf8_general_ci",
            }
        );
    }
    // 1:N (foreignkey) 외래키
    static render(db){
        // 1:N 관계(hasMany, belongTo)
        // 시퀄라이즈에서 1:N 관계를 hasMany 함수로 정의를 한다.
        // hasMany 함수를 이용해서 테이블의 관계를 정의해준다. // 첫번째 매개변수로 연결할 테이블 
        // soutceKey User테이블 안에 무슨 키를 foreignKey와 연결할지
        // hasMany()첫번째로 넘겨준 테이블이 foreignKey 와 연결되고 foreignKey 이름은 user_id다.
        db.Complaint.belongsTo(db.User, { foreignKey : "complaintUser", targetKey : "nickName" });
    }
}

module.exports = Complaint;