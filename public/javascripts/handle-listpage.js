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
  listClass = [];
  let pagination = "";

  let xPathArr = [];
  let paginationXpath = [];
  $("#iframe-plist").on("load", function() {
    let html = $("#iframe-plist")
      .contents()
      .get(0);
    mouseoverHandle(html);
    //
    let count = 0;
    $(html).click(e => {
      e.preventDefault();
      let xpath = getXPath($(e.target));
      if ($(e.target).hasClass("bg-red")) {
        $(e.target).removeClass("bg-red");
        xPathArr = xPathArr.filter(el => el !== xpath);
        paginationXpath = paginationXpath.filter(el => el !== xpath);
        count = count - 1;
      } else {
        count = count + 1;
        $(e.target).addClass("bg-red");
        if (count == 1) {
          xPathArr.push(xpath);
        }
        if (count === 2) {
          paginationXpath.push(xpath);
        }
        console.log(paginationXpath);
        console.log(xPathArr)
      }
    });
  });
  $("#form-input-pagination").bind("change", function() {
    pagination = $(this).val();
    console.log(pagination);
  });
  $("#button-plist").click(() => {
    xPathArray = JSON.stringify(xPathArr);
    paginationXpath = JSON.stringify(paginationXpath);
    console.log(xPathArray);

    
    $.post(
      "/detail",
      { xPathArray: xPathArray, paginationXpath: paginationXpath },
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

function getXPath(target) {
  if (target === undefined) return "";

  let xPath = $(target)
    .parents()
    .map(function() {
      let parent = $(this).parent();
      let parentTagName = $(this)
        .prop("tagName")
        .toLowerCase();
      let index = parent.children(parentTagName).index($(this)) + 1;

      return `${parentTagName}${parent.children(parentTagName).length > 1 ? `[${index}]` : ``}`;
    })
    .get()
    .reverse()
    .join("/");

  // gắn chính nó vào cuối xPath
  let thisTagName = $(target)
    .prop("tagName")
    .toLowerCase();
  let targetIndex = $(target)
    .parent()
    .children(thisTagName)
    .index($(target));

  xPath =
    "/" + xPath + `/${thisTagName}${targetIndex > 0 ? `[${targetIndex}]` : ``}`;
  return xPath;
}
