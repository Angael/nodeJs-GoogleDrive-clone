var fs  = require('fs-extra');
var express = require('express');
var router  = express.Router();
var pug = require("pug"); // pug html syntax

var sendErr = require("./errorManager")

router.get("/", function(req, res) {
  fs.readFile("paths/index.pug", function(err, pugHtml) {
    if (err) {
      throw err
      sendErr(req,res,500)
      return;
    }
    var fn = pug.compile(pugHtml.toString());
    var html = fn();

    res.writeHeader(200, {
      "Content-Type": "text/html"
    });
    res.write(html);
    res.end();
  });
});
router.get("/login", function(req, res) {
  fs.readFile("paths/login.pug", function(err, pugHtml) {
    if (err) {
      throw err
      sendErr(req,res,500)
      return;
    }
    var fn = pug.compile(pugHtml.toString());
    var html = fn();

    res.writeHeader(200, {
      "Content-Type": "text/html"
    });
    res.write(html);
    res.end();
  });
});
router.get("/loggedin", function(req, res) {
  fs.readFile("paths/loggedin.pug", function(err, pugHtml) {
    if (err) {
      throw err
      sendErr(req,res,500)
      return;
    }
    var fn = pug.compile(pugHtml.toString());
    var html = fn();

    res.writeHeader(200, {
      "Content-Type": "text/html"
    });
    res.write(html);
    res.end();
  });
});
module.exports = router;