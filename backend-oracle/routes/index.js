var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(
    `<!DOCTYPE html>
      <html>
      <body>
        <form action="uploadFile" method="post" enctype="multipart/form-data">
          <h1>选择上传的文件</h1>  
          <input type="file" name="file">
          <input type="submit" value="上传">
        </form>
      </body>
      </html>`
    )
  // res.render('index', { title: 'Express' });
});

module.exports = router;
