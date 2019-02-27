var express = require("express");
var app = express();
var router = express.Router(); // router for this app
var fs = require("fs-extra"); // file system
var pug = require("pug"); // pug html syntax
var bodyParser = require("body-parser"); // get post values
var formidable = require("formidable"); // upload
const Sequelize = require("sequelize"); // database
var path = require("path"); // join paths, os dependant
var archiver = require("archiver"); // zip files when downloading many at once
const sharp = require('sharp'); // resize images for previews
console.log("starting app...", __dirname);
var port = process.env.PORT || 8080; // set our port

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

//konto użytkownika na laptopie to krzys
const sequelize = new Sequelize("testdb", "krzys", "root", {
  host: "localhost",
  dialect: "postgres",
  //What is pool? This is copied from sequelize Get Started tutorial
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

//Sequelize robi swoją własną tabelę, dodaje do file "s" na końcu
const FileR = sequelize.define("file", {
  fullName: {//previous name: "path"
    type: Sequelize.TEXT
  },
  dir: {
    type: Sequelize.TEXT
  },
  ownerId: {
    type: Sequelize.INTEGER
  }
});
//Synchronize once
FileR.sync({
  force: false
}).then(arg => {

}); // TODO: what happens if it fails to sync, or fails during app works and possibly not reconnect???

router.use(function(req, res, next) {
  //used every time
  console.log("(*)");
  next();
});
router.post("/download/zip", function(req, res) {
  console.log("req body", req.body.selected);
  //json przyjmuje tylko wartosci z "" a nie ''
  let selected = JSON.parse(req.body.selected.replace(/'/g, '"'));
  let files = selected.files;
  let folders = selected.folders;
  //let filePath = path.join(__dirname, "/uploads/", "Neverwinter_Nights_2__Mask_of_the_Betrayer__Exp_-PCArtwork4071NX1_PA_NPC_04262007_04_Okku.jpg")
  //let filePath2 = path.join(__dirname, "/uploads/", "/abc/" ,"/1527155171402322263693.jpg")
  var archive = archiver("zip");
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

  //files = [filePath, filePath2];
  folders.forEach((element, index, array) => {
    array[index] = path.join(__dirname, "/uploads/", element);
  });

  //let filePaths = new Array();
  FileR.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: files
      }
    },
    raw: true
  })
    .then(files => {
      //got files in json
      let filePaths = files.map(a => {
        return path.join(__dirname, "/uploads/", a.dir, a.path);
      });

      for (var i in filePaths) {
        archive.file(filePaths[i], {
          name: path.basename(filePaths[i])
        });
      }

      //var directories = [__dirname + '/fixtures/somedir']

      for (var i in folders) {
        archive.directory(
          folders[i],
          folders[i].replace(path.join(__dirname, "/uploads/"), "")
        );
      }

      archive.finalize();
    })
    .catch(e => {
      res.status(500).send("Couldn't do it");
    });
});

router.get("/download/fullList/", function(req, res) {
  let folders = getRecursiveFolderListJson();
  folders.shift() //first element is always ".." so we don't want that
  FileR.findAll({
    raw: true
  })
    .then(files => {
      //got files in json
      let foldersAndFiles = {
        folders: folders,
        files: files
      };
      res.json(foldersAndFiles);
    })
    .catch(e => {
      res.status(500).send("Couldn't get full list");
    });
})
// Will be depricated
router.get("/download/list/:dir", function(req, res) {
  let dir = req.params.dir;
  let folders = getFolderListJson(dir); //got folders in json
  FileR.findAll({
    where: {
      dir: dir
    },
    raw: true
  })
    .then(files => {
      //got files in json
      let foldersAndFiles = {
        folders: folders,
        files: files
      };
      res.json(foldersAndFiles);
    })
    .catch(e => {
      res.status(500).send("Couldn't get list");
    });
});

