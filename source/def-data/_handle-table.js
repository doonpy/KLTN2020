const $ = require("jquery");
const handleData = require("./_handle-data");

function removeSpeacialCharacter(string) {
    return string
        .replace(/[\r\n]/g, "")
        .replace(/[^\w\d\s\u00C0-\u1EF9]/g, " ")
        .trim();
}

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

    let siblingCount = 0;
    siblings.forEach((sibling, index) => {
        if (
            $(sibling).tagName === $currElement.tagName &&
            $(sibling).children().length === $currElement.children().length
        ) {
            siblingCount++;
        } else {
            siblings.splice(index, 1);
        }
    });

    if (siblingCount === 0) {
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
                    let text = removeSpeacialCharacter($(this).text());
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
    let $thTags = $(table).find("th");
    let data = [];
    if ($thTags.length > 0) {
        $thTags.each(function () {
            data.push({
                header: removeSpeacialCharacter($(this).text()),
                contentList: []
            });
        });
        $(table)
            .find("td")
            .each(function () {
                let index = $(this)
                    .parent()
                    .children()
                    .index(this);
                data[index].contentList.push(handleData.getAllDataNodes(this));
            });
    } else {
        let header = "";
        $(table)
            .find("td")
            .each(function (index) {
                if (index % 2 !== 0) {
                    data.push({
                        header: header,
                        contentList: handleData.getAllDataNodes(this)
                    });
                    header = "";
                } else {
                    header = removeSpeacialCharacter($(this).text());
                }
            });
    }
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
            let liChildren = $(this)
                .children()
                .toArray();
            if (liChildren.length === 0) {
                let header = removeSpeacialCharacter($(this).text());
                let contentList = handleData.getAllDataNodes($(this));
                data.push({
                    header: header,
                    contentList: contentList
                });
            } else {
                let firstChild = liChildren.shift();
                let header = removeSpeacialCharacter($(firstChild).text());
                liChildren.forEach(child => {
                    let contentList = handleData.getAllDataNodes($(child));
                    data.push({
                        header: header,
                        contentList: contentList
                    });
                });
            }
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
