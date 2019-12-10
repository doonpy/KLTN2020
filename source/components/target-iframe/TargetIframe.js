const $ = require("jquery");
const detector = require("./_detector");
import "datatables.net-bs4/css/dataTables.bootstrap4.css";
import "datatables.net-rowgroup-bs4";

// Extend $ to get CSS selector string
$.fn.extend({
  getCssSelector: function() {
    let el = this;
    let parents = el.parents();
    if (!parents[0]) {
      // Element doesn't have any parents
      return ":root";
    }
    let selector = this.getElementSelector(el);
    let i = 0;
    let elementSelector;

    if (selector[0] === "#" || selector === "body") {
      return selector;
    }

    do {
      elementSelector = this.getElementSelector($(parents[i]));
      selector = elementSelector + ">" + selector;
      i++;
    } while (i < parents.length - 1 && elementSelector[0] !== "#"); // Stop before we reach the html element parent
    return selector;
  },
  getElementSelector: function(el) {
    if (el.hasClass(NAME_DEFINE.class.mouseHover)) {
      el.removeClass(NAME_DEFINE.class.mouseHover);
    }
    if (el.hasClass(NAME_DEFINE.class.mouseSelected)) {
      el.removeClass(NAME_DEFINE.class.mouseSelected);
    }
    if (el.attr("id")) {
      return "#" + el.attr("id");
    } else {
      let tagName = el.get(0).tagName.toLowerCase();
      if (tagName === "body") {
        return tagName;
      }
      if (el.attr("class")) {
        let className = `.${el
          .attr("class")
          .trim()
          .replace(/\s+/g, ".")}`;
        let classSiblings = el.siblings(className);
        if (classSiblings.length <= 0) {
          return `${el.get(0).tagName.toLowerCase()}${className}`;
        } else {
          return `${el.get(0).tagName.toLowerCase()}:nth-child(${el.index() +
            1})`;
        }
      }
      if (el.siblings().length === 0) {
        return el.get(0).tagName.toLowerCase();
      }
      if (el.index() === 0) {
        return `${el.get(0).tagName.toLowerCase()}:first-child`;
      }
      if (el.index() === el.siblings().length) {
        return `${el.get(0).tagName.toLowerCase()}:last-child`;
      }
      return `${el.get(0).tagName.toLowerCase()}:nth-child(${el.index() + 1})`;
    }
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
  },
  settings: {
    dataColumn: 0,
    checkColumn: 1,
    urlColumn: 3
  },
  commandUrl: {
    postAddCatalog: "/catalog/ajax-add"
  },
  data: {
    notMark: 0,
    marked: 1
  }
};

export default class TargetIframe {
  constructor(props) {
    this.src = props.src;
    this.originalSrc = props.src;
    this.posElement = props.posElement.trim();
    this.type = props.type.trim();
    this.isDetectMode = false;
    this.originalHostName = "";
  }

  init() {
    this.$posElement = $(this.posElement);
    this.$posElement.append(this._getTemplates());
    this.$leftCol = $(`#${NAME_DEFINE.id.leftCol}`);
    this.$rightCol = $(`#${NAME_DEFINE.id.rightCol}`);
    this.$tableData = $(`#${NAME_DEFINE.id.tableData}`).DataTable({
      columnDefs: [
        {
          targets: [
            NAME_DEFINE.settings.dataColumn,
            NAME_DEFINE.settings.checkColumn
          ],
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
                <th scope="col">Check</th>
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
      if (this.originalHostName === "") {
        this.originalHostName = this.$iframeContent
          .find("title")
          .text()
          .replace(/\n\r/g, "")
          .trim();
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
        this._loadOriginalSrc();
      }
    });
  }

  _loadOriginalSrc() {
    this.src = this.originalSrc;
    this.originalHostName = "";
    this.$loadingImg.fadeIn("fast");
    this.$iframe.attr("src", this.src);
    this.$backToHomeBtn.attr("disabled", true);
    this.isDetectMode = false;
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
          let url = this.$tableData.row(e.currentTarget).data()[
            NAME_DEFINE.settings.urlColumn
          ];
          let enableScript = $("#enable-script")
            .text()
            .includes("Enable");

          $.get(
            `/api/create-temp-html?url=${decodeURI(url)}&enableScript=${
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
              this.$tableData.row(trSelected).data()[
                NAME_DEFINE.settings.dataColumn
              ]
            ).cssSelector;

            let catalogElement = this.$iframeContent.find(cssSelector).first();
            catalogElement.removeClass(NAME_DEFINE.class.mouseSelected);
            this._removeRowTableData(trSelected);
            this._loadOriginalSrc();
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
          this._loadOriginalSrc();
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
              .cell(
                this.$tableData.row(trSelected).index(),
                NAME_DEFINE.settings.dataColumn
              )
              .data()
          );
          if (inputData.detailUrl === "" || inputData.pageNumber === "") {
            alert("You haven't detected Detail URL or Page Number!");
            return;
          }
          let rs = confirm("Are you sure?");
          if (rs) {
            let rowIndex = this.$tableData.row(trSelected).index();
            this.$tableData
              .cell(rowIndex, NAME_DEFINE.settings.checkColumn)
              .data(NAME_DEFINE.data.marked);
            this.$tableData
              .$(`tr.${NAME_DEFINE.css.rowSelected.replace(/\s+/g, ".")}`)
              .removeClass(NAME_DEFINE.css.rowSelected);
            $(trSelected).addClass(NAME_DEFINE.css.rowDetected);
          }
        }
      }
    });

    // Submit
    this.$submitBtn.click(e => {
      let domain = $("#target")
        .text()
        .trim();
      let rowAmount = this.$tableData.$("tr").length;
      if (rowAmount === 0) {
        alert("Nothing to save!");
        return;
      }
      for (let i = 0; i < rowAmount; i++) {
        if (
          this.$tableData.cell(i, NAME_DEFINE.settings.checkColumn).data() === 0
        ) {
          alert("Please markup all row before submit!");
          return;
        }
      }
      let rs = confirm("Are you sure?");
      if (rs) {
        let catalogData = [];
        for (let i = 0; i < rowAmount; i++) {
          catalogData.push(
            JSON.parse(
              this.$tableData.cell(i, NAME_DEFINE.settings.dataColumn).data()
            )
          );
        }
        $.post(
          NAME_DEFINE.commandUrl.postAddCatalog,
          {
            hostname: this.originalHostName,
            domain: domain,
            catalogData: JSON.stringify(catalogData)
          },
          res => {
            if (res.status) {
              alert(res.message);
              window.location.href = "/catalog";
            } else {
              alert(res.message);
            }
          }
        );
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
    while ($(target).prop("tagName") !== "A") {
      if ($(target).prop("tagName") === "BODY") {
        alert(`Detect failed! Make sure you select <a> tag correctly!`);
        return;
      }
      target = $(target).parent();
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
      console.log(targetCssSelector);
      let inputData = JSON.parse(
        this.$tableData
          .cell(
            this.$tableData.row(trSelected).index(),
            NAME_DEFINE.settings.dataColumn
          )
          .data()
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
            NAME_DEFINE.data.notMark,
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
      let inputData = JSON.parse(
        this.$tableData
          .cell(
            this.$tableData.row(trSelected).index(),
            NAME_DEFINE.settings.dataColumn
          )
          .data()
      );
      let detailUrlDetected = inputData.detailUrl;
      let pageNumberDetected = inputData.pageNumber;
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
    this.$tableData
      .cell(rowIndex, NAME_DEFINE.settings.dataColumn)
      .data(JSON.stringify(newData));
  }
}
