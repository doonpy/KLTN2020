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
        console.log(tableData);
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
            console.log(data);
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
    console.log($("#table-data tr"));
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

      console.log(completeDefs);

      if (!helper.isEnoughDefRequire(completeDefs)) {
        $("#table-data-alert")
          .text("Title, price, acreage, address are require information!")
          .removeClass("d-none");
        return;
      }

      $.ajax({
        type: "POST",
        url: "/api/definition",
        data: {
          catalogName: $("#catalogName").text(),
          hostname: $("#hostname").text(),
          filename: $("#filename").text(),
          data: JSON.stringify(completeDefs)
        },
        success: function(res) {
          alert(res.message);
          window.location.href = "/definition";
        },
        failed: function(err) {
          console.log(err);
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
  });
};
