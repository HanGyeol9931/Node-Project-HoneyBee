const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
		cb(null, './uploadImg')
		//이미지 업로드시킬 폴더 위치
    },
    filename: function (req, file, cb) {		
		cb(null, file.originalname.replace('.PNG',""))
        // Buffer.from(filename, 'latin1').toString('utf8')
        // 서버에 저장할 파일 명
    }
})
var upload = multer({ storage: storage })
// storage는 업로드 될 폴더 위치

module.exports = {
	upload	
};