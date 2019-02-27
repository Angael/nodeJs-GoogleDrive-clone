import {
  selected,
  selectItem,
  cancelSelection,
  checkSelectedUpdate,
  sellectAllVisible
} from "./select";
import { getFirebaseToken, initAuth } from "./auth";
import { Upload, createFolder } from "./upload";
import { downloadFullList } from "./fileOperations";
import {
  updateFileListFromVar,
  renderFileFolderList,
  changeDisplayType
} from "./renderItems";
import { verifyDir } from "./verifyData";
import { addOnClickInit } from "./onClick";
const Dropzone = require("./dropzone"); //works too, webpack combines multiple import methods?
//import { Dropzone } from "./dropzone"; // imports but not whole?

/**
 * displayType should be of enum type, list here:
 * "normal" || "bigTile"
 */
export var context = {
  workingDir: "",
  itemList: { folders: [], files: [] },
  /** @example "normal" || "bigTile" */
  displayType: "normal"
};
// var context.itemList = "";
//var context.itemList = { folders: [], files: [] };
var areItemsBig = false;

$("#filesInput").on("change", function(e) {
  var files = $(this)[0].files;
  console.log(files[0]);
  var upload = new Upload(files);
  // TODO: maby check size or type here with upload.getSize() and upload.getType()
  // execute upload
  upload.doUpload({
    workingDir: context.workingDir,
    success: () => {
      setTimeout(() => {
        downloadFullList();
      }, 300);
      //hide progress bar after time
      setTimeout(() => {
        $("#modalProgressBarWindow").slideUp();
      }, 600);
    },
    fail: () => {}
  });
});

function updateFileList() {
  let dir =
    context.workingDir[0] === "/"
      ? context.workingDir
      : "/" + context.workingDir;
  dir = encodeURIComponent(dir); //escaping signs in the url
  getFirebaseToken().then(token => {
    $.ajax({
      type: "GET",
      url: "/download/list/" + dir,
      headers: {
        Authorization: token
      },
      success: function(data) {
        renderFileFolderList(data);
        checkSelectedUpdate();
      },
      error: function(error) {
        console.error("error :", error);
        //alert("Error : " + error.statusText)
      },
      async: true,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 60000
    });
  });
}

export function changeDir(dir) {
  context.workingDir = dir;
  $(".pathDir").text(context.workingDir);
  if (context.workingDir === "/") {
    $("#pathDirWrapper").slideUp(75);
  } else {
    $("#pathDirWrapper").slideDown(75);
  }
  updateFileListFromVar();
}

function goUpPath() {
  let array = verifyDir(context.workingDir).split("/");
  array.pop();
  let newPath = array.join("/");
  newPath = newPath === "" ? "/" : newPath;
  changeDir(newPath);
}
//W3Schools
var modal = document.getElementById("folderModal");
// Get the button that opens the modal
var btn = document.getElementsByClassName("createFolder")[0];
btn.onclick = function() {
  modal.style.display = "block";
  $("#folderDesiredName").val("");

  let desiredFolderPath;
  //Chcemy by było /abc + qwe = /abc/qwe
  //zarazem / + qwe = /qwe
  if (context.workingDir[context.workingDir.length - 1] === "/") {
    desiredFolderPath = context.workingDir + $("#folderDesiredName").val();
  } else {
    desiredFolderPath =
      context.workingDir + "/" + $("#folderDesiredName").val();
  }
  $(".folderFinalPath").text(desiredFolderPath);
};
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

$(".changeDisplayType").on("click", event => {
  changeDisplayType();
});
$(".selectAllVisible").on("click", sellectAllVisible);
$(".refreshButton").on("click", refreshItems);
//refresh items and animate .refreshbutton
function refreshItems() {
  downloadFullList();
  var rotation = function() {
    $(".refreshButton i").rotate({
      angle: 0,
      animateTo: 720,
      duration: 600,
      easing: function(x, t, b, c, d) {
        // t: current time, b: begInnIng value, c: change In value, d: duration
        return c * (t / d) + b;
      }
    });
  };
  rotation();
}

