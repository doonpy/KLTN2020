import SocketClient from "../services/SocketClient";

const DEFAULT_SETING = {
    id: {
        modalName: "js-process-modal"
    },
    class: {
        processLog: "js-process-log"
    }
};

export default class ProcessModal {
    constructor(params={}) {
        this.header = params.header;
        this.html = params.html;
        this.processName = params.processName;
        this._setTemplate();
        SocketClient.initInstance();
        this.socket = SocketClient.getInstance();
        this._bindSocketEvent();
    }

    _getTemplate(){
        return this.html;
    }

    _setTemplate() {
        this.html = `<!-- The Modal -->
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
    }

    _bindSocketEvent() {
        this.socket.on("test", data => {
            console.log(data);
        });
    }

    render($body){
        if($body){
            $body.append(this._getTemplate());
        }
    }
}
