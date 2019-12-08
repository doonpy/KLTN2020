const $ = require("jquery");
const detector = require("./_detector");
import "datatables.net-bs4/css/dataTables.bootstrap4.css";
import "datatables.net-rowgroup-bs4";

// Extend $ to get CSS selector string
$.fn.extend({
  getCssSelector: function () {
    let path,
        node = this;
    while (node.length) {
      let realNode = node[0],
          name = realNode.localName;
      if (name === "html") {
        break;
      }
      if (!name) break;
      name = name.toLowerCase();

      let parent = node.parent();

      let sameTagSiblings = parent.children(name);
      if (sameTagSiblings.length > 1) {
        let allSiblings = parent.children();
        let index = allSiblings.index(realNode) + 1;
        if (index > 1) {
          name += ":nth-child(" + index + ")";
        }
      }

      path = name + (path ? ">" + path : "");
      node = parent;
    }

    return path.trim();
  }
});

const NAME_DEFINE = {
  id: {
    leftCol: "left-content",
    rightCol: "right-content",
    tableData: "table-data",
    alertTableData: "table-data-alert",
    componentName: "ti-iframe-comp",
    loadingImg: "ti-loading-img",
    iframe: "ti-iframe",
    submitBtn: "ti-submit-table-data",
    resetBtn: "ti-reset-table-data",
    deleteBtn: "ti-delete-table-data",
    detectBtn: "ti-detect-table-data",
    backHomeBtn: "ti-back-home"
  },
  class: {
    leftCol: "col-7 mr-2",
    rightCol: "col card",
    tableData: "table table-hover table-border",
    alertTableData: "alert alert-danger d-none",
    loadingImg: "bg-dark",
    mouseHover: "pk-border-solid-hover pk-border-color-hover",
    mouseSelected: "pk-border-solid-selected pk-border-color-selected",
    submitBtn: "btn btn-primary mr-2",
    resetBtn: "btn btn-danger mr-2",
    deleteBtn: "btn btn-danger mr-2",
    detectBtn: "btn btn-success mr-2",
    backHomeBtn: "btn btn-primary mb-2",
    detailUrlBadge: "ti-detail-url",
    pageNumberBadge: "ti-page-number"
  },
  src: {
    loadingImg: "/images/svg/puff.svg"
  },
  css: {
    borderHoverStyle: "pk-border-solid-hover",
    borderHoverColor: "pk-border-color-hover",
    borderSelectedStyle: "pk-border-solid-selected",
    borderSelectedColor: "pk-border-color-selected",
    rowSelected: "bg-secondary text-light",
    rowDetected: "bg-primary text-white",
    badgeNotDetected: "text-light badge badge-danger",
    badgeDetected: "text-light badge badge-success"
  }
};

export default class TargetIframe {
  constructor(props) {
    this.src = props.src;
    this.originalSrc = props.src;
    this.posElement = props.posElement.trim();
    this.type = props.type.trim();
    this.isDetectMode = false;
  }

  init() {
    this.$posElement = $(this.posElement);
    this.$posElement.append(this._getTemplates());
    this.$leftCol = $(`#${NAME_DEFINE.id.leftCol}`);
    this.$rightCol = $(`#${NAME_DEFINE.id.rightCol}`);
    this.$tableData = $(`#${NAME_DEFINE.id.tableData}`).DataTable({
      columnDefs: [
        {
          targets: [0],
          visible: false,
          searchable: false
        }
      ]
    });
    this.$component = $(`#${NAME_DEFINE.id.componentName}`);
    this.$loadingImg = $(`#${NAME_DEFINE.id.loadingImg}`);
    this.$iframe = $(`#${NAME_DEFINE.id.iframe}`);
    this.$deleteBtn = $(`#${NAME_DEFINE.id.deleteBtn}`);
    this.$resetBtn = $(`#${NAME_DEFINE.id.resetBtn}`);
    this.$submitBtn = $(`#${NAME_DEFINE.id.submitBtn}`);
    this.$detectBtn = $(`#${NAME_DEFINE.id.detectBtn}`);
    this.$backToHomeBtn = $(`#${NAME_DEFINE.id.backHomeBtn}`);

    this._initIframeEvent();
    this._initTableEvent();
  }

