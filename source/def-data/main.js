const $ = require("jquery");
const handleIframe = require("./_handle-iframe-event");

$(document).ready(() => {
    // init handle iframe
    handleIframe.init();

    // window resize handle
    $(window).resize(() => {
        resizeIframe();
    });

    // Resize iframe
    const resizeIframe = () => {
        const $liveIframe = $("#live-iframe");
        const $loading = $("#loading-progress");
        let maxWidth = $liveIframe.parent().width();
        let maxHeight = $(window).width();
        $liveIframe.width(maxWidth).height(maxHeight);
        $loading.width(maxWidth).height(maxHeight);
    };
    resizeIframe();
});
