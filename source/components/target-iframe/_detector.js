const $ = require("jquery");

/**
 * Remove special character
 * @param string
 * @returns {*}
 */
function removeSpeacialCharacter(string) {
  return (
      string
          .replace(/[\r\n]/g, " ")
          // .replace(/[^\w\d\s\u00C0-\u1EF9\-\,]/g, " ")
          .trim()
  );
}

/**
 * Remove last splash
 * @param string
 * @returns {*|void}
 */
function removeLastSplash(string) {
  return string.replace(/\/$/g, "");
}

/**
 * List style handle
 * @param target
 * @returns []
 */
function getAllCatalogElement(target) {
  let targetDomain = $("#target").text();
  let $parent = $(target);
  if ($(target).tagName !== "li") {
    $parent = $(target).closest("li");
  }
  let data = [];

  $parent.find("a").each(function () {
    let catalogHref = $(this).attr("href");
    data.push({
      header: removeSpeacialCharacter($(this).text()),
      cssSelector: $(this)
          .closest("li")
          .getCssSelector(),
      href: `${removeLastSplash(targetDomain)}${catalogHref}`
    });
  });

  return data;
}

/**
 * validate page number elemment
 * @param target
 * @returns {boolean}
 */
function isPageNumberElement(target) {
  let siblings = $(target).siblings(
      $(target)
          .prop("tagName")
          .toLowerCase()
  );
  if (siblings.length === 0) return false;
  return true;
}

module.exports = {
  getAllCatalogElement: getAllCatalogElement,
  isPageNumberElement: isPageNumberElement
};
