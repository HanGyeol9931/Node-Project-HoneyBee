const Sql = require('sequelize');

class Post extends Sql.Model {
    static init(sequelize){
        return super.init(
            {
                postId: {
                    type: Sql.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true,
                },
                title : {
                    type : Sql.STRING(100), 
                    allowNull : false, 
                },
                content : {
                    type : Sql.TEXT, 
                    allowNull: false,
                }

            }, 
            {
                sequelize, 
                timestamps : true, 
                modelName : "Post", 
                tableName : 'posts',
                paranoid : false,
                charset : "utf8",
                collate : "utf8_general_ci",
            }
        )
    }
    static associate(db){
        db.Post.belongsTo(db.User, { foreignKey : "writer", targetKey : "nickName" });
        db.Post.hasMany(db.Reply, { foreignKey : "postId", sourceKey : "postId" });
    }
}

module.exports = Post;