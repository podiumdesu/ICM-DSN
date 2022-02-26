const express = require("express")

const path = require("path")
const fs = require("fs")

const multer = require("multer")

const router = express.Router()

const crypto = require('crypto');



const HexSha256 = (a,b) => {
    return crypto.createHash('sha256').update(a,b).digest('hex')
}

const createFolder = function(folder){
    try{
        fs.accessSync(folder); 
    }catch(e){
        fs.mkdirSync(folder);
    }  
};

const uploadFolder = './upload/';

createFolder(uploadFolder);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname
        const type = (fileName.indexOf('.') >= 0) ? fileName.split('.').pop() : ''
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        const newName = `${fileName}-${Date.now()}.${type}`
        cb(null, newName);  
    }
});

var upload = multer({ storage: storage });


router.post('/', upload.single('file'), function(req, res, next){
    const file = req.file
    console.log('文件类型：%s', file.mimetype);
    console.log('原始文件名：%s', file.originalname);
    console.log('文件大小：%s', file.size);
    console.log('文件保存路径：%s', file.path);

    res.status(200).send({
        fileLoc: file.path
    })
    // res.send({ret_code: '0'});
});


router.post('/spc', upload.single('file'), function(req, res, next){
    const file = req.file
    console.log('文件类型：%s', file.mimetype);
    console.log('原始文件名：%s', file.originalname);
    console.log('文件大小：%s', file.size);
    console.log('文件保存路径：%s', file.path);
    const readStream = fs.createReadStream(`./${file.path}`, { highWaterMark: 16 })

    const data = []
    const merkle = []
    readStream.on('data', function (chunk) {
        data.push(chunk)
        let hash = crypto.createHash('sha256').update(chunk).digest('hex')
        merkle.push(hash)
    });
    
    readStream.on('end', function () {
        console.log("Now ")
        let len = data.length
        let round = 0
        // console.log(Math.log2(len))
        while (2**round < len) {
            for (let i = 0; i <= len - 1;) {
                merkle[i] = merkle[i+2**round] ? HexSha256(merkle[i], merkle[i+2**round]) : HexSha256(merkle[i])
                i += (2**(round+1))
            }
            round += 1 
        }
        res.status(200).send({
            fileLoc: file.path,
            merkle: merkle[0]
        })
        // console.log(merkle[0])
    });
    
    readStream.on('error', function (err) {
        console.log(err.stack);
    });
    
    console.log("Program Ended");


    // res.send({ret_code: '0'});
});
module.exports = router