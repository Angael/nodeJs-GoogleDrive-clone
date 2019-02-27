var fs  = require('fs-extra');

//page should be "default.pug"
const sendErr = function(req, res, code = 500, msg = "Error", page = null){
  res.writeHeader(code, {
    "Content-Type": "text/html"
  });
  if(page === null){
    res.write(msg);
    res.end();
  }else{
    fs.readFile("../paths/err/"+page, function(err, pugHtml) {
      if (err) {
        sendErr(req,res,500)
        return;
      }
      var fn = pug.compile(pugHtml.toString());
      var html = fn({msg:msg});
  
      res.writeHeader(200, {
        "Content-Type": "text/html"
      });
      res.write(html);
      res.end();
    });
  }
}


module.exports = sendErr;