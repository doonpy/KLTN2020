import SocketClient from "../services/SocketClient";

const $ = require("jquery");
const DEFAULT_NAME = {
  id: {
    modalName: "js-process-modal",
    labelName: "js-process-modal-label",
    content: "js-process-modal-content",
    catalogName: "js-process-modal-catalog-name",
    stopButton: "js-process-modal-stop-button"
  },
  class: {
    processLog: "js-process-log"
  }
};

export default class ProcessModal {
  constructor(params = {}) {
    this.header = params.header;
    this.processName = params.processName;
  }

  _getTemplate() {
    return `<!-- Modal -->
            <div class="modal fade" id="${DEFAULT_NAME.id.modalName}" tabindex="-1" role="dialog" aria-labelledby="${DEFAULT_NAME.id.modalName}" aria-hidden="true">
              <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h3 class="modal-title" id="${DEFAULT_NAME.id.labelName}">${this.header}</h3>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <h5>
                      Catalog:&nbsp;
                      <span id="${DEFAULT_NAME.id.catalogName}"></span>
                    </h5>
                    <textarea class="form-control rounded-0" id="${DEFAULT_NAME.id.content}" rows="10" cols="50" readonly style="font-family: Courier; font-size: 13px; resize: none;">Test</textarea>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-danger" id="${DEFAULT_NAME.id.stopButton}">Stop!</button>
                  </div>
                </div>
              </div>
            </div>`;
  }

  render() {
    $("body").append(this._getTemplate());
    this.$modal = $(`#${DEFAULT_NAME.id.modalName}`);
    this._bindEvent();
  }

  start(catalogName) {
    // set catalog name
    this.$modal.find($(`#${DEFAULT_NAME.id.catalogName}`)).text(catalogName);
    this.socket = SocketClient.getInstance();
    SocketClient.emitEvent("process-start");
    this._bindSocketEvent();
  }

  show() {
    this.$modal.modal("show");
  }

  _bindSocketEvent() {
    this.socket.on("process-message", message => {
      this._updateContent(message);
    });
  }

  _updateContent(newContent) {
    let $content = this.$modal.find(`#${DEFAULT_NAME.id.content}`);
    let currContent = $content.text();
    $content
        .text(`${currContent}\n${newContent}`)
        .scrollTop($content[0].scrollHeight);
  }

  _bindEvent() {
    // on modal closed
    this.$modal.on("hidden.bs.modal", function () {
      // alert("modal closed");
    });

    // stop button clicked
    this.$modal.find(`#${DEFAULT_NAME.id.stopButton}`).click(function (e) {
      if (e.which === 1) {
        SocketClient.emitEvent("process-stop");
        SocketClient.disconnect();
      }
    });
  }
}
