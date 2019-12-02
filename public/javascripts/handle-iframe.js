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
  var myArray = [];
  $("#iframe-id").on("load", function() {
    let html = $("#iframe-id")
      .contents()
      .find("body");
    // .get(0);
    mouseoverHandle(html);
    // $(html)
    //   .find("body")
    //   .append(
    //     `<script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>`
    //   );
    // $(html)
    //   .find("script, link, img")
    //   .each(function() {
    //     console.log("this", this);
    //     let tagName = $(this)
    //       .prop("tagName")
    //       .toLowerCase();
    //     if (tagName === "script" || tagName === "img") {
    //       let src = $(this).attr("src");
    //       $(this).attr("src", "https://nhadat24h.net" + src);
    //     }

    //     if (tagName === "link") {
    //       let href = $(this).attr("href");
    //       $(this).attr("href", "https://nhadat24h.net" + href);
    //     }
    //   });

    $(html).click(e => {
      e.preventDefault();
      console.log(e.target);

      //Lấy hết thẻ của catalog
      let targetList = $(e.target)
        .contents()
        .find("a")
        .get();
      let targetHref = [];
      console.log(targetList);
      if (targetList.length !== 0) {
        $(targetList).each((index, value) => {
          let k = value.href.split("http://localhost:3000");
          targetHref.push(k[1]);
        });
      } else {
        let attr = $(e.target)
          .find("a")
          .attr("href");
        targetHref.push(attr);
      }

      console.log(targetHref);
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
        // Remove
        myArray = myArray.filter(el => el.targetName !== objCatalog.targetName);
      } else {
        if (objCatalog.targetList[0] == undefined) {
          alert("Sai! Moi Chon Lai!");
        } else {
          $(e.target).addClass("bg-red");
          // Add
          myArray.push(objCatalog);
        }
      }
    });

    $("#button-catalog").click(e => {
      e.preventDefault();
      console.log(myArray);
      let catalogArr = JSON.stringify(myArray);
      $.post("/catalog", { catalog: catalogArr }, data => {
        console.log(data);
        text.push(data);
        window.location = "/listpage";
      });
    });
  });
}

$(document).ready(function() {
  // inputURL().then(data => {

  // });
  handleCatalog();
});
