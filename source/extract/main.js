const $ = require("jquery");
import ProcessModal from "../components/ProcessModal";

$(document).ready(() => {
    // function sendPostRequest(url, data){
    //     $.post(url,data,(res)=>{
    //         handleSuccess(res);
    //     })
    // }

    // Click extract button event
    $(".extract-btn").click(e => {
        if (e.which === 1) {
            let listCatalogId = $(e.target).data().catalogName;
            let params = {
                header: "Extracting Process",
                processName:'extract'
            };
            let temp = new ProcessModal(params).render($('body'));
            console.log(temp);
        }
    });
});