  _getTemplates() {
    let template = ``;

    template = `<div id="${NAME_DEFINE.id.componentName}" class="row">
                    <div id="${NAME_DEFINE.id.leftCol}" class="${
        NAME_DEFINE.class.leftCol
    }">
                        ${this._getIframeTemplate()}
                    </div>
                    <div id="${NAME_DEFINE.id.rightCol}" class="${
        NAME_DEFINE.class.rightCol
    }">
                        ${this._getTableTemplate()}
                    </div>
                </div>`;

    return template;
  }

  _getIframeTemplate() {
    return `<img id="${NAME_DEFINE.id.loadingImg}" class="${NAME_DEFINE.class.loadingImg}" src="${NAME_DEFINE.src.loadingImg}" style="position:absolute;"/>
            <button id="${NAME_DEFINE.id.backHomeBtn}" class="${NAME_DEFINE.class.backHomeBtn}">
                <i class="fa fa-home"></i>
                <span>Back to Home</span>
            </button>
            <iframe id="${NAME_DEFINE.id.iframe}" src="${this.src}"></iframe>`;
  }

  _getTableTemplate() {
    let headers = ``;
    if (this.type === "catalog") {
      headers = `
                <th scope="col">Input</th>
                <th scope="col">Catalog</th>
                <th scope="col">URL</th>
                <th scope="col">Detect info</th>`;
    }
    return `<div class="card-body" style="overflow:auto;">
                <div id="${NAME_DEFINE.id.alertTableData}" class="${NAME_DEFINE.class.alertTableData}" role="alert"></div>
                <table id="${NAME_DEFINE.id.tableData}" class="${NAME_DEFINE.class.tableData}" style="width:100%">
                    <thead>
                        <tr>
                            ${headers}
                        </tr>
                    </thead>
                    <tbody>
                    
                    </tbody>
                </table>
                <hr>
                <div class="mt-2">                 
                    <button id="${NAME_DEFINE.id.resetBtn}" class="${NAME_DEFINE.class.resetBtn}">Reset</button>
                    <button id="${NAME_DEFINE.id.deleteBtn}" class="${NAME_DEFINE.class.deleteBtn}">Delete</button>
                    <button id="${NAME_DEFINE.id.detectBtn}" class="${NAME_DEFINE.class.detectBtn}">Mark as detected</button>
                    <button id="${NAME_DEFINE.id.submitBtn}" class="${NAME_DEFINE.class.submitBtn}">Submit</button>
                </div>             
            </div>`;
  }

  _initIframeEvent() {
    this._resizeIframe();
    // Event after ifarme loaded
    this.$iframe.on("load", () => {
      this.$loadingImg.fadeOut("fast");
      this.$iframeContent = $(this.getContentOfIframe());
      this._addCustomizeCss();
      this._bindIframeEvent();
      if (this.isDetectMode) {
        this._initDetectMode();
      }
    });
  }

  _bindIframeEvent() {
    // Resize
    $(window).resize(() => {
      this._resizeIframe();
    });

    // prevent original click
    this.$iframeContent.click(e => {
      e.preventDefault();
    });

    // mouse over event
    this.$iframeContent
        .mouseover(e => {
          $(e.target).addClass(NAME_DEFINE.class.mouseHover);
        })
        .mouseout(e => {
          $(e.target).removeClass(NAME_DEFINE.class.mouseHover);
        });

    // mouse click
    this.$iframeContent.click(e => {
      if (e.which === 1) {
        this.handleClickEvent(e.target);
      }
    });

    // back to home button
    this.$backToHomeBtn.click(e => {
      if (e.which === 1) {
        this.src = this.originalSrc;
        this.$loadingImg.fadeIn("fast");
        this.$iframe.attr("src", this.src);
        this.$backToHomeBtn.attr("disabled", true);
        this.isDetectMode = false;
      }
    });
  }

