var fs  = require('fs-extra');
var express = require('express');
var router  = express.Router();
var path = require("path")
var sendErr = require("./errorManager")
var models  = require('../models');
var auth = require("../lib/auth")
// const bodyParser = require('body-parser');
// router.use( express.json() );       // to support JSON-encoded bodies
// router.use( express.urlencoded({     // to support URL-encoded bodies
//   extended: true
// })); 
var multer  = require('multer')
var upload = multer({ dest: "uploads/" })

//todo upload.any() is probably a bad idea, but for now it's ok
router.post('/upload/files', auth.verifyUser, upload.any(), function (req, res, next) {
  // req.files is array of files
  // req.body will contain the text fields, if there were any
  let uid = req.token.uid
  //todo: verify data
  //verifyId(req.body.user)
  //todo start usign verifyDir directly from lib/dataValidation.js
  req.body.dir = verifyDir(req.body.dir)
  
  let fileArray = [];
  for (let i = 0; i < req.files.length; i++) {
    const element = req.files[i];

    fileArray.push({
      originalName: element.originalname,
      generatedName: element.filename,
      dir: req.body.dir,
      ownerId: uid
    })
  }

  //create many rows from one array
  models.File.bulkCreate(fileArray).then((param) => {
    console.log("files added to db");
    res.sendStatus(200);
  });

})

function verifyDir(dir){
  //remove all slashes in beggining and multiples next to eachother
  //console.log("dir", dir);
  let newDir = String(dir);
  newDir = newDir.replace(/(%|_)+/g, "")
  newDir = newDir.replace(/\/\/+/g, "/")
  //console.log("newDir", newDir);
  //first character can't be slash
  if(newDir[0]==="/"){
    newDir = newDir.slice(1);
  }
  //last character can't be slash
  if(newDir[newDir.length-1]==="/"){
    newDir = newDir.slice(0, -1); // "12345.0"
  }
  //console.log("return newDir", newDir);
  return newDir;
}

router.post('/create/folder', auth.verifyUser, function (req, res, next) {
  let folderPath = verifyDir(req.body.path)
  let uid = req.token.uid
  console.log("folderPath created = ", folderPath);
  //Folder invalid
  if(folderPath === ""){
    res.sendStatus(422);
    return
  }
  models.Folder.create({
    path: folderPath,
    ownerId: uid
  }).then((param) => {
    console.log("folder added to db");
    res.sendStatus(200);
  });

})

module.exports = router;