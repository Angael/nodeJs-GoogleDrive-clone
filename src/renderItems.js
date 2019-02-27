import { checkSelectedUpdate } from "./select";
import { context } from "./app";
import { verifyDir } from "./verifyData";
import { addOnClickItems } from "./onClick";

export function updateFileListFromVar(list) {
  //Maybe redundant argument
  if (list === undefined) {
    list = context.itemList;
  }
  //slice off first character, which is "/" to compare with fullList data
  console.log("----------fromVar------------");
  let dir = verifyDir(context.workingDir); //just in case
  console.log("list", list);
  let foldersToShow = list.folders.filter(folder => {
    let folderIsInsideDir = dir === folder.substr(0, dir.length);
    //
    //  asd
    //  asdqwe
    //  asd/qwe
    //  asd/qwe/rty

    if (folderIsInsideDir) {
      let folderWithoutCurrentDir = folder.substr(dir.length);
      //console.log("folderWithoutCurrentDir",folderWithoutCurrentDir);
      if (dir === "") {
        //todo: need to finish this, add second fucked up repeated logic

        //  folder1/folder2
        //  folder1folder2

        let isSubDirectory = folderWithoutCurrentDir.indexOf("/");
        //-1 if not subdirectory, so we want to show it
        if (isSubDirectory === -1 && folderWithoutCurrentDir.length !== 0) {
          return true;
        }
      } else {
        if (folderWithoutCurrentDir[0] === "/") {
          //  folder1/folder2
          //  folder1folder2
          folderWithoutCurrentDir = folderWithoutCurrentDir.slice(1);

          let isSubDirectory = folderWithoutCurrentDir.indexOf("/");
          //-1 if not subdirectory, so we want to show it
          if (isSubDirectory === -1 && folderWithoutCurrentDir.length !== 0) {
            return true;
          }
        } else {
          //it's the same folder so don't display it
          return false;
        }
      }
    }
    return false;
  });
  //console.log(foldersToShow)
  let filesToShow = list.files.filter(file => {
    if (file.dir === dir) {
      return true;
    } else {
      return false;
    }
  });
  //console.log(filesToShow);
  let filesAndFoldersToShow = {
    files: filesToShow,
    folders: foldersToShow
  };
  //console.log(filesAndFoldersToShow);

  renderFileFolderList(filesAndFoldersToShow);
  checkSelectedUpdate();
  //TODO: Big class idea is stupid, parent of all items should have this class instead
}
// let itemInnerHtmlTemplateOld = `
// <div class="itemIcon">
//   #{img}
// </div>
// <div class="itemInfo">
//     <div class="itemInfo_name">#{filename}</div>
//     <div class="itemInfo_dateSize">
//         <div class="size">#{size}</div>
//         <div class="date">04:30 21/04/1998 </div>
//     </div>
// </div>`;
let itemInnerHtmlTemplate = `
<div class="itemIcon">
  #{img}
</div>
<div class="itemInfo">
    <div class="itemInfo_name">#{filename}</div>
    <i class="itemInfo_button material-icons waves-effect circle ">more_vert</i>
</div>`;

let extensionSvgFilesArray = ["txt", "xml", "pdf", "js", "zip", "css"];
let imgPreviewFilesArray = ["bmp", "jpg", "jpeg", "png", "svg", "gif"];
export function renderFileFolderList(data) {
  document.getElementById("itemList").innerHTML = "";
  //Use js, not jquery, because looping append is a really bad idea performance-wise
  //This way we have about 60% original reflow time, wierd not less TODO: did i miss some performance problems? should be like 5% original reflow time
  var c = document.createDocumentFragment();
  for (let i = 0; i < data.folders.length; i++) {
    var e = document.createElement("div");
    let element = data.folders[i];
    e.className = "itemContainer folder waves-effect";
    e.dataset.dir = element;

    //let's not write data.folders[i] every time
    let dir = context.workingDir;
    if (dir[0] === "/") {
      dir = dir.slice(1);
    }
    let shownPathName = element.substring(dir.length, element.length);
    if (shownPathName[0] === "/") {
      shownPathName = shownPathName.substring(1, shownPathName.length);
    }
    shownPathName = limitMaxCharacters(shownPathName);
    let innerHtml = itemInnerHtmlTemplate;
    innerHtml = innerHtml.replace("#{filename}", shownPathName);
    innerHtml = innerHtml.replace(
      "#{img}",
      `<img class="Item_svgIcon" src="./svg/icons/folder.svg"/>`
    );
    innerHtml = innerHtml.replace("#{size}", "90kB");
    e.innerHTML = innerHtml;
    c.appendChild(e);
  }
  for (let i = 0; i < data.files.length; i++) {
    var e = document.createElement("div");
    let element = data.files[i];
    e.className = "itemContainer file waves-effect";
    e.dataset.id = element.id;
    let extension = /[.]/.exec(element.originalName)
      ? /[^.]+$/.exec(element.originalName)
      : "none";
    //if last character is dot, then regex will return null
    if (extension === null) {
      extension = { "0": -1 };
    }
    let previewImgHtml;
    if (imgPreviewFilesArray.indexOf(extension[0]) >= 0) {
      //we need to show img preview
      previewImgHtml = `<img class="Item_previewImg" src="/download/filePreview/${
        element.id
      }"/>`;
    } else {
      //check if we have svg for this extension, else use none.svg
      let isExtensionSupported = extensionSvgFilesArray.includes(extension[0]);
      let iconPath = "none.svg";
      if (isExtensionSupported) {
        iconPath = extension[0] + ".svg";
      }
      previewImgHtml = `<img class="Item_svgIcon" src="./svg/icons/${iconPath}"/>`;
    }
    let name = limitMaxCharacters(element.originalName);
    let innerHtml = itemInnerHtmlTemplate;
    innerHtml = innerHtml.replace("#{filename}", name);
    innerHtml = innerHtml.replace("#{img}", previewImgHtml);
    innerHtml = innerHtml.replace("#{size}", "90kB");
    e.innerHTML = innerHtml;

    c.appendChild(e);
  }
  document.getElementById("itemList").appendChild(c);

  addOnClickItems();
}
/**
 * Limits text to {limit} + "..."
 *
 * @deprecated Currently using css text overflow
 * @param {String} text
 * @param {Number} limit
 */
function limitMaxCharacters(text, limit = 255) {
  if (text.length > limit) {
    //TODO: show extensions?
    return text.substr(0, limit) + "...";
  } else {
    return text;
  }
}
export function changeDisplayType() {
  //TODO: this method is somehow unreliable with starting animation
  //Sometimes it animates with transition somethimes doesn't
  if (context.displayType === "bigTile") {
    document.getElementById("itemList").dataset.displayType = "normal";
    context.displayType = "normal";
  } else {
    document.getElementById("itemList").dataset.displayType = "bigTile";
    context.displayType = "bigTile";
  }
}