  _initTableEvent() {
    // table click
    $(`#${NAME_DEFINE.id.tableData}`)
        .find("tbody")
        .on("click", "tr", e => {
          if ($(e.currentTarget).hasClass(NAME_DEFINE.css.rowDetected)) {
            alert("This catalog was detected!");
            return;
          }
          if ($(e.currentTarget).hasClass(NAME_DEFINE.css.rowSelected)) {
            $(e.currentTarget).removeClass(NAME_DEFINE.css.rowSelected);
          } else {
            this.$tableData
                .$(`tr.${NAME_DEFINE.css.rowSelected.replace(/\s+/g, ".")}`)
                .removeClass(NAME_DEFINE.css.rowSelected);
            $(e.currentTarget).addClass(NAME_DEFINE.css.rowSelected);

            this.$rightCol.toggle("fast");
            let url = this.$tableData.row(e.currentTarget).data()[2];
            let enableScript = $("#enable-script")
                .text()
                .includes("Enable");

            $.get(
                `/api/create-temp-html?url=${url}&enableScript=${
                    enableScript ? 0 : 1
                }`,
                data => {
                  if (data.status) {
                    this.src = data.filePath;
                    this.$loadingImg.fadeIn("fast");
                    this.$iframe.attr("src", this.src);
                    this.$backToHomeBtn.attr("disabled", false);
                    this.isDetectMode = true;
                  } else {
                    alert(`Error: ${data.error}`);
                  }
                  this.$rightCol.toggle("fast");
                }
            );
          }
        });

    // Delete row
    this.$deleteBtn.click(e => {
      if (e.which === 1) {
        let trSelected = this.$tableData.$(
            `tr.${NAME_DEFINE.css.rowSelected.replace(/\s+/g, ".")}`
        );
        if (trSelected.length === 0) {
          alert("Please select catalog row before!");
        } else {
          let rs = confirm("Are you sure?");
          if (rs) {
            // remove markup
            let cssSelector = JSON.parse(
                this.$tableData.row(trSelected).data()[0]
            ).cssSelector;

            let catalogElement = this.$iframeContent.find(cssSelector).first();
            catalogElement.removeClass(NAME_DEFINE.class.mouseSelected);
            this._removeRowTableData(trSelected);
          }
        }
      }
    });

    // Reset row
    this.$resetBtn.click(e => {
      if (e.which === 1) {
        let rs = confirm("Are you sure?");
        if (rs) {
          this.$tableData.clear().draw();
          this.$iframeContent
              .find(NAME_DEFINE.class.mouseSelected.replace(/\s+/g, ",."))
              .removeClass(NAME_DEFINE.class.mouseSelected);
          this.$backToHomeBtn.trigger("click");
        }
      }
    });

    // Mark as detected
    this.$detectBtn.click(e => {
      if (e.which === 1) {
        let trSelected = this.$tableData.$(
            `tr.${NAME_DEFINE.css.rowSelected.replace(/\s+/g, ".")}`
        );
        if (trSelected.length === 0) {
          alert("Please select catalog row before!");
        } else {
          let inputData = JSON.parse(
              this.$tableData
                  .cell(this.$tableData.row(trSelected).index(), 0)
                  .data()
          );
          if (inputData.detailUrl === "" || inputData.pageNumber === "") {
            alert("You haven't detected Detail URL or Page Number!");
            return;
          }
          let rs = confirm("Are you sure?");
          if (rs) {
            $(trSelected).addClass(NAME_DEFINE.css.rowDetected);
          }
        }
      }
    });
  }

  _resizeIframe() {
    let maxWidth = this.$leftCol.width();
    let maxHeight = $(window).width();
    this.$iframe.width(maxWidth).height(maxHeight);
    this.$loadingImg.width(maxWidth).height(maxHeight);
  }

