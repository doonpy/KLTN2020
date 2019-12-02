exports.init = () => {
  const $ = require("jquery");
  const handleIframeData = require("./_handle-data");
  const handleTable = require("./_handle-table");
  const helper = require("./_helper");
  const constInit = require("./_const-init");

  /**
   * Click event
   * @param body
   */
  function clickHandle(body) {
    $(body).click(e => {
      if (e.which === 1) {
        let tableData = handleTable.main(e.target);
        if (tableData.length > 1) {
          tableData.forEach(data => {
            data.contentList.forEach((content, index) => {
              let target = helper.getTagByXPath(content.xPath);
              if (!helper.isSelected(target)) {
                helper.markupArea(target);
              } else {
                data.contentList.splice(index, 1);
              }
            });
          });
          handleIframeData.exportData(tableData, true);
        } else if (!helper.isSelected(e.target)) {
          let dataNode = handleIframeData.getAllDataNodes(e.target);
          dataNode.forEach((data, index) => {
            let target = helper.getTagByXPath(data.xPath);
            if (!helper.isSelected(target)) {
              helper.markupArea(target);
            } else {
              dataNode.splice(index, 1);
            }
          });
          handleIframeData.exportData(dataNode);
        }
      }
    });
  }

  // Submit button event
  $("#submit-table-data").click(e => {
    $("#table-data-alert").addClass("d-none");
    if (e.which === 1 && $("#table-data tr").length > 1) {
      let xPathInputs = $("#table-data input[name=xpath]").toArray();
      let defInputs = [];
      let completeDefs = [];

      $("#table-data option:selected").each(function() {
        let val = $(this).val();
        let def = val;

        if (val === constInit.REQUIRE_DEFINITIONS[0]) {
          def = "undef";
        }

        if (val === "other") {
          def = $(this)
            .closest("td")
            .find(`input[name=def-other]`)
            .val();
        }
        defInputs.push({ type: val, def: def });
      });

      for (let i = 0; i < defInputs.length; i++) {
        completeDefs.push({
          def:
            defInputs[i].type === "other"
              ? defInputs[i].def.trim()
              : defInputs[i].def,
          xpath: $(xPathInputs[i]).val()
        });
      }

      if (!helper.isEnoughDefRequire(completeDefs)) {
        $("#table-data-alert")
          .text("Title, price, acreage, address are require information!")
          .removeClass("d-none");
        return;
      }

      $.ajax({
        type: "POST",
        url: "/definition/add",
        data: {
          catalogId: $("#catalogId").text(),
          targetUrl: $("#targetUrl").text(),
          fileName: $("#fileName").text(),
          hostName: $("#hostName").text(),
          data: JSON.stringify(completeDefs)
        },
        success: function(res) {
          if (res.status) {
            alert(res.message);
            window.location.href = res.redirectUrl;
          } else {
            alert(res.message);
            window.location.href = res.redirectUrl;
          }
        }
      });
    }
  });

  /**
   * Get body of iframe contents and init event
   */
  $("#live-iframe").on("load", function() {
    let body = $(this)
      .contents()
      .find("body");
    // cancel default click event
    $(body).click(e => {
      e.preventDefault();
    });
    helper.addCustomizeCSS(body);
    helper.resetTableButtonEvent();
    helper.mouseoverHandle(body);
    clickHandle(body);
    $("#loading-progress").fadeOut();

    // update check
    let definitionId = $("#definitionId").text();
    if (definitionId) {
      initUpdateValue(body, definitionId);
    }
  });

  // Initialize value for update
  function initUpdateValue(body, definitionId) {
    function getContentByXPath(xpath) {
      let xpathArray = xpath.split("/");
      let selector = $(body);
      let tagName = "";
      let index = 0;

      xpathArray.splice(0, 3); //remove null and html element
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

    function getDataByTypeXPath(xPathType, xPathArray) {
      let result = [];
      xPathArray.forEach(xPath => {
        let el = getContentByXPath(xPath);
        let contentList = [];
        if (el) {
          helper.markupArea(el);
          contentList = handleIframeData.getAllDataNodes(el);
        } else {
          const mockElement = document.createElement("p");
          contentList = [
            {
              node: mockElement,
              text: [
                "<b class='text-danger'>This element corresponding to this xPath not exist!</b>"
              ],
              xPath: xPath
            }
          ];
        }
        result.push({
          header: xPathType,
          contentList: contentList
        });
      });
      return result;
    }

    $.get(`/api/definition/${definitionId}`, res => {
      if (res.status) {
        const data = res.data;
        const titleArray = getDataByTypeXPath("title", data.title);
        handleIframeData.exportData(titleArray, true);

        const priceArray = getDataByTypeXPath("price", data.price);
        handleIframeData.exportData(priceArray, true);

        const acreageArray = getDataByTypeXPath("acreage", data.acreage);
        handleIframeData.exportData(acreageArray, true);

        const addressArray = getDataByTypeXPath("address", data.address);
        handleIframeData.exportData(addressArray, true);

        data.others.forEach(other => {
          const othersArray = getDataByTypeXPath(other.name, other.xpath);
          handleIframeData.exportData(othersArray, true);
        });
      } else {
        alert(res.error.message);
        window.location.href = "";
      }
    });
  }
};
