const $ = require("jquery");
const handleData = require("./_handle-data");

/**
 *
 * @param parent
 * @param haveClass
 * @returns {{className: (*|jQuery|undefined|string), tagName: *}[] | jQuery|(string | jQuery)[] | jQuery}
 */
function getChildTag(parent, haveClass = false) {
    if (haveClass) {
        return $(parent)
            .children()
            .toArray()
            .map(child => {
                return {
                    tagName: $(child)
                        .prop("tagName")
                        .toLowerCase(),
                    className: $(child).attr("class") || ""
                };
            });
    } else {
        return $(parent)
            .children()
            .toArray()
            .map(child => {
                return $(child)
                    .prop("tagName")
                    .toLowerCase();
            });
    }
}

/**
 * Get all tag have row structure
 * @param target
 * @returns []
 */
function getAllNearRow(target) {
    let $currElement = $(target);
    let siblings = $currElement.siblings().toArray();

    if ($currElement.children().length === 0 || siblings.length === 0) {
        return getAllNearRow($currElement.parent());
    }

    let rowElement = [];
    let currChildTag = getChildTag($currElement);
    siblings.push($currElement);
    siblings.forEach(sibling => {
        if (JSON.stringify(currChildTag) === JSON.stringify(getChildTag(sibling))) {
            let header = "";
            let contentList = [];
            $(sibling)
                .children()
                .each(function () {
                    let text = $(this)
                        .text()
                        .trim()
                        .replace(/[\n\r]/g, "");
                    if (header === "") {
                        header = text;
                    } else {
                        handleData.getAllDataNodes(this).forEach(data => {
                            contentList.push(data);
                        });
                    }
                });

            rowElement.push({
                header: header,
                contentList: contentList
            });
        }
    });

    return rowElement;
}

/**
 *
 * @param target
 * @returns []
 */
function tableHandle(target) {
    let table = $(target).closest("table");
    let data = [];
    $(table)
        .find("th")
        .each(function () {
            data.push({
                header: $(this)
                    .text()
                    .trim()
                    .replace(/[\r\n]/g, ""),
                contentList: []
            });
        })
        .find("td")
        .each(function () {
            let index = $(this)
                .parent()
                .children()
                .index(this);
            data[index].contentList.push(handleData.getAllDataNodes(this));
        });
    return data;
}

/**
 * List style handle
 * @param target
 * @returns []
 */
function listHandle(target) {
    let parent = $(target)
        .closest("ul,ol")
        .get(0);
    let data = [];
    $(parent)
        .children("li")
        .each(function () {
            let header = $(this)
                .text()
                .trim()
                .replace(/[\r\n]/g, "");
            let contentList = handleData.getAllDataNodes($(this).children());
            data.push({
                header: header,
                contentList: contentList
            });
        });

    return data;
}

/**
 * Check target in tag given
 * @param {Jquery} target
 * @param {string} parentTagName
 * @returns {boolean}
 */
function isChildOfTag(target, parentTagName) {
    return $(target).closest(parentTagName).length !== 0;
}

/**
 * Main function
 * @param target
 * @returns {jQuery[]}
 */
function main(target) {
    if (isChildOfTag(target, "table")) {
        return tableHandle(target);
    }
    if (isChildOfTag(target, "ul") || isChildOfTag(target, "ol")) {
        return listHandle(target);
    }
    return getAllNearRow(target);
}

module.exports = {
    main: main
};