  getContentOfIframe() {
    return this.$iframe.contents().find("html");
  }

  _addCustomizeCss() {
    this.$iframeContent.append(
        `<style>
      .${NAME_DEFINE.css.borderSelectedStyle} { border: 1.5px solid #dee2e6 !important }
      .${NAME_DEFINE.css.borderSelectedColor} { border-color: #28a745!important }
      .${NAME_DEFINE.css.borderHoverStyle} { border: 0.5px solid #dee2e6 !important }
      .${NAME_DEFINE.css.borderHoverColor} { border-color: #dc3545!important }
    </style>`
    );
  }

  handleClickEvent(target) {
    switch (this.type) {
      case "catalog":
        if (!this.isDetectMode) {
          let data = [];
          data = detector.getAllCatalogElement(target);
          if (data.length === 0) {
            alert(
                "Detect failed! Make sure you select catalog area correctly."
            );
          }
          data.forEach(d => {
            let catalogElement = this.$iframeContent
                .find(d.cssSelector)
                .first();
            if (catalogElement.hasClass(NAME_DEFINE.class.mouseHover)) {
              catalogElement.removeClass(NAME_DEFINE.class.mouseHover);
            }
            if (!catalogElement.hasClass(NAME_DEFINE.class.mouseSelected)) {
              catalogElement.addClass(NAME_DEFINE.class.mouseSelected);
              this._addRowTableData(d);
            }
          });
        } else {
          this._detectDetailUrlAndPageNumber(target);
        }

        break;
      case "definition":
        break;
    }
  }

  _detectDetailUrlAndPageNumber(target) {
    if ($(target).prop("tagName") !== "A") {
      alert(`Detect failed! Make sure you select <a> tag correctly!`);
      return;
    }
    let trSelected = this.$tableData.$(
        `tr.${NAME_DEFINE.css.rowSelected.replace(/\s+/g, ".")}`
    );
    if (trSelected.length === 0) {
      alert("Please select catalog row before!");
    } else {
      let $detailUrlBadge = $(trSelected).find(
          `.${NAME_DEFINE.class.detailUrlBadge}`
      );
      let $pageNumberBadge = $(trSelected).find(
          `.${NAME_DEFINE.class.pageNumberBadge}`
      );
      let targetCssSelector = $(target).getCssSelector();
      let inputData = JSON.parse(
          this.$tableData.cell(this.$tableData.row(trSelected).index(), 0).data()
      );

      if (inputData.detailUrl === targetCssSelector) {
        inputData.detailUrl = "";
        this._updateInputColDataTable(inputData);
        $detailUrlBadge
            .text("Detail URL: No")
            .removeClass(NAME_DEFINE.css.badgeDetected)
            .addClass(NAME_DEFINE.css.badgeNotDetected);
        if ($(target).hasClass(NAME_DEFINE.class.mouseSelected)) {
          $(target).removeClass(NAME_DEFINE.class.mouseSelected);
        }
        return;
      }

      if (inputData.pageNumber === targetCssSelector) {
        let $parent = $(target).parent();
        inputData.pageNumber = "";
        this._updateInputColDataTable(inputData);
        $pageNumberBadge
            .text("Page number: No")
            .removeClass(NAME_DEFINE.css.badgeDetected)
            .addClass(NAME_DEFINE.css.badgeNotDetected);
        if ($parent.hasClass(NAME_DEFINE.class.mouseSelected)) {
          $parent.removeClass(NAME_DEFINE.class.mouseSelected);
        }
        return;
      }

      if (inputData.detailUrl === "") {
        let rs = confirm("Is this element of Detail URL?");
        if (rs) {
          if (detector.isPageNumberElement(target)) {
            alert("Some thing wrong! Make sure element is Detail URL Element");
            return;
          }
          inputData.detailUrl = targetCssSelector;
          this._updateInputColDataTable(inputData);
          $detailUrlBadge
              .text("Detail URL: Yes")
              .removeClass(NAME_DEFINE.css.badgeNotDetected)
              .addClass(NAME_DEFINE.css.badgeDetected);
          if ($(target).hasClass(NAME_DEFINE.class.mouseHover)) {
            $(target).removeClass(NAME_DEFINE.class.mouseHover);
          }
          if (!$(target).hasClass(NAME_DEFINE.class.mouseSelected)) {
            $(target).addClass(NAME_DEFINE.class.mouseSelected);
          }
          return;
        }
      }

      if (inputData.pageNumber === "") {
        let rs = confirm("Is this element of Page Number?");
        if (rs) {
          if (!detector.isPageNumberElement(target)) {
            alert("Some thing wrong! Make sure element is Page Number Element");
            return;
          }
          let $parent = $(target).parent();
          targetCssSelector = $parent.getCssSelector();
          inputData.pageNumber = targetCssSelector;
          this._updateInputColDataTable(inputData);
          $pageNumberBadge
              .text("Page number: Yes")
              .removeClass(NAME_DEFINE.css.badgeNotDetected)
              .addClass(NAME_DEFINE.css.badgeDetected);
          if ($parent.hasClass(NAME_DEFINE.class.mouseHover)) {
            $parent.removeClass(NAME_DEFINE.class.mouseHover);
          }
          if (!$parent.hasClass(NAME_DEFINE.class.mouseSelected)) {
            $parent.addClass(NAME_DEFINE.class.mouseSelected);
          }
        }
      }
    }
  }

