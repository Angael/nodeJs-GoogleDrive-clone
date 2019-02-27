import { changeDir } from "./app";
import {
  showDetails,
  toggleSelectSingle,
  shiftSelect,
  selectContext
} from "./select";
import { smallScreenOnly, bigScreenOnly } from "./mediaQuery";
import { downloadDisplayedItem, deleteDisplayedItem } from "./fileOperations";
/**
 * Add onclick to all items (files and folders shown)
 *
 * Should be performed after each render of new items page
 */
export function addOnClickItems() {
  $(".itemContainer never activate please").Longtap({
    onStartDelay: 0,
    timeout: 550,
    onStart: (event, target) => {
      // do something
      console.log("start :");
      //   M.toast({html: `start`});
      //showDetails(target["0"]);
    },
    onSuccess: (event, target) => {
      // do something
      console.log("success :");
      $(target[0]).toggleClass("selected");
      //   M.toast({html: `success`});
    },
    onStop: (event, target) => {
      // do something
      console.log("stop :");
      //   M.toast({ html: `stop` });
    },
    onClick: (event, target) => {
      // do something
      console.log(target);

      if (event.shiftKey) {
        // M.toast({ html: `shift clicked` });
        $(target[0]).toggleClass("selected");
      } else if (event.ctrlKey) {
        // M.toast({ html: `ctrl clicked` });
      } else {
        // M.toast({ html: `clicked` });
        showDetails(target["0"]);
        if (target["0"].classList.contains("folder")) {
          //If this is folder we open it
          let dir = target[0].dataset.dir;
          changeDir(dir);
        }
      }
    },
    onSelect: (event, target) => {
      // do something
      console.log("select");
    },
    onContext: (event, target) => {
      // do something
      console.log("context");
      M.toast({ html: `Context` });
    }
  });
  $(".itemContainer").on("click", event => {
    let target = event.delegateTarget;
    let clickedPart = event.target;
    //Obsługa shift i ctrl
    if (event.shiftKey) {
      // M.toast({ html: `shift clicked` });
      shiftSelect(target);
      return;
    } else if (event.ctrlKey) {
      toggleSelectSingle(target);
      return;
    } else {
      // M.toast({ html: `clicked` });
    }

    smallScreenOnly().then(() => {
      // folders can be clicked on button to show menu
      if (target.classList.contains("folder")) {
        // check if we clicked menu button
        if (clickedPart.classList.contains("itemInfo_button")) {
          showDetails(target);
          return;
        } else {
          let dir = target.dataset.dir;
          changeDir(dir);
          return;
        }
      } else {
        // all files can show details
        // On small screen we want to enable selection by click after the first one
        if (selectContext.selectMode) {
          toggleSelectSingle(target);
          return;
        } else {
          showDetails(target);
          return;
        }
      }
    });
    //Something to happen on normal click on computer
    showDetails(target);
    if (target.classList.contains("folder")) {
      //If this is folder we open it
      let dir = target.dataset.dir;
      changeDir(dir);
    }
  });
  /**
   * On android make long press select item
   */
  $(".itemContainer").on("contextmenu", event => {
    let target = event.delegateTarget;
    smallScreenOnly().then(() => {
      //selecting on or off?
      event.preventDefault();
      event.stopPropagation();
      $(target).toggleClass("selected");
    });
  });

  $(".file .btn.Download").on("click", element => {
    let id = $(element.target)
      .closest(".file")
      .data("id");
    getFirebaseToken().then(token => {
      window.location.href =
        "/download/file/" + id + "?token=" + encodeURI(token);
    });
  });
  $(".file .btn.Delete").on("click", element => {
    let id = $(element.target)
      .closest(".file")
      .data("id");
    getFirebaseToken().then(token => {
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
    });
  });

  //Folders Onclick
  $(".folder").on("click", event => {
    //changes what directory we are looking at
  });

  $(".folder .btn.Delete").on("click", event => {
    event.stopPropagation();
    let dirNotEncoded = $(event.target)
      .closest(".folder")
      .data("dir");
    /**
     * following is useless? TODO: don't encode dir, in DB it doesn't have /
     */
    let dirEncoded =
      dirNotEncoded[0] === "/" ? dirNotEncoded : "/" + dirNotEncoded;
    dirEncoded = encodeURIComponent(dirNotEncoded);
    if (
      confirm(
        "Do you really want to delete this folder and all of its contents? " +
          dirNotEncoded
      )
    ) {
      getFirebaseToken().then(token => {
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
      });
    }
  });
  //Folders/Files Selecting Onclick and menu
  $(".itemIcon .icon").on("click", event => {
    //stopPropagation disables parent click event
    event.stopPropagation();
    selectItem(event);
  });
  $(".btn.Menu").on("click", event => {
    event.stopPropagation();
    $(event.target)
      .closest(".itemContainer")
      .addClass("inMenu");
  });
  $(".itemMenuView").mouseleave(function() {
    $(event.target)
      .closest(".itemContainer")
      .removeClass("inMenu");
  });
  $(".folder .btn.Download").on("click", function() {
    event.stopPropagation();
    getFirebaseToken().then(token => {
      var form = $('<form method="POST" action="/download/zip">');
      let parent = $(event.target).closest(".itemContainer");
      let dir = parent.data("dir");
      let selectedThisFolder = {
        files: [],
        folders: [dir]
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
    });
  });

  $(".itemContainer").draggable({
    revert: "invalid",
    revertDuration: 100,
    cancel: ".btn, .itemIcon",
    zIndex: 9,
    cursor: "move",
    cursorAt: { top: -20, left: -20 },
    helper: function(event) {
      let fileName = $(event.target)
        .closest(".itemContainer")
        .find(".itemName")
        .text();
      return $(`<div class='drag-helper'>${fileName}</div>`);
    }
  });

  $(".folder").droppable({
    tolerance: "pointer",
    classes: {
      "ui-droppable-active": "debugGray",
      "ui-droppable-hover": "debugGreen"
    },
    drop: function(event, ui) {
      $(this)
        .addClass("debugGreen")
        .find("p")
        .html("Dropped!");
    }
  });
  $("#pathGoUp").droppable({
    tolerance: "pointer",
    classes: {
      "ui-droppable-active": "debugGray",
      "ui-droppable-hover": "debugGreen"
    },
    drop: function(event, ui) {
      $(this)
        .addClass("debugGreen")
        .find("p")
        .html("Dropped!");
    }
  });
}
/**
 * Adds onclick to all menu buttons at the start of application initialization
 *
 * Should happen only once
 */
export function addOnClickInit() {
  $(".itemDetails_download").on("click", downloadDisplayedItem);
  $(".itemDetails_delete").on("click", deleteDisplayedItem);
}

export function addOnClick_ModalItemDetails() {
  $("#modalItemDetails button.itemDetails_download").on("click", () => {
    downloadDisplayedItem();
    let itemDetailsModal = M.Modal.getInstance($("#modalItemDetails"));
    itemDetailsModal.close();
  });
  $("#modalItemDetails button.itemDetails_delete").on("click", () => {
    deleteDisplayedItem();
    let itemDetailsModal = M.Modal.getInstance($("#modalItemDetails"));
    itemDetailsModal.close();
  });
}
