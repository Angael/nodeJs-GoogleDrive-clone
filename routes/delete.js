var fs  = require('fs-extra');
var express = require('express');
var router  = express.Router();
var path = require("path")
var sendErr = require("./errorManager")
var valid = require("../lib/dataValidation")
var models  = require('../models');
var auth  = require('../lib/auth');


router.get("/delete/file/:fileId", auth.verifyUser, function(req, res) {
  let id = valid.verifyID(req.params.fileId)
  let uid = req.token.uid
  //Search for id in db
  //Delete file from disc = unlink
  //Delete this file row in db
  models.File.findOne({
    where: {
      id: id,
      ownerId: uid
    },
    raw: true
  })
    .then(_file => {
      console.log(_file);
      if(!_file){
        //todo only in dev throw error, in production handle it
        throw "invalid File"
      }
      var file = path.join(__dirname, "..", "/uploads/", _file.generatedName);
      console.log("pathjoin: ", file);
      fs.unlink(file, err => {
        if (err) {
          console.log("Error: Probably file existed only in db");
        }
        console.log("in unlink");

        models.File.destroy({
          where: {
            id: id,
            ownerId: uid
          }
        }).then((e) => {
          console.log("file was deleted: ", _file.originalName);
          res.sendStatus(204);
        }).catch(e => {
          res.send(500,"Couldn't delete file with id: " + id);
          console.log(e);
        });

        return;
      });
    })
    .catch(e => {
      res.send(500,"Couldn't find file with id: " + id);
      console.log(e);
    });
});

router.delete("/delete/folder/:path", auth.verifyUser, function(req, res) {
  let pathParam = valid.verifyDir(req.params.path)
  let uid = req.token.uid
  console.log("del path param", pathParam);

  models.File.findAll({
    where: {
      dir:{
        [models.Sequelize.Op.like]:{
          [models.Sequelize.Op.any]: [pathParam + "/%", pathParam]
        }
      },
      ownerId:uid
    },
    raw: true
  })
    .then(files => {
      if(!files){
        throw "Error: files to delete empty?" //todo: handle exception not throw
      }
      let IDsToDelete = files.map((file) => {
        return file.id
      });
      if(IDsToDelete.length === 0){
        //will prevent querying with empty array and crashing
        IDsToDelete = [-1]
      }

      files.forEach(element => {
        let filePath = path.join(__dirname, "..", "/uploads/", element.generatedName)
        fs.unlink(filePath, (result) => {
          //console.log(result)
        })
      });

      let folderDestroyPromise = models.Folder.destroy({
        where: {
          path: {
            [models.Sequelize.Op.like]:{
              [models.Sequelize.Op.any]: [pathParam + "/%", pathParam]
            }
          },
          ownerId:uid
        }
      })

      let fileDestroyPromise = models.File.destroy({
        where: {
          id: {
            [models.Sequelize.Op.in]: IDsToDelete
          },
          ownerId:uid
        }
      })

      Promise.all( [fileDestroyPromise, folderDestroyPromise] ).then( e => {
        res.sendStatus(204)
      }).catch( e => {
        res.send(500,"Couldn't finish operation")
        console.log(e)
      })
    })
    .catch(e => {
      res.send(500,"Couldn't finish operation")
      console.log(e)
    });
});

//Delete all selected files and folders
//WARNING: Nightmare code below, TODO: rewrite
//TODO: before res.sendStatus(204); we should wait for all promises of unlink to finish
router.post("/delete/selected", auth.verifyUser, function(req, res) {
  console.log("req body", req.body)
  let uid = req.token.uid
  //json przyjmuje tylko wartosci z "" a nie ''
  //let selected = JSON.parse(req.body.selected.replace(/'/g, '"'));
  let files = valid.verifyIDArray(req.body.files)
  let folders = valid.verifyDirArray(req.body.folders)
  folders = valid.dirAndAnySubDir(folders)

  let $ = models.Sequelize.Op;
  let destroyFolders = models.Folder.destroy({
    where: {
      path:{
        [$.like]:{
            [$.any]: folders
          }
      },
      ownerId:uid
    }
  }).then((params) => {
    console.log("destroyed folders");    
  })

  models.File.findAll({
    where: {
      [$.or]: [
        {
          id:{
            [$.in]:files
          },
          ownerId:uid
        },
        {
          dir:{
            [$.like]:{
                [$.any]: folders
              }
          },
          ownerId:uid
        }
      ]
    }
  }).then( (files) => {
    console.log("files inside findall", files);
    if (!files) {
      throw "No files found? how" // todo handle exception, not throw
    }
    //used to destroy all files with these id's, should be faster than query above
    let filesIdArray = files.map((file) => {
      return file.id
    })
    let destroyFiles = models.File.destroy({
      where:{
        id: {
          [$.in]: filesIdArray
        },
        ownerId:uid
      }
    })
    console.log("should work");
    //used to unlink all files
    let filesPaths = files.map((file) => {
      return path.join(__dirname, "..","uploads/", file.generatedName)
    })
    for (let path of filesPaths) {
      fs.unlink(path)
    }
    console.log("shouldnt work");
    Promise.all( [destroyFiles, destroyFolders] ).then( (params) => {
      res.sendStatus(204)
    }).catch((e) => {
      console.log(e);
      res.send(500, "Something gone wrong")
    })
  })


});


module.exports = router;