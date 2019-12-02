const htmlparser2 = require("htmlparser2");
const $ = require("jquery");
const helper = require("./_helper");
const constInit = require("./_const-init");

/**
 * Parse HTML to Dom Key
 * @param target
 */
function parserToDom(target) {
  let rawHtml = $(target).prop("outerHTML");
  const root = new htmlparser2.parseDOM(rawHtml);

  return root;
}

/**
 * Get all data of nodes in target
 * @param target
 * @returns {[text, node, xPath]}
 */
function getAllDataNodes(target) {
  let textNodes = [];
  let nodes = parserToDom(target);

  function nodeRecursion(nodes) {
    if (constInit.IGNORE_TAGS.find(i => i === nodes.tagName)) return;

    if (nodes.children === undefined) return;

    if (nodes.children.length === 0) return;

    nodes.children.forEach(node => {
      if (node.type === "text") {
        let nodeData = node.data.replace(/(\r\n|\n|\r)/gm, " ").trim();
        let textSearch = node.data.replace(/^[\r\n]+|&nbsp;|[\r\n]+$/g, "");
        if (nodeData !== "") {
          let parent = $(target).parent();
          let kid = parent
              .find(`${node.parent.tagName}:contains("${textSearch}")`)
              .get(0);
          textNodes.push({
            text: nodeData,
            node: node.parent,
            xPath: getXPath(kid)
          });
        }
      }

      if (node.tagName === "img") {
        let imgSrc = node.attribs.src || "";
        if (imgSrc !== "") {
          let targetParent = $(target).parent();
          let imgTag = targetParent.find(`img[src="${imgSrc}"]`);
          let parent = imgTag.parent();

          while ($(parent).prop("tagName") === "LI") {
            parent = $(parent).parent();
          }

          textNodes.push({
            text: imgSrc,
            node: node,
            xPath: getXPath(parent)
          });
        }
      }

      if (node.type === "tag") nodeRecursion(node);
    });
  }

  nodeRecursion(nodes[0]);

  return formatTextNodes(textNodes);
}

/**
 * Merge text node have same parent
 * @param nodes
 * @returns {[]}
 */
function formatTextNodes(nodes) {
  let tempArray = [];

  nodes.forEach(element => {
    let found = tempArray.find(e => {
      return (
          e.node.attribs === element.node.attribs &&
          e.node.tagName === element.node.tagName
      );
    });
    if (found === undefined) {
      tempArray.push({
        node: element.node,
        text: [element.text],
        xPath: element.xPath
      });
    }
    if (found) {
      found.text.push(element.text);
    }
  });

  return tempArray;
}

/**
 * Get xPath of target
 * @param target
 * @returns {string}
 */
function getXPath(target) {
  if (target === undefined) return "";
  let xPath = $(target)
      .parents()
      .map(function () {
        let parent = $(this).parent();
        let parentTagName = this.tagName.toLowerCase();
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
  let targetIndex =
      $(target)
          .parent()
          .children(thisTagName)
          .index($(target)) + 1;

  xPath =
      "/" + xPath + `/${thisTagName}${targetIndex > 0 ? `[${targetIndex}]` : ``}`;
  return xPath;
}

/**
 * Display target to screen
 * @param dataList
 */
function exportData(dataList, isTable = false) {
  let tr = ``;
  let option = ``;

  if (isTable) {
    dataList.forEach(data => {
      let header = data.header;
      let inputTag = ``;
      let selectedOption = constInit.MULTI_LANGUAGE.findIndex(l => {
        let keyword = header
            .toLowerCase()
            .trim()
            .replace(/\W\D\_|\:|\$|\@/gm, "");
        return l.includes(keyword);
      });
      if (selectedOption === -1) {
        constInit.REQUIRE_DEFINITIONS.forEach(e => {
          option += `<option value="${e.toLowerCase()}" ${
              e === "Other" ? `selected` : ``
          }>${e}</option>`;
        });
        inputTag = `<input type="text" name="def-other" class="form-control" placeholder="Input other definition here" value="${header}">`;
      } else {
        constInit.REQUIRE_DEFINITIONS.forEach((e, index) => {
          option += `<option value="${e.toLowerCase()}" ${
              index - 1 === selectedOption ? `selected` : ``
          }>${e}</option>`;
        });
      }

      data.contentList.forEach(content => {
        let nodeText = content.text.join("</p><p>");
        tr += `<tr>
        <td>
          ${
            content.node.tagName === "img"
                ? `<img src="${nodeText}" width="30%">`
                : `<p>${nodeText}</p>`
        }
        </td>
        <td>
          <input type="hidden" name="xpath" value="${content.xPath}">
          <select name="def-suggestion" class="form-control">
            ${option}
          </select>
          ${inputTag}
        </td> 
        <td>
          <button class="btn btn-danger delete-data-row">Delete</button>
        </td>
      </tr>`;
      });
      // Event add row
      $("#table-data tbody").append(tr);
      tr = ``;
      option = ``;
    });
  } else {
    constInit.REQUIRE_DEFINITIONS.forEach(e => {
      option += `<option value="${e.toLowerCase()}">${e}</option>`;
    });
    dataList.forEach(data => {
      let nodeText = data.text.join("</p><p>");

      tr += `<tr>
        <td>
          ${
          data.node.tagName === "img"
              ? `<img src="${nodeText}" width="30%">`
              : `<p>${nodeText}</p>`
      }
        </td>
        <td>
          <input type="hidden" name="xpath" value="${data.xPath}">
          <select name="def-suggestion" class="form-control">
            ${option}
          </select>
        </td> 
        <td>
          <button class="btn btn-danger delete-data-row">Delete</button>
        </td>
      </tr>`;

      // Event add row
      $("#table-data tbody").append(tr);
      tr = ``;
    });
  }

  helper.initTableEventHandle();
}

module.exports = {
  exportData: exportData,
  getAllDataNodes: getAllDataNodes
};
