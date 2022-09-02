const Sql = require('sequelize');

class Reply extends Sql.Model {
    static init(sequelize){
        return super.init(
            {
                replyId: {
                    type: Sql.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true,
                },
                content : {
                    type : Sql.TEXT, 
                    allowNull: false,
                }, 
                writer : {
                    type : Sql.STRING(20),
                    allowNull : false,
                }
            }, 
            {
                sequelize, 
                timestamps : true, 
                modelName : "Reply", 
                tableName : 'replies',
                paranoid : false,
                charset : "utf8",
                collate : "utf8_general_ci",
            }
        )
    }
    static associate(db){
        db.Reply.belongsTo(db.Post, { foreignKey : "postId", targetKey : "postId" });
    }
}

module.exports = Reply;
