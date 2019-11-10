exports.init = () => {
    "use strict";
    const $ = require("jquery");
    const htmlparser2 = require("htmlparser2");
    const ignoreTags = ["br", "hr"];
    let defRequire = ["-----", "Title", "Price", "Acreage", "Address", "Other"];

    let lastClickTarget = null;

    function parserToDom(target) {
        let rawHtml = $(target).prop("outerHTML");
        const root = new htmlparser2.parseDOM(rawHtml);

        return root;
    }

    function markupArea(target) {
        if (
            $(target).hasClass(
                "crawler-border-solid-hover crawler-border-color-hover"
            )
        )
            $(target).removeClass(
                "crawler-border-solid-hover crawler-border-color-hover"
            );

        const classesToAdd =
            "crawler-border-solid-selected crawler-border-color-selected";

        $(lastClickTarget).removeClass(classesToAdd);

        $(target).addClass(classesToAdd);

        lastClickTarget = target;
    }

    function getAllDataNodes(target) {
        let textNodes = [];
        let nodes = parserToDom(target);

        function nodeRecursion(nodes) {
            if (ignoreTags.find(i => i === nodes.tagName)) return;

            if (nodes.children === undefined) return;

            if (nodes.children.length === 0) return;

            nodes.children.forEach(node => {
                if (node.type === "text") {
                    let nodeData = node.data.trim().replace(/&nbsp;|\r|\n/g, "");

                    if (nodeData !== "") {
                        let parent = $(target).parent();
                        let kid = parent
                            .find(`${node.parent.tagName}:contains("${nodeData}")`)
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

        return textNodes;
    }

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

    function extractData(target) {
        let textNodes = getAllDataNodes(target);

        return formatTextNodes(textNodes);
    }

    function getXPath(target) {
        if (target === undefined) return "";

        let xPath = $(target)
            .parents()
            .map(function () {
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
            "/" +
            xPath +
            `/${thisTagName}${targetIndex > 0 ? `[${targetIndex}]` : ``}`;
        return xPath;
    }

    function removeAccents(str) {
        var AccentsMap = [
            "aàảãáạăằẳẵắặâầẩẫấậ",
            "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
            "dđ",
            "DĐ",
            "eèẻẽéẹêềểễếệ",
            "EÈẺẼÉẸÊỀỂỄẾỆ",
            "iìỉĩíị",
            "IÌỈĨÍỊ",
            "oòỏõóọôồổỗốộơờởỡớợ",
            "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
            "uùủũúụưừửữứự",
            "UÙỦŨÚỤƯỪỬỮỨỰ",
            "yỳỷỹýỵ",
            "YỲỶỸÝỴ"
        ];

        str = str
            .replace(/\W\D\_|\s|\:|\$|\@/gm, "-") // special char -> space
            .replace(/^\-+|\-+$/gm, "") // space -> '-'
            .replace(/-{2,}/g, ""); // remove duplicate '-'

        for (var i = 0; i < AccentsMap.length; i++) {
            var re = new RegExp("[" + AccentsMap[i].substr(1) + "]", "g");
            var char = AccentsMap[i][0];
            str = str.toLowerCase().replace(re, char);
        }
        return str;
    }

    function isEnoughDefRequire(completeDefs) {
        let checkArray = [];
        // check require info
        completeDefs.forEach(e => {
            if (defRequire.find(dr => dr.toLowerCase() === e.def)) {
                checkArray.push(e.def);
            }
        });

        if ([...new Set(checkArray)].length === defRequire.length - 2) return true;
        return false;
    }

    function exportData(dataList) {
        let tr = ``;
        let option = ``;
        defRequire.forEach(e => {
            option += `<option value="${e.toLowerCase()}">${e}</option>`;
        });

        dataList.forEach((data, index) => {
            // console.log(data);
            let nodeText = data.text.join("</p><p>");
            // let nodeAttribs = data.node.attribs
            //   ? JSON.stringify(data.node.attribs)
            //   : "N/A";
            // let parentTagName =
            //   data.node.parent != null ? data.node.parent.tagName : "N/A";
            // let parentAttribs =
            //   data.node.parent && data.node.parent.attribs
            //     ? JSON.stringify(data.node.parent.attribs)
            //     : "N/A";

            tr += `<tr>
        <th scope="row">${index + 1}</th>
        <td>
          ${
                data.node.tagName === "img"
                    ? `<img src="${nodeText}" width="30%">`
                    : `<p>${nodeText}</p>`
            }
        </td>
        <td>
          <input type="hidden" name="data" value="${nodeText}">
          <input type="hidden" name="xpath" value="${data.xPath}">
          <select name="def-suggestion" class="form-control">
            ${option}
          </select>
        </td> 
        <td>
          <button class="btn btn-danger delete-data-row">Delete</button>
        </td>
      </tr>`;
        });

        let table = `
    <div id="table-data-alert" class="alert alert-danger d-none" role="alert"></div>
    <table class="table table-hover" id="table-data">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Data</th>
          <th scope="col">Definition</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        ${tr}
      </tbody>
    </table>
    <button id="submit-table-data" class="btn btn-primary">Submit</button>`;

        $("#define-data")
            .empty()
            .append(table);
        $("#right").removeClass("d-none");

        //event delete row
        $(".delete-data-row").click(e => {
            if (e.which === 1) {
                $(e.target)
                    .closest("tr")
                    .remove();
            }
        });

        //event choose other option
        $(`#table-data select[name=def-suggestion]`).change(e => {
            let val = $(e.target)
                .find(`option:selected`)
                .val();
            if (val === "other")
                $(e.target)
                    .closest("td")
                    .append(
                        `<input type="text" name="def-other" class="form-control" placeholder="Input other definition here">`
                    );
            else {
                $(e.target)
                    .closest("td")
                    .find("input[name=def-other]")
                    .remove();
            }
        });

        // event submit table data
        $("#submit-table-data").click(e => {
            $("#table-data-alert").addClass("d-none");

            if (e.which === 1) {
                let dataInputs = $("#table-data input[name=data]").toArray();
                let xpathInputs = $("#table-data input[name=xpath]").toArray();
                let defInputs = [];
                let completeDefs = [];

                $("#table-data option:selected").each(function () {
                    let val = $(this).val();
                    let def = val;

                    if (val === defRequire[0]) {
                        def = "undef";
                    }

                    if (val === "other") {
                        def = $(this)
                            .closest("td")
                            .find("input[name=def-other")
                            .val();
                    }
                    defInputs.push({type: val, def: def});
                });
                // console.log("data inputs", dataInputs);
                // console.log("xpath inputs", xpathInputs);
                // console.log("def inputs", defInputs);

                for (let i = 0; i < defInputs.length; i++) {
                    completeDefs.push({
                        def:
                            defInputs[i].type === "other"
                                ? removeAccents(defInputs[i].def)
                                : defInputs[i].def,
                        xpath: $(xpathInputs[i]).val(),
                        data: $(dataInputs[i]).val()
                    });
                }

                if (!isEnoughDefRequire(completeDefs)) {
                    $("#table-data-alert")
                        .text("Title, price, acreage, address are require information!")
                        .removeClass("d-none");
                    return;
                }

                $.ajax({
                    type: "POST",
                    url: "/api/v1/definition",
                    data: {
                        host: $("#hostname").text(),
                        dataString: JSON.stringify(completeDefs)
                    },
                    success: function (response) {
                        window.location.href = `/extract/${$("#hostname").text()}`;
                    }
                });
            }
        });
    }

    const clickHandle = body => {
        $(body).click(e => {
            if (e.which === 1) {
                markupArea(e.target);

                let textData = extractData(e.target);

                exportData(textData);
            }
        });
    };

    const mouseoverHandle = body => {
        const classesToAdd =
            "crawler-border-solid-hover crawler-border-color-hover";
        $(body)
            .mouseover(function (e) {
                $(e.target).addClass(classesToAdd);
            })
            .mouseout(function (e) {
                $(e.target).removeClass(classesToAdd);
            });
    };

    //get body of iframe contents and init event
    $("#live-iframe").on("load", function () {
        let body = $(this)
            .contents()
            .find("body");

        // cancel default click event
        $(body).click(e => {
            e.preventDefault();
        });

        mouseoverHandle(body);
        clickHandle(body);
    });
};
