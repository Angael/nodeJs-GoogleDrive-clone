var fs  = require('fs-extra');
var express = require('express');
var router  = express.Router();
var path = require("path")
var sendErr = require("./errorManager")
var models  = require('../models');
var auth  = require('../lib/auth');

/*var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, path.basename(file.originalname) + '-' + Date.now())
  }
})*/

router.get("/download/fullList/", auth.verifyUser , function(req, res) {
    let FilePromise = models.File.findAll({
      raw: true,
      attributes: ['id', 'originalName', "dir"],
      where:{
        ownerId: req.token.uid
      }
    })
    let FolderPromise = models.Folder.findAll({
        raw: true,
        attributes: ['path'],
        where:{
          ownerId: req.token.uid
        }
    })
    Promise.all([FilePromise, FolderPromise]).then(
        (values) => {
            console.log(values);
            //got files in json
            let foldersAndFiles = {
                files: values[0],
                folders: values[1].map( (object)=>{
                    return object.path
                } )
            };
            res.json(foldersAndFiles);
        })
        .catch(e => {
            console.log(e);
            res.status(500).send("Couldn't get full list");
        });
})

//Auth.verifyUser makes sure this fires only if user is logged in
router.post("/api/testLogin", auth.verifyUser, function(req, res) {
    console.log('token :', req.token);
    let uid = req.token.uid
    res.sendStatus(200)
    
})

module.exports = router;