let selectedTagList = [];
const $ = require("jquery");
const constInit = require("./_const-init");

const NAME_DEFINE = {
  class: {
    mouseHover: "pk-border-solid-hover pk-border-color-hover",
    mouseSelected: "pk-border-solid-selected pk-border-color-selected"
  },
  css: {
    borderHoverStyle: "pk-border-solid-hover",
    borderHoverColor: "pk-border-color-hover",
    borderSelectedStyle: "pk-border-solid-selected",
    borderSelectedColor: "pk-border-color-selected"
  }
};

/**
 * Check target is selected or not
 * @param target
 * @returns {boolean}
 */
function isSelected(target) {
  let found = selectedTagList.find(s => {
    return $(s).is(target);
  });
  if (found) {
    return true;
  }
  return false;
}

/**
 * Hover event
 * @param body
 */
function mouseoverHandle(body) {
  const classesToAdd = NAME_DEFINE.class.mouseHover;
  $(body)
    .mouseover(function(e) {
      $(e.target).addClass(classesToAdd);
    })
    .mouseout(function(e) {
      $(e.target).removeClass(classesToAdd);
    });
}

/**
 * Border markup
 * @param target
 */
function markupArea(target) {
  if ($(target).hasClass(NAME_DEFINE.class.mouseHover)) {
    $(target).removeClass(NAME_DEFINE.class.mouseHover);
  }
  $(target).addClass(NAME_DEFINE.class.mouseSelected);
  selectedTagList.push(target);
}

/**
 * Reset button click event
 */
function resetTableButtonEvent() {
  $("#reset-table-data").click(e => {
    if (e.which === 1) {
      $("#table-data tbody").empty();
      selectedTagList.forEach(s => {
        $(s).removeClass(NAME_DEFINE.class.mouseSelected);
      });
      selectedTagList = [];
    }
  });
}

/**
 * Customize css when hover and click event.
 * @param body
 */
function addCustomizeCSS(body) {
  // add mouse css
  $(body).append(
      `<style>
      .${NAME_DEFINE.css.borderSelectedStyle} { border: 1px solid #dee2e6 !important }
      .${NAME_DEFINE.css.borderSelectedColor} { border-color: #28a745!important }
      .${NAME_DEFINE.css.borderHoverStyle} { border: 0.5px solid #dee2e6 !important }
      .${NAME_DEFINE.css.borderHoverColor} { border-color: #dc3545!important }
    </style>`
  );
}

/**
 * Check  define is have enough require fields
 * @param completeDefs
 * @returns {boolean}
 */
function isEnoughDefRequire(completeDefs) {
  let checkArray = [];
  // check require info
  completeDefs.forEach(e => {
    if (constInit.REQUIRE_DEFINITIONS.find(dr => dr.toLowerCase() === e.def)) {
      checkArray.push(e.def);
    }
  });

  if (
    [...new Set(checkArray)].length ===
    constInit.REQUIRE_DEFINITIONS.length - 2
  )
    return true;
  return false;
}

/**
 * init handler for each event of table
 */
function initTableEventHandle() {
  // Event delete row
  $(".delete-data-row").click(e => {
    if (e.which === 1) {
      let trTag = $(e.target).closest("tr");
      let xPath = $(trTag)
        .find("input[name=xpath]")
        .val();
      let target = getTagByXPath(xPath);
      if (isSelected(target)) {
        $(target).removeClass(NAME_DEFINE.class.mouseSelected);
        let index = selectedTagList.findIndex(tag => {
          return $(tag).is(target);
        });
        selectedTagList.splice(index, 1);
      }
      $(trTag).remove();
    }
  });

  //event choose other option
  $(`#table-data select[name=def-suggestion]`).change(e => {
    let val = $(e.target)
      .find(`option:selected`)
      .val();
    if (val === "other") {
      let closetTdTag = $(e.target).closest("td");
      if (closetTdTag.find("input[name=def-other]").length===0) {
        closetTdTag.append(
          `<input type="text" name="def-other" class="form-control" placeholder="Input other definition here">`
        );
      }
    } else {
      $(e.target)
        .closest("td")
        .find("input[name=def-other]")
        .remove();
    }
  });
}

/**
 * Get tag from xPath
 * @param xpath
 * @returns {*|jQuery|[]}
 */
function getTagByXPath(xpath) {
  let xpathArray = xpath.split("/");
  let selector = $("#live-iframe")
    .contents()
    .find("html");
  let tagName = "";
  let index = 0;

  xpathArray.splice(0, 2); //remove null and html element

  while (xpathArray.length > 0) {
    let firstElement = xpathArray.shift();

    tagName = firstElement.match(/[a-z]+([1-6])?/g)[0];
    index = firstElement.match(/\[[0-9]+\]/g)
      ? firstElement.match(/\[[0-9]+\]/g)[0].replace(/\[+|\]+/g, "") - 1
      : 0;

    selector = $(selector)
      .children(tagName)
      .get(index);
  }

  return selector;
}

module.exports = {
  addCustomizeCSS: addCustomizeCSS,
  markupArea: markupArea,
  isSelected: isSelected,
  resetTableButtonEvent: resetTableButtonEvent,
  mouseoverHandle: mouseoverHandle,
  initTableEventHandle: initTableEventHandle,
  getTagByXPath: getTagByXPath,
  isEnoughDefRequire: isEnoughDefRequire
};
