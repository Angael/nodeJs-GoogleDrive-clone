var models = require('./models');
var routerHtml = require('./routes/index');
var routerUpload  = require('./routes/upload');
var routerDownload  = require('./routes/download');
var routerDelete  = require('./routes/delete');
var routerJson  = require('./routes/api');
var routerImgPreview = require('./routes/imgPreview');

var express = require("express");
var app = express();
var fs = require("fs-extra"); // file system
var pug = require("pug"); // pug html syntax
var bodyParser = require("body-parser"); // get post values
var path = require("path"); // join paths, os dependant

var port = "8080"

var sass = require('node-sass');
let cssPath = path.join(__dirname, "dist", "main.css")
sass.render({
  file: path.join(__dirname, "src", "main.scss"),
  outFile: cssPath,
  outputStyle: "compressed"
}, function(err, result) { 
  console.log('result of scss:', result);
  fs.writeFile(cssPath, result.css, function(err){
    if(!err){
      //file written on disk
      console.log("written to disk css yay");
    }
  });
});


app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.set("view engine", "pug");
app.use(routerHtml);
app.use(routerUpload);
app.use(routerDownload);
app.use(routerJson);
app.use(routerDelete);
app.use(routerImgPreview);
app.use(express.static("dist"));

//All files
app.use(function(req, res, next) {
  //used every time
  console.log("(*)");
  next();
});
//Errors:
app.use(function(err, req, res, next) {
  console.log("(Unhandled Error)= ", err);
  res.status(500).send("Something went wrong!");
});

models.sequelize.sync().then(function() {

  app.listen(port);

});


