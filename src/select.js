import { context } from "./app";
import { smallScreenOnly } from "./mediaQuery";
import { addOnClick_ModalItemDetails } from "./onClick";
export var selected = {
  files: [],
  folders: []
};
/**
 * On mobile allows for click selection after selecting first item
 * @property {HTMLElement} shiftSelectStartElem
 * */
export var selectContext = {
  selectMode: false,
  shiftSelectStartElem: null
};
//add to selected array, also update view
// export function selectItem(event) {
//   console.log("selectItem");
//   let parent = $(event.target).closest(".itemContainer");
//   parent.toggleClass("selected");
//   //find if its folder or file
//   //then add or remove from folder/file array
//   //depending on whether it is there already
//   if (parent.hasClass("folder")) {
//     //is folder
//     let dir = parent.data("dir");
//     let indexOfDir = selected.folders.indexOf(dir);
//     //-1 jesli nie ma, inaczej zwroci indeks
//     if (indexOfDir === -1) {
//       selected.folders.push(parent.data("dir"));
//     } else {
//       selected.folders.splice(indexOfDir, 1);
//     }
//   } else {
//     //is file
//     let id = parent.data("id");
//     let indexOfId = selected.files.indexOf(id);
//     //-1 jesli nie ma, inaczej zwroci indeks
//     if (indexOfId === -1) {
//       selected.files.push(parent.data("id"));
//     } else {
//       selected.files.splice(indexOfId, 1);
//     }
//   }
//   showHideSelectionMenu();
// }
/**
 * Toggle selection on single element
 *
 * Functions updates class of it and selected array
 *
 * @param {HTMLElement} item - Target item
 */
export function toggleSelectSingle(item) {
  console.log("toggleSelectSIgnle");
  selectContext.shiftSelectStartElem = item; // HTMLElement, not Jquery one
  item = $(item); // currently working with jquery, sad life
  item.toggleClass("selected");
  if (item.hasClass("folder")) {
    let dir = item.data("dir");
    let indexOfDir = selected.folders.indexOf(dir);
    if (indexOfDir === -1) {
      selected.folders.push(item.data("dir"));
    } else {
      selected.folders.splice(indexOfDir, 1);
    }
  } else {
    // item is file
    let id = item.data("id");
    let indexOfId = selected.files.indexOf(id);
    if (indexOfId === -1) {
      selected.files.push(item.data("id"));
    } else {
      selected.files.splice(indexOfId, 1);
    }
  }
  showHideSelectionMenu();
}

/**
 * Toggle selection on single element
 *
 * Functions updates class of it and selected array
 *
 * @param {HTMLElement} item - Target item
 */
export function selectSingle(item) {
  console.log("selectSingle");

  item = $(item); // currently working with jquery, sad life
  item.addClass("selected");
  if (item.hasClass("folder")) {
    let dir = item.data("dir");
    let indexOfDir = selected.folders.indexOf(dir);
    if (indexOfDir === -1) {
      selected.folders.push(item.data("dir"));
    } else {
      // selected.folders.splice(indexOfDir, 1);
    }
  } else {
    // item is file
    let id = item.data("id");
    let indexOfId = selected.files.indexOf(id);
    if (indexOfId === -1) {
      selected.files.push(item.data("id"));
    } else {
      // selected.files.splice(indexOfId, 1);
    }
  }
  showHideSelectionMenu();
}

/**
 * Returns rendered item range from
 * startItem to endItem with all between.
 * If item in the range is selected then it will be toggled
 */
function getItemRange(startItem, endItem) {
  console.log("getItemRange");

  console.log(selected);
  let itemHTMLElements = [...document.getElementById("itemList").children];
  let indexOfStart = itemHTMLElements.indexOf(startItem);
  let indexOfEnd = itemHTMLElements.indexOf(endItem);
  console.log(indexOfStart, indexOfEnd);
  if (indexOfEnd < indexOfStart) {
    return itemHTMLElements.slice(indexOfEnd, indexOfStart + 1);
  } else {
    return itemHTMLElements.slice(indexOfStart, indexOfEnd + 1);
  }
}
/**
 * Toggle selection on single element
 *
 * Functions updates class of it and selected array
 *
 * @param {HTMLElement} item - Target item
 */
export function shiftSelect(target) {
  console.log("ShiftSelect");

  console.log(selectContext);
  //check if startElement is visible on screen
  let itemHTMLElements = [...document.getElementById("itemList").children];
  let indexOfStartElem = itemHTMLElements.indexOf(target);
  console.log("indexOfStartElem :", indexOfStartElem);
  if (
    selectContext.shiftSelectStartElem === null ||
    itemHTMLElements.indexOf(selectContext.shiftSelectStartElem) === -1 ||
    indexOfStartElem === -1
  ) {
    selectSingle(target);
    selectContext.shiftSelectStartElem = target;
  } else {
    cancelSelectionFromAllVisible();
    let itemRangeArray = getItemRange(
      selectContext.shiftSelectStartElem,
      target
    );
    for (const item of itemRangeArray) {
      selectSingle(item);
    }
  }
}

function cancelSelectionFromAllVisible() {
  let allItems = $(".itemContainer");
  allItems.each(index => {
    let element = $(allItems[index]);
    if (element.hasClass("folder")) {
      //is folder
      let dir = element.data("dir");
      let indexOfDir = selected.folders.indexOf(dir);
      element.removeClass("selected");
      if (indexOfDir !== -1) {
        selected.folders.splice(indexOfDir, 1);
      }
    } else {
      //is file
      let id = element.data("id");
      let indexOfId = selected.files.indexOf(id);
      element.removeClass("selected");
      if (indexOfId !== -1) {
        selected.files.splice(indexOfId, 1);
      }
    }
  });
  showHideSelectionMenu();
}

