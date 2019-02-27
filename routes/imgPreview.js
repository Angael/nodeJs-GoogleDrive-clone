var fs = require("fs-extra");
var express = require("express");
var router = express.Router();
var path = require("path");
var models = require("../models");
var valid = require("../lib/dataValidation");
const sharp = require("sharp"); // resize images for previews
var auth = require("../lib/auth");

const allowedFormats = ["JPEG", "PNG", "WEBP", "TIFF", "GIF", "SVG"];
const allowedFormatsOutput = ["JPEG", "PNG", "WEBP", "TIFF"];
//preview of img,vid
//todo: fixme HOW THE HELL DO I PROTECT img source?? Perhaps token in get? but then
//rendering items could be quite long
router.get("/download/filePreview/:fileId", function(req, res) {
  let id = valid.verifyID(req.params.fileId);
  models.File.findOne({
    where: {
      id: id
    },
    raw: true
  })
    .then(_file => {
      console.log("_file preview :", _file);
      var file = path.join(__dirname, "..", "/uploads/", _file.generatedName);
      var format = path.extname(_file.originalName).substr(1); //extension minus dot at the beggining
      var formatOutput = format;
      console.log("111 :", path.extname(file));
      console.log("format ", format, format.toUpperCase());
      if (!allowedFormatsOutput.includes(format.toUpperCase())) {
        formatOutput = "png";
        console.log("converted format from :", format);
      }
      //Check if format is supported and if file actually exists
      if (
        allowedFormats.includes(format.toUpperCase()) &&
        fs.existsSync(file)
      ) {
        console.log("123");

        //try, because our img tool can be faulty,
        //cause sharp is async it won't probably work anyway
        try {
          const readStream = fs.createReadStream(file);
          let transform = sharp();

          let width = 286,
            height = 208;
          if (format) {
            transform = transform.toFormat(formatOutput);
            // transform.tofi;
          }
          if (width || height) {
            transform = transform.resize(width, height);
          }
          res.type(`image/${formatOutput || "png"}`);
          readStream.pipe(transform).pipe(res);
        } catch (error) {
          //can't generate preview, send full img
          console.log("error :", error);
          res.type(`image/${format}`);
          res.sendFile(file);
        }
      } else {
        console.log("22");
        res.type(`image/${format}`);
        res.sendFile(file);

        //res.status(500).send("Error with preview");
      }
    })
    .catch(e => {
      res.status(500).send("Couldn't get file");
      console.log(e);
    });
});

//full graphic
router.get("/download/image/:fileId", function(req, res) {
  let id = valid.verifyID(req.params.fileId);
  models.File.findOne({
    where: {
      id: id
    },
    raw: true
  })
    .then(_file => {
      console.log("_file img :", _file);
      var file = path.join(__dirname, "..", "/uploads/", _file.generatedName);
      var format = path.extname(_file.originalName).substr(1); //extension minus dot at the beggining

      //Check if format is supported and if file actually exists
      if (fs.existsSync(file)) {
        console.log("123");
        if (format.toUpperCase() === "SVG") {
          format = "svg+xml";
        }
        res.type(`image/${format}`);
        res.sendFile(file);
      } else {
        res.status(500).send("Error, file doesn't exist");
      }
    })
    .catch(e => {
      res.status(500).send("Couldn't get file in DB");
      console.log(e);
    });
});
module.exports = router;
