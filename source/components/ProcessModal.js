const $ = require("jquery");
const DEFAULT_SETING = {
    id: {
        modalName: "js-process-modal"
    },
    class: {
        processLog: "js-process-log"
    }
};

export class ProcessModal {
    constructor(params) {
        this.header = params.header;
        this.socket = params.socket;
        this._render(params);
        this._bindSocketEvent();
    }

    _render() {
        let modal = `<!-- The Modal -->
                <div class="modal" id="${DEFAULT_SETING.id.modalName}">
                  <div class="modal-dialog">
                    <div class="modal-content">
                
                      <!-- Modal Header -->
                      <div class="modal-header">
                        <h4 class="modal-title">${this.header}</h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                      </div>
                
                      <!-- Modal body -->
                      <div class="modal-body">
                        <textarea class="${DEFAULT_SETING.class.processLog}" rows="20"></textarea>
                      </div>
                
                      <!-- Modal footer -->
                      <div class="modal-footer">
                        <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                      </div>
                
                    </div>
                  </div>
                </div>`;
        $("body").append(modal);
    }

    _bindSocketEvent() {
        this.socket.on("test", data => {
            console.log(data);
        });
    }
}
