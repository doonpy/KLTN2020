const extractCore = require("../core/extract");
const PROCESS_TYPE = {
    EXTRACT: 1
};

exports.init = server => {
    const io = require("socket.io")(server);

    io.on("connection", socket => {
        console.log(`=> Connected: ${socket.id}`);

        // listen start process event
        socket.on("process-start", data => {
            extractCore.main("batdongsan.com.vn", "5dd6aac9da7a2a333c94521b", socket);
            // let type = data.message.type;
            // switch (type) {
            //   case PROCESS_TYPE.EXTRACT:
            //
            // }
        });

        // listen stop process event
        socket.on("process-stop", data => {
            console.log(data);
            console.log(socket.id);
        });

        // disconnect
        socket.on("disconnect", reason => {
            console.log(`=> Disconnected: ${socket.id} - Reason: ${reason}`);
        });
    });
};
