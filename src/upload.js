import { getFirebaseToken } from "./auth";

export var Upload = function(filesArray) {
  this.files = filesArray;
};

Upload.prototype.getType = function(index) {
  return this.files[index].type;
};
Upload.prototype.getSize = function(index) {
  return this.files[index].size;
};
Upload.prototype.getName = function(index) {
  return this.files[index].name;
};
/**
 * Upload file as a formData request
 *
 * Will also automatically handle progressBar updates
 * @param {"Object"} options - Object that has following params:
 * @param {String} options.workingDir - e.g. "/folder1"
 * @param {function} options.success - what to do on sucessfull upload
 * @param {function} options.fail - what to do on failed upload
 * @type{object} options
 */
Upload.prototype.doUpload = function(options) {
  var that = this;
  var formData = new FormData();
  if (options === undefined) {
    options = {}; // if somebody forgets to put options it won't crash
  }

  //Show progress Bar
  $("#modalProgressBarWindow").slideDown();

  // add assoc key values, this will be posts values
  // kolejnosc ma znaczenie przy odczytywaniu bo to multipart
  let workingDir = "";
  if (options.workingDir !== undefined) {
    workingDir = options.workingDir;
  }
  let dir = workingDir[0] === "/" ? workingDir : "/" + workingDir;
  formData.append("dir", dir);
  formData.append("user", 0); //Temporary identification TODO: delete
  for (let i = 0; i < this.files.length; i++) {
    formData.append("file[]", this.files[i], this.getName(i));
  }
  //TODO: some other authentication
  for (var pair of formData.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }
  getFirebaseToken().then(token => {
    $.ajax({
      type: "POST",
      url: "/upload/files",
      headers: {
        Authorization: token
      },
      xhr: function() {
        var myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener(
            "progress",
            that.progressHandling,
            false
          );
        }
        return myXhr;
      },
      success: options.success || function(data) {},
      error: options.fail || function(error) {},
      async: true,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 4900
    });
  });
};
Upload.prototype.progressHandling = function(event) {
  var percent = 0;
  var position = event.loaded || event.position;
  var total = event.total;
  var progress_bar_id = "#progress-wrp";
  if (event.lengthComputable) {
    percent = Math.ceil((position / total) * 100);
  }
  // update progressbars classes so it fits your code
  $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
  $(progress_bar_id + " .status").text(percent + "%");
};

/**
 * Calls Ajax to create Folder path.
 * @returns {Promise} Promise that resolves after folder was created
 * @param {String} workingDir - Path in which to create the folder
 * @param {String} createdPath - Name of the folder
 *
 */
export function createFolder(workingDir, createdPath) {
  return new Promise((resolve, reject) => {
    let desiredFolderPath;
    //Chcemy by było /abc + qwe = /abc/qwe
    //zarazem / + qwe = /qwe
    if (workingDir[workingDir.length - 1] === "/") {
      desiredFolderPath = workingDir + createdPath;
    } else {
      desiredFolderPath = workingDir + "/" + createdPath;
    }

    getFirebaseToken().then(token => {
      $.ajax({
        type: "POST",
        url: "/create/folder",
        headers: {
          Authorization: token
        },
        success: function(data) {
          resolve();
        },
        error: function(error) {
          reject();
          console.log(error);
        },
        async: true,
        data: {
          path: desiredFolderPath
        },
        cache: false,
        timeout: 4900
      });
    });
  });
}
