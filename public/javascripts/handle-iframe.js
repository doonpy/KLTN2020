var linkCatalog = [];
let urlInfo = "";
var text = [];
//
function inputURL() {
  return new Promise((resolve, reject) => {
    return $("#form-input-url").bind("change", function() {
      urlInfo = $(this).val();
      if (!urlInfo) return reject("err  urlInfo");
      return resolve(urlInfo);
    });
  });
}
function passingPage() {
  $("#button-raw").click(e => {
    window.location = "/raw-data";
  });
}
//
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
//
function handleCatalog() {
  $.notify("Welcome to The Catalog Page", "info");
  var myArray = [];
  $("#iframe-id").on("load", function() {
    let html = $("#iframe-id")
      .contents()
      .find("body");
    mouseoverHandle(html);

    $(html).click(e => {
      e.preventDefault();
      let targetHref = [];
      //Lấy hết thẻ của catalog
      let targetList = $(e.target)
        .contents()
        .find("a")
        .get();
      if (targetList.length !== 0) {
        $(targetList).each((index, value) => {
          let k = value.href.split("http://localhost:3000");
          let obj = {
            name: $(value).text(),
            href: k[1]
          };
          targetHref.push(obj);
        });
      } else {
        let attr = $(e.target)
          .find("a")
          .attr("href");
        let name = $(e.target)
          .find("a")
          .text();
        let obj = {
          name: name,
          href: attr
        };
        targetHref.push(obj);
      }
      let targetName = $(e.target)
        .find("a")
        .first()
        .text();
      //

      let objCatalog = {
        targetName: targetName,
        targetList: targetHref
      };
      //
      if ($(e.target).hasClass("bg-red")) {
        $(e.target).removeClass("bg-red");
        myArray = [];
        $("#list-catalog-id")
          .find("p")
          .remove();
      } else {
        if (objCatalog.targetName == "" || objCatalog.targetList[0].href == undefined) {
          $.notify("Please choose the right catalog!");
        } else {
          if (myArray.length === 0) {
            $(e.target).addClass("bg-red");
            myArray.push(objCatalog);
            myArray[0].targetList.forEach(value => {
              $("#list-catalog-id").append(`<p>${value.name}</p>`);
            });
          } else {
            $.notify("Please uncheck before selecting catalog new!");
          }
        }
      }
    });

    $("#button-catalog").click(e => {
      e.preventDefault();
      let catalogArr = JSON.stringify(myArray[0].targetList);
      $.post("/catalogarr", { catalog: catalogArr }, data => {
        console.log(data);
        text.push(data);
        window.location = "/listpage";
      });
    });
  });
}

$(document).ready(function() {
  passingPage();
  handleCatalog();
});
