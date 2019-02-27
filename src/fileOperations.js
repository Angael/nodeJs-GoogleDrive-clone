import { getFirebaseToken } from "./auth";
import { updateFileListFromVar } from "./renderItems";
import { context } from "./app";

export function downloadFullList() {
  getFirebaseToken().then(token => {
    $.ajax({
      type: "GET",
      url: "/download/fullList/",
      headers: {
        Authorization: token
      },
      success: function(data) {
        context.itemList = data;
        updateFileListFromVar();
      },
      error: function(error) {
        console.log("error :", error);
        //alert("Error : " + error.statusText)
      },
      async: true,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 10000
    });
  });
}

/**
 * Function to start downloading currently viewed item.
 *
 * Firstly it checks #itemDetails data attributes for info on viewed object,
 * then it
 */
export function downloadDisplayedItem() {
  let itemDetailsData = document.getElementById("itemDetails").dataset;
  //TODO change functionality
  getFirebaseToken().then(token => {
    var form = $('<form method="POST" action="/download/zip">');
    let fileOrFolder = itemDetailsData.type;
    if (fileOrFolder === "file") {
      let id = itemDetailsData.id;
      window.location.href =
        "/download/file/" + id + "?token=" + encodeURI(token);
    } else if (fileOrFolder === "folder") {
      let selectedThisFolder = {
        files: [],
        folders: [itemDetailsData.dir]
      };
      let thatInputJsonValueHack = JSON.stringify(selectedThisFolder).replace(
        /"/g,
        "'"
      );

      form.append(
        $(
          '<input type="hidden" name="selected" value="' +
            thatInputJsonValueHack +
            '">'
        )
      );

      //Hope token doesn't have qoute inside
      form.append(
        $('<input type="hidden" name="token" value="' + token + '">')
      );
      $("body").append(form);
      form.submit();
    }
  });
}

export function deleteDisplayedItem() {
  let itemDetailsData = document.getElementById("itemDetails").dataset;
  getFirebaseToken().then(token => {
    let fileOrFolder = itemDetailsData.type;
    if (fileOrFolder === "file") {
      let id = encodeURIComponent(itemDetailsData.id);
      $.ajax({
        type: "GET",
        url: "/delete/file/" + id,
        headers: {
          Authorization: token
        },
        success: function(data) {
          console.log(data);
          downloadFullList();
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
    } else if (fileOrFolder === "folder") {
      let dirNotEncoded = itemDetailsData.dir;
      let dirEncoded = encodeURIComponent(dirNotEncoded);
      if (
        confirm(
          "Do you really want to delete this folder and all of its contents? " +
            dirNotEncoded
        )
      ) {
        $.ajax({
          type: "DELETE",
          url: "/delete/folder/" + dirEncoded,
          headers: {
            Authorization: token
          },
          complete: function(data) {
            console.log("delete folder, data:", data);
            downloadFullList();
          },
          error: function(error) {
            console.error(error);
            //alert("Error : "+error)
          },
          async: true,
          cache: false,
          contentType: false,
          processData: false,
          timeout: 4900
        });
      }
    }
  });
}
