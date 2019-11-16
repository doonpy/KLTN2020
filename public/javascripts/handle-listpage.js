var linkCatalog = [];
const mouseoverHandle = body => {
  const classesToAdd = "crawler-border-solid-hover crawler-border-color-hover";
  $(body)
    .mouseover(function(e) {
      $(e.target).addClass(classesToAdd);
    })
    .mouseout(function(e) {
      $(e.target).removeClass(classesToAdd);
    });
};

function handleListPage() {
  var myList = [];
  listClass = [];
  let pagination = "";

  $("#iframe-plist").on("load", function() {
    let html = $("#iframe-plist")
      .contents()
      .get(0);
    mouseoverHandle(html);
    //
    $(html).click(e => {
      // console.log($(e.target).attr("class"));
      $(e.target).css("border", "3px solid green");
      listClass.push("." + $(event.target).attr("class"));
      alert($(event.target).attr("class"));
      console.log(listClass);
      $(event.target)
        .attr("class")
        .split(" ")
        .map(function(className) {
          if (className !== undefined) myList.push(`.${className}`);
        });
    });
  });
  $("#form-input-pagination").bind("change", function() {
    pagination = $(this).val();
    console.log(pagination);
  });
  $("#button-plist").click(() => {
    $.post(
      "/total",
      { totalDiv: myList, pagination: pagination, listClass: listClass },
      data => {
        // window.location = "/listpage";
        console.log(data);
      }
    );
  });
}
$(document).ready(function() {
  handleListPage();
});