$(".CancelSelected").on("click", cancelSelection);

$("#folderButton").on("click", event => {
  createFolder(context.workingDir, $("#folderDesiredName").val())
    .then(() => {
      modal.style.display = "none";
      downloadFullList();
    })
    .catch(() => {
      modal.style.display = "none";
      console.error("Server didn't respond to create Folder?");
    });
});

$(".DownloadSelected").on("click", function() {
  getFirebaseToken().then(token => {
    var form = $('<form method="POST" action="/download/zip">');
    let thatInputJsonValueHack = JSON.stringify(selected).replace(/"/g, "'");
    form.append(
      $(
        '<input type="hidden" name="selected" value="' +
          thatInputJsonValueHack +
          '">'
      )
    );
    //Hope token doesn't have qoute inside
    form.append($('<input type="hidden" name="token" value="' + token + '">'));

    $("body").append(form);
    form.submit();
    console.log("sent selected", selected);
  });
});
$(".DeleteSelected").on("click", function() {
  getFirebaseToken().then(token => {
    $.ajax({
      type: "POST",
      url: "/delete/selected",
      headers: {
        Authorization: token
      },
      success: function(data) {
        downloadFullList();
      },
      error: function(error) {
        // handle error
        console.error(error);
      },
      async: true,
      data: selected,
      cache: false,
      timeout: 4900
    });
  });
});

$("#folderDesiredName").on("input", function() {
  let desiredFolderPath;
  //Chcemy by było /abc + qwe = /abc/qwe
  //zarazem / + qwe = /qwe
  if (context.workingDir[context.workingDir.length - 1] === "/") {
    desiredFolderPath = context.workingDir + $("#folderDesiredName").val();
  } else {
    desiredFolderPath =
      context.workingDir + "/" + $("#folderDesiredName").val();
  }
  $(".folderFinalPath").text(desiredFolderPath); // get the current value of the input field.
});

$("#pathGoUp").on("click", event => {
  goUpPath();
});

let dropzoneBody = new Dropzone("body", {
  url: "/file/post/not/used/why/read/it",
  clickable: false,
  uploadMultiple: true,
  autoProcessQueue: true,
  parallelUploads: 1000,
  //empty functions
  addedfile: function() {},
  thumbnail: function() {},
  uploadprogress: function() {},
  createElement: function() {}
});
dropzoneBody.on("processingmultiple", function(files) {
  console.log("processingmultiple", files);

  var upload = new Upload(files);
  // TODO: maby check size or type here with upload.getSize() and upload.getType()
  // execute upload
  upload.doUpload({
    workingDir: context.workingDir,
    success: () => {
      setTimeout(() => {
        downloadFullList();
      }, 300);
      //hide progress bar after time
      setTimeout(() => {
        $("#modalProgressBarWindow").slideUp();
      }, 600);
    },
    fail: () => {}
  });
});
dropzoneBody.uploadFiles = function() {}; // disable upload

/**
 * Initial application starting function
 *
 * Fired ONLY ONCE from auth.js upon receiving token from firebase
 */
function startApp() {
  console.log("startApp");
  addOnClickInit();
  downloadFullList();
  return;
  //every 2 sec test if items should be updated
  let refreshContent = setInterval(() => {
    //console.log("refresh");
    console.count("tryRefresh");
    getFirebaseToken().then(token => {
      $.ajax({
        type: "GET",
        url: "/download/fullList/",
        headers: {
          Authorization: token
        },
        success: function(data) {
          //check if we should actually refresh
          //compare arrays
          if (JSON.stringify(data) !== JSON.stringify(context.itemList)) {
            //console.log("stringify isnt same");
            context.itemList = data;
            updateFileListFromVar();
          } else {
            //console.log("stringify is same");
          }
        },
        error: function(error) {},
        async: true,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 4900
      });
    });
  }, 2000);
}

//Start aplikacji zaczyna się od rozpoczęcia Firebase:
initAuth(startApp);