//preview of img,vid
router.get("/download/filePreview/:fileId", function(req, res) {
  let id = req.params.fileId;
  console.time("received to got DB"+id);
  FileR.findOne({
    where: {
      id: id
    },
    raw: true
  })
    .then(_file => {
      console.timeEnd("received to got DB"+id);
      console.time("DB to resized send"+id);
      var file = path.join(__dirname, "/uploads/", _file.dir, _file.path);
      if(fs.existsSync(file)){
        const readStream = fs.createReadStream(file);
        let transform = sharp();
      
        let width = 286, 
        height = 208;
        format = path.extname(file).substr(1); //extension minus dot at the beggining
        if (format) {
          transform = transform.toFormat(format);
        }
        if (width || height) {
          transform = transform.resize(width, height);
        }
        res.type(`image/${format || 'png'}`);
        console.timeEnd("DB to resized send"+id);      
        readStream.pipe(transform).pipe(res);
      }else{
        res.status(500).send("Error with preview");
      }
      
    
      
      
      //console.log("pathjoin: ", file);
      // res.download(file, function(err) {
      //   if (err) {
      //     console.log("Error");
      //     console.log(err);
      //   } else {
      //     console.log("Success");
      //   }
      // });
    })
    .catch(e => {
      res.status(500).send("Couldn't get file");
      console.log(e);
    });
});
router.get("/download/file/:fileId", function(req, res) {
  let id = req.params.fileId;
  FileR.findOne({
    where: {
      id: id
    },
    raw: true
  })
    .then(_file => {
      if(_file === null){
        throw "No file with this ID"
        return;
      }
      console.log(_file);
      var file = path.join(__dirname, "/uploads/", _file.dir, _file.path);
      console.log("pathjoin: ", file);
      res.download(file, function(err) {
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

router.post("/create/folder", function(req, res) {
  var folderPath = req.body.path;
  folderPath = path.join(__dirname, "/uploads/", folderPath);
  console.log(folderPath);
  fs.ensureDir(folderPath, err => {
    console.log(err); // => null
    // dir has now been created, including the directory it is to be placed in
    res.sendStatus(200);
  });
});
function getFolderListJson(dir) {
  let dirsInFolder = getDirectories(path.join(__dirname, "/uploads/", dir));
  dirsInFolder.forEach((element, index, array) => {
    //wytnij ścieżkę przed, i razem z /uploads
    array[index] = element.substring(path.join(__dirname, "/uploads").length);
    //urls have / instead of \ so we need to change them
    array[index] = array[index].replace(new RegExp(/\\/, "g"), "/");
  });
  return dirsInFolder;
}
function getRecursiveFolderListJson() {
  let dirsInFolder = getDirectoriesRecursive("Uploads/");
  dirsInFolder.forEach((element, index, array) => {
    //wytnij ścieżkę przed, i razem z /uploads
    array[index] = element.substring(path.join("/uploads").length);
    //urls have / instead of \ so we need to change them
    array[index] = array[index].replace(new RegExp(/\\/, "g"), "/");
  });
  return dirsInFolder;
}

router.post("/upload/files", function(req, res) {
  var form = new formidable.IncomingForm();
  //let dir = req.body.dir;
  //let ownerId = req.body.user;
  //Max 20 MB for form fields except files
  form.maxFieldsSize = 20 * 1024 * 1024;

  //Max 10 GB for files
  form.maxFileSize = 10 * 1024 * 1024 * 1024;

  //TODO: Check for name collision, now it creates duplicate db entry and replaces file
  var dir, ownerId;
  form
    .parse(req)
    .on("field", function(name, field) {
      console.log("onField yay ", name, field);

      dir = name === "dir" ? field : dir;
      ownerId = name === "user" ? field : ownerId;
    })
    .on("fileBegin", function(name, file) {
      console.log("filebegin yay name ", name);
      file.path = path.join(__dirname, "/uploads/", dir, file.name);
    })
    .on("file", function(name, file) {
      console.log("file yay");
      console.log("Uploaded " + file.name);
      //ensure beggining slash, as it is root dir, everything is in it
      if(dir[0]!=='/'){
        dir = '/' + dir;
      }
      FileR.create({
        path: file.name,
        dir: dir,
        ownerId: ownerId
      });
    });
  fs.readFile("./paths/index.pug", function(err, pugHtml) {
    if (err) {
      res.writeHeader(404, {
        "Content-Type": "text/html"
      });
      res.write("Didn't find page");
      res.end();
      throw err;
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

router.get("/", function(req, res) {
  fs.readFile("./paths/index.pug", function(err, pugHtml) {
    if (err) {
      res.writeHeader(404, {
        "Content-Type": "text/html"
      });
      res.write("Didn't find page");
      res.end();
      throw err;
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

const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory);
function flatten(lists) {
  return lists.reduce((a, b) => a.concat(b), []);
}
function getDirectoriesRecursive(source) {
  return [source, ...flatten(getDirectories(source).map(getDirectoriesRecursive))];
}
//test usage
// console.log(getDirectories(path.join(__dirname, "/uploads/")));
// console.log(path.join(__dirname, "/uploads/"));

app.set("view engine", "pug");
app.use(router);
app.use(express.static("public"));

//What happens to errors? This
app.use(function(err, req, res, next) {
  //console.error(err.stack)
  console.log("(Unhandled Error)= ", err);
  res.status(500).send("Something went wrong!");
});

app.listen(port);

console.log("Waiting on port " + port);
