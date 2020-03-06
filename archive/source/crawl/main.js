const $ = require("jquery");

$(document).ready(() => {
    const socket = io();

    // listen success event
    socket.on("success", data => {
        let url = data.url;
        let host = data.host;
        let child = ``;

        if (data.isHostDefined) {
            child = `<li class="mb-2 btn btn-success btn-sm">${url} - <b>${data.statusCode}</b> - <b>${host} was defined data<b></li>`;
        } else {
            child = `<li class="mb-2 btn btn-warning btn-sm">${url} - <b>${data.statusCode}</b> - <b>${host} has not been defined data<b></li>`;
        }

        $("#results").append(child);
    });

    //listen failed event
    socket.on("failed", data => {
        let url = data.response;
        let child = `<li class="mb-2 btn btn-danger btn-sm">${url} - <b>${data}</b></li>`;
        $("#results").append(child);
    });
});