export function cancelSelection() {
  selected = {
    files: [],
    folders: []
  };
  checkSelectedUpdate();
  showHideSelectionMenu();
}

function showHideSelectionMenu() {
  if (selected.files.length >= 1 || selected.folders.length >= 1) {
    //show if any selection
    $(".visibleWhenSelection").fadeIn(55);
  } else {
    $(".visibleWhenSelection").fadeOut(55);
  }
}

//f.e After directory change we need to check all selected visible files again
export function checkSelectedUpdate() {
  let allItems = $(".itemContainer");
  allItems.each(index => {
    let element = $(allItems[index]);
    if (element.hasClass("folder")) {
      //is folder
      let dir = element.data("dir");
      let indexOfDir = selected.folders.indexOf(dir);
      //-1 jesli nie ma, inaczej zwroci indeks
      if (indexOfDir === -1) {
        element.removeClass("selected");
      } else {
        //add selected class
        element.addClass("selected");
      }
    } else {
      //is file
      let id = element.data("id");
      let indexOfId = selected.files.indexOf(id);
      if (indexOfId === -1) {
        element.removeClass("selected");
      } else {
        //add selected class
        element.addClass("selected");
      }
    }
  });

  showHideSelectionMenu();
}

export function sellectAllVisible() {
  //check if all are selected and we need to deselect all visible
  //if will be true if there are only selected files/folders
  if ($(".itemContainer:not(.selected)").length === 0) {
    //we deselect all files
    let allItems = $(".itemContainer");
    allItems.each(index => {
      let element = $(allItems[index]);
      if (element.hasClass("folder")) {
        //is folder
        let dir = element.data("dir");
        let indexOfDir = selected.folders.indexOf(dir);
        element.removeClass("selected");
        selected.folders.splice(indexOfDir, 1);
      } else {
        //is file
        let id = element.data("id");
        let indexOfId = selected.files.indexOf(id);
        element.removeClass("selected");
        selected.files.splice(indexOfId, 1);
      }
    });
  } else {
    let allItems = $(".itemContainer");
    allItems.each(index => {
      let element = $(allItems[index]);
      if (element.hasClass("folder")) {
        //is folder
        let dir = element.data("dir");
        let indexOfDir = selected.folders.indexOf(dir);
        //-1 jesli nie ma, inaczej zwroci indeks
        if (indexOfDir === -1) {
          selected.folders.push(element.data("dir"));
          element.addClass("selected");
        }
      } else {
        //is file
        let id = element.data("id");
        let indexOfId = selected.files.indexOf(id);
        if (indexOfId === -1) {
          selected.files.push(element.data("id"));
          element.addClass("selected");
        }
      }
    });
  }
  showHideSelectionMenu();
}

//- New redesign functions
/**
 * This should be fired whenever we click any item,
 * and determine whether to deselect other selected or not
 *
 * Remember the cases:
 *
 * Mobile:
 * -tap,
 * -long_tap
 *
 * Desktop:
 * -click,
 * -shift_click
 */
let itemDetails_Elements = {
  parent: document.querySelector("#itemDetails"),
  img: document.querySelector("#itemDetails .itemDetails_preview"),
  name: document.querySelector("#itemDetails .itemDetalis_filename"),
  download: document.querySelector("#itemDetails .itemDetails_download"),
  delete: document.querySelector("#itemDetails .itemDetails_delete")
};

/**
 * Displays item's details in .itemDetails menu
 *
 * On mobile also shows the modal
 *
 * @param {HTMLElement} node - element that was clicked
 */
export function showDetails(node) {
  //deduce if node is file or folder, then get it's argument
  let fileOrFolder;
  let parentData = itemDetails_Elements.parent.dataset;
  if (node.classList.contains("file")) {
    fileOrFolder = "file";
    parentData.type = "file";
    parentData.dir = "";
    parentData.id = node.dataset.id;
  } else if (node.classList.contains("folder")) {
    fileOrFolder = "folder";
    parentData.type = "folder";
    parentData.dir = node.dataset.dir;
    parentData.id = "";
  } else {
    console.error(
      "wrong argument fileOrFolder, must be 'folder' or 'file'",
      fileOrFolder
    );
  }
  //Change img src attribute, in the #itemDetails:
  //this item should be seeable in list so lets just copy src of it's img
  let idOrDir = fileOrFolder === "file" ? "id" : "dir";
  let idOrDirVar = parentData[idOrDir];
  itemDetails_Elements.img.src = document
    .querySelector(
      `.itemContainer[data-${idOrDir}='${idOrDirVar}'] .itemIcon img`
    )
    .src.replace(/filePreview/, "image");

  //Change name attribute
  let name;
  if (fileOrFolder === "file") {
    //we have id, we need to find it's filename
    name = context.itemList.files.find(element => {
      // console.log("element :", element);
      // console.log(`ids ${element.id} === ${node.dataset.id}`);
      // console.log(`typeof ${typeof element.id} === ${typeof node.dataset.id}`);
      //dataset returns string so we can't ===
      return element.id == node.dataset.id;
    }).originalName;
  } else if (fileOrFolder === "folder") {
    name = node.dataset.dir;
  }
  itemDetails_Elements.name.textContent = name;

  //If screen is small we need to show modal, cause we don't show #itemDetails
  smallScreenOnly()
    .then(() => {
      /**
       * Modal that pops out when screen is too small for the side view
       */
      let itemDetailsModal = M.Modal.getInstance($("#modalItemDetails"));
      itemDetailsModal.open();
      addOnClick_ModalItemDetails();
    })
    .catch(() => {
      //Screen too big, do nothing
    });
}

export function selectItemMain() {}
