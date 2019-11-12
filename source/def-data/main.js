const $ = require("jquery");
const handleIframe = require("./handle-iframe");

$(document).ready(() => {
    let hostname = $("#hostname").text();
    let filename = $("#filename").text();

    $("#live-iframe").attr("src", `/api/get-html/${hostname}/${filename}`);

    //init handle iframe
    handleIframe.init();

    //toggle right-side
    $("#swift-right").click(e => {
        if (e.which === 1) {
            $("#right").toggle("fast");
        }
    });
});
