const $ = require("jquery");
import ProcessModal from "../components/ProcessModal";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";

$(document).ready(() => {
    // Initialize process modal
    const processModal = new ProcessModal({
        header: "Extracting Process",
        processName: "extract"
    });
    processModal.render();

    // Click extract button event
    $(".extract-btn").click(e => {
        if (e.which === 1) {
            let data = $(e.target).data();
            processModal.start(data.catalogName, data.catalogId);
        }
    });
});