  _addRowTableData(data) {
    switch (this.type) {
      case "catalog":
        let input = {
          header: data.header,
          href: data.href,
          cssSelector: data.cssSelector,
          detailUrl: "",
          pageNumber: ""
        };
        this.$tableData.row
            .add([
              JSON.stringify(input),
              data.header,
              data.href,
              `<p class="${NAME_DEFINE.class.detailUrlBadge} ${NAME_DEFINE.css.badgeNotDetected}">Detail URL: No</p>
            <p class="${NAME_DEFINE.class.pageNumberBadge} ${NAME_DEFINE.css.badgeNotDetected}">Page number: No</p>`
            ])
            .draw(false);
        break;
      case "definition":
        break;
    }
  }

  _removeRowTableData(tr) {
    switch (this.type) {
      case "catalog":
        this.$tableData
            .row(tr)
            .remove()
            .draw();
        break;
      case "definition":
        break;
    }
  }

  _initDetectMode() {
    let trSelected = this.$tableData.$(
        `tr.${NAME_DEFINE.css.rowSelected.replace(/\s+/g, ".")}`
    );
    if (trSelected.length === 0) {
      alert("Please select catalog row before!");
    } else {
      let detailUrlDetected = $(trSelected)
          .find(`input[name=detail-url]`)
          .val();
      let pageNumberDetected = $(trSelected)
          .find(`input[name=page-number]`)
          .val();
      if (
          !this.$iframeContent
              .find(detailUrlDetected)
              .first()
              .hasClass(NAME_DEFINE.class.mouseSelected)
      ) {
        this.$iframeContent
            .find(detailUrlDetected)
            .first()
            .addClass(NAME_DEFINE.class.mouseSelected);
      }
      if (
          !this.$iframeContent
              .find(pageNumberDetected)
              .first()
              .hasClass(NAME_DEFINE.class.mouseSelected)
      ) {
        this.$iframeContent
            .find(pageNumberDetected)
            .first()
            .addClass(NAME_DEFINE.class.mouseSelected);
      }
    }
  }

  _updateInputColDataTable(newData) {
    let trSelected = this.$tableData.$(
        `tr.${NAME_DEFINE.css.rowSelected.replace(/\s+/g, ".")}`
    );
    if (trSelected.length === 0) {
      return;
    }
    let rowIndex = this.$tableData.row(trSelected).index();
    this.$tableData.cell(rowIndex, 0).data(JSON.stringify(newData));
  }
}
