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
    threadInfo: "js-thread-modal-thread-info"
  },
  class: {
    processLog: "js-thread-log"
  },
  socket: {type: "extract"}
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
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
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
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
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

  start(catalogName, catalogId) {
    // set catalog name
    $(`#${DEFAULT_NAME.id.content}`).empty();
    this.$modal.find($(`#${DEFAULT_NAME.id.catalogName}`)).text(catalogName);
    this.socket = SocketClient.getInstance();
    SocketClient.emitEvent("thread-start", {
      type: DEFAULT_NAME.socket.type,
      catalogId: catalogId
    });
    this._bindSocketEvent();
    $(`#${DEFAULT_NAME.id.continueButton}`).prop("disabled", true);
    $(`#${DEFAULT_NAME.id.pauseButton}`).prop("disabled", false);
    $(`#${DEFAULT_NAME.id.stopButton}`).prop("disabled", false);
  }

  show() {
    this.$modal.modal("show");
  }

  _bindSocketEvent() {
    this.socket.on("thread-message", payload => {
      this._updateContent(payload);
    });
    this.socket.on("thread-info", payload => {
      $(`#${DEFAULT_NAME.id.threadInfo}`).text(
          `Process: ${payload.processId} - Thread: ${payload.threadId}`
      );
      threadId = payload.threadId;
    });
  }

  _updateContent(payload) {
    let $content = this.$modal.find(`#${DEFAULT_NAME.id.content}`);
    let item = ``;
    switch (payload.type) {
      case "extract-success":
        item = `<p class="text-success">=&gt; ${payload.message}</p>`;
        break;
      case "extract-error":
        item = `<p class="text-error">=&gt; ${payload.message}</p>`;
        break;
      default:
        item = `<p class="text-info">=&gt; ${payload.message}</p>`;
        break;
    }
    $content.append(item).scrollTop($content[0].scrollHeight);
  }

  _bindEvent() {
    // on modal closed
    this.$modal.on("hidden.bs.modal", function () {
      // alert("modal closed");
    });

    // stop button clicked
    this.$modal.find(`#${DEFAULT_NAME.id.stopButton}`).click(function (e) {
      if (e.which === 1) {
        SocketClient.emitEvent("thread-stop", {
          type: DEFAULT_NAME.socket.type
        });
        $(`#${DEFAULT_NAME.id.continueButton}`).prop("disabled", true);
        $(`#${DEFAULT_NAME.id.pauseButton}`).prop("disabled", true);
        $(e.target).prop("disabled", true);
      }
    });

    // pause button clicked
    this.$modal.find(`#${DEFAULT_NAME.id.pauseButton}`).click(function (e) {
      if (e.which === 1) {
        SocketClient.emitEvent("thread-pause", {
          type: DEFAULT_NAME.socket.type
        });
        $(`#${DEFAULT_NAME.id.continueButton}`).prop("disabled", false);
        $(e.target).prop("disabled", true);
      }
    });

    // continue button clicked
    this.$modal.find(`#${DEFAULT_NAME.id.continueButton}`).click(function (e) {
      if (e.which === 1) {
        SocketClient.emitEvent("thread-continue", {
          type: DEFAULT_NAME.socket.type
        });
        $(`#${DEFAULT_NAME.id.pauseButton}`).prop("disabled", false);
        $(e.target).prop("disabled", true);
      }
    });
  }
}
