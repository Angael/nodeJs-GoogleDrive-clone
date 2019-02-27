var fs  = require('fs-extra');
var express = require('express');
var router  = express.Router();
var path = require("path")
var sendErr = require("./errorManager")
var models  = require('../models');
var archiver = require("archiver"); // zip files when downloading many at once
var auth = require("../lib/auth")


router.get("/download/file/:fileId", auth.verifyUserGet, function(req, res) {
  let id = req.params.fileId
  let uid = req.token.uid

  //console.log("id", id, req.body, req.params)
  models.File.findOne({
    where: {
      id: id,
      ownerId: uid
    },
    raw: true
  })
    .then(_file => {
      if(_file === null){
        //TODO should not throw in production, but handle error
        throw "No file with this ID"
      }
      console.log("_file", _file);
      var file = path.join(__dirname, "..", "/uploads/", _file.generatedName);
      //console.log("pathjoin: ", file, _file.originalName);
      res.download(file ,_file.originalName ,function(err) {
        if (err) {
          console.log("Error");
          console.log(err);
        } else {
          console.log("Success");
        }
      });
    })
    .catch(e => {
      res.status(500).send("Couldn't get file");
      console.log(e);
    });
});

router.post("/download/zip", auth.verifyUserPost, function(req, res) {
  console.log("download zip .selected =", req.body.selected)
  //json przyjmuje tylko wartosci z "" a nie ''
  let selected = JSON.parse(req.body.selected.replace(/'/g, '"'))
  let files = selected.files
  let folders = selected.folders
  let uid = req.token.uid
  var archive = archiver("zip")
  //TODO finish down here rest, make it work with multiple filesfolders
  archive.on("error", function(err) {
    res.status(500).send({
      error: err.message
    });
  });

  //on stream closed we can end the request
  archive.on("end", function() {
    console.log("Archive wrote %d bytes", archive.pointer());
  });

  //set the archive name
  res.attachment("selected.zip");

  //this is streaming back to user
  archive.pipe(res);


  // e.g. folder1/folder2% matches everything in folder2 and below
  let foldersForQuery = folders.map( x => {
    return x+"%";
  })
  if(foldersForQuery.length === 0){
    foldersForQuery = ["//"]
    //folder should never be named //
  }
  //let filePaths = new Array();
  //Query description:
  //find files with id that is in supplied array
  //and find files that dir's start with dirs we supplied
  //cause we want to upload all subfiles too
  models.File.findAll({
    where: {
      [models.Sequelize.Op.or]: [
        {
          id:{
            [models.Sequelize.Op.in]:files
          },
          ownerId:uid
        },
        {
          dir:{
            [models.Sequelize.Op.like]:{
                [models.Sequelize.Op.any]: foldersForQuery
              }
          },
          ownerId:uid
        }
      ]
    },
    raw: true
  })
    .then(files => {
      console.info("files", files);
      if(!files){
        //TODO archiver memory leak because we don't stop it
        throw "No selected files found"
      }
      // got files we need to pack, now find them and archive.file() add to archive
      // we pipe back to user
      let filePaths = files.map(a => {
        let newObj = {
          //remember we are in /routes file
          path: path.join(__dirname, "..", "/uploads/", a.generatedName),
          name: a.originalName,
          prefix: a.dir
        }
        return newObj
      });
      console.info(filePaths);

      for (var i in filePaths) {
        archive.file(filePaths[i].path, {
          name: filePaths[i].name,
          prefix: filePaths[i].prefix
        });
      }

      //var directories = [__dirname + '/fixtures/somedir']

      // for (var i in folders) {
      //   archive.directory(
      //     folders[i],
      //     folders[i].replace(path.join(__dirname, "/uploads/"), "")
      //   );
      // }

      archive.finalize();
    })
    .catch(e => {
      res.status(500).send("Couldn't do it");
    });
});

module.exports = router;