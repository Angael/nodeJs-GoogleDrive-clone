const displayTypes = {
  view_quilt: "view_quilt",
  list: "list",
  view_column: "view_column",
  view_module: "view_module",
  view_comfy: "view_comfy",
  photo: "photo",
  vertical_split: "vertical_split",
  dashboard: "dashboard"
};

//change display type
$(".displayTypeDropdown ul button").on("click", ev => {
  let button = ev.currentTarget;
  let type = button.children[0].innerHTML;
  $(".displayTypeDropdown").data("display-type", type);
  $(".displayTypeDropdown .changeDisplayType i").text(type);
  document.getElementById("itemList").dataset.displayType = type;
});

//Materialize:
function materialInit() {
  $(".materialboxed").materialbox();
  $(".sidenav").sidenav();
  $(".fixed-action-btn").floatingActionButton();
  $(".dropdown-trigger").dropdown({ constrainWidth: false });
  $("#modalSelection.modal").modal({
    onOpenStart: arg => {
      //let copyItemDetailsHtml = document.getElementById("itemDetails").innerHTML;
      console.log("fill with item names, or tree like structure");
      //$(".materialboxed").materialbox();
    }
  });
  $("#modalItemDetails.modal").modal({
    onOpenStart: arg => {
      let copyItemDetailsHtml = document.getElementById("itemDetails")
        .innerHTML;
      $(arg)
        .children(".modal-content")
        .html(copyItemDetailsHtml);
      $(".materialboxed").materialbox();
    }
  });
}
materialInit();
// //modal for itemDetails on mobile
// $(document).ready(function() {

//   console.log(a);
// });
