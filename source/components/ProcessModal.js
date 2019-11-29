import SocketClient from "../services/SocketClient";

const $ = require("jquery");
const DEFAULT_NAME = {
  id: {
    modalName: "js-thread-modal",
    labelName: "js-thread-modal-label",
    content: "js-thread-modal-content",
    catalogName: "js-thread-modal-catalog-name",
    stopButton: "js-thread-modal-stop-button",
    pauseButton: "js-thread-modal-pause-button",
    continueButton: "js-thread-modal-continue-button",
    threadInfo: "js-thread-modal-thread-info",
    showModalButton: "js-thread-show-modal-button",
    closeModalBUtton: "js-thread-close-modal-button"
  },
  class: {
    processLog: "js-thread-log"
  },
  socket: { type: "extract" }
};
let threadId = null;

export default class ProcessModal {
  constructor(params = {}) {
    this.header = params.header;
    this.processName = params.processName;
  }

  _getTemplate() {
    return `<!-- Modal -->
            <div class="modal fade" id="${DEFAULT_NAME.id.modalName}" tabindex="-1" role="dialog" aria-labelledby="${DEFAULT_NAME.id.modalName}" aria-hidden="true">
              <div class="modal-dialog modal-xl" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h3 class="modal-title" id="${DEFAULT_NAME.id.labelName}">${this.header}</h3>
                  </div>
                  <div class="modal-body">
                    <h5>
                      Catalog:&nbsp;
                      <span id="${DEFAULT_NAME.id.catalogName}"></span>
                    </h5>
                    <h6 id="${DEFAULT_NAME.id.threadInfo}"></h6>
                    <div class="form-control rounded-0" id="${DEFAULT_NAME.id.content}" 
                        style="width:100%; height:50vh; overflow: auto; font-family: Courier; font-size: 13px; resize: none;">
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-warning" id="${DEFAULT_NAME.id.pauseButton}">Pause</button>
                    <button type="button" class="btn btn-success" id="${DEFAULT_NAME.id.continueButton}">Continue</button>
                    <button type="button" class="btn btn-danger" id="${DEFAULT_NAME.id.stopButton}">Stop</button>
                    <button type="button" class="btn btn-secondary" id="${DEFAULT_NAME.id.closeModalBUtton}">Close</button>
                  </div>
                </div>
              </div>
            </div>`;
  }

  render() {
    $("body").append(this._getTemplate());
    this.$modal = $(`#${DEFAULT_NAME.id.modalName}`);
    this.$continueBtn = this.$modal.find(`#${DEFAULT_NAME.id.continueButton}`);
    this.$pauseBtn = this.$modal.find(`#${DEFAULT_NAME.id.pauseButton}`);
    this.$stopBtn = this.$modal.find(`#${DEFAULT_NAME.id.stopButton}`);
    this.$showModalBtn = $(`#${DEFAULT_NAME.id.showModalButton}`);
    this.$closeModalBtn = this.$modal.find(
      `#${DEFAULT_NAME.id.closeModalBUtton}`
    );
    this.$catalogName = this.$modal.find($(`#${DEFAULT_NAME.id.catalogName}`));
    this.$content = this.$modal.find(`#${DEFAULT_NAME.id.content}`);
    this.$threadInfo = this.$modal.find(`#${DEFAULT_NAME.id.threadInfo}`);
    this._bindEvent();
  }

  start(catalogName, catalogId) {
    // set catalog name
    if (this.socket) {
      alert("You can run only one Thread in the same time.");
      return;
    }

    $(`#${DEFAULT_NAME.id.content}`).empty();
    this.$catalogName.text(catalogName);
    this.socket = SocketClient.getInstance();
    SocketClient.emitEvent("thread-start", {
      type: DEFAULT_NAME.socket.type,
      catalogId: catalogId
    });
    this._bindSocketEvent();
    this.$continueBtn.prop("disabled", true);
    this.$pauseBtn.prop("disabled", false);
    this.$stopBtn.prop("disabled", false);
    this.show();
  }

  show() {
    this.$modal.modal("show");
    this.$showModalBtn.addClass("d-none");
  }

  close() {
    this.$modal.modal("hide");
    if (this.socket) {
      this.$showModalBtn.removeClass("d-none");
    }
  }

  _bindSocketEvent() {
    this.socket.on("thread-message", payload => {
      this._updateContent(payload);
    });
    this.socket.on("thread-info", payload => {
      this.$threadInfo.text(
        `Process: ${payload.processId} - Thread: ${payload.threadId}`
      );
      threadId = payload.threadId;
    });
  }

  _updateContent(payload) {
    let item = ``;
    switch (payload.type) {
      case "extract-success":
        item = `<p class="text-success">=&gt; ${payload.message}</p>`;
        break;
      case "extract-error":
        item = `<p class="text-danger">=&gt; ${payload.message}</p>`;
        break;
      default:
        item = `<p class="text-info">=&gt; ${payload.message}</p>`;
        break;
    }
    this.$content.append(item).scrollTop(this.$content.scrollHeight);
  }

  _bindEvent() {
    // stop button clicked
    this.$stopBtn.click(e => {
      if (e.which === 1) {
        SocketClient.emitEvent("thread-stop", {
          type: DEFAULT_NAME.socket.type
        });
        this.socket = SocketClient.disconnect();
        this.$continueBtn.prop("disabled", true);
        this.$pauseBtn.prop("disabled", true);
        this.$stopBtn.prop("disabled", true);
      }
    });

    // pause button clicked
    this.$pauseBtn.click(e => {
      if (e.which === 1) {
        SocketClient.emitEvent("thread-pause", {
          type: DEFAULT_NAME.socket.type
        });
        this.$continueBtn.prop("disabled", false);
        this.$pauseBtn.prop("disabled", true);
        this.$showModalBtn.removeClass("btn-success").addClass("btn-warning");
      }
    });

    // continue button clicked
    this.$continueBtn.click(e => {
      if (e.which === 1) {
        SocketClient.emitEvent("thread-continue", {
          type: DEFAULT_NAME.socket.type
        });
        this.$pauseBtn.prop("disabled", false);
        this.$continueBtn.prop("disabled", true);
        this.$showModalBtn.removeClass("btn-warning").addClass("btn-success");
      }
    });

    // show modal button
    this.$showModalBtn.click(e => {
      if (e.which === 1) {
        this.show();
      }
    });

    // close modal button
    this.$closeModalBtn.click(e => {
      if (e.which === 1) {
        this.close();
      }
    });
  }
}
