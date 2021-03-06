const ExtractThread = require("../core/extract/ExtractThread");

let threadList = [];

function getThreadBySocketId(socketId) {
  return threadList.find(thread => thread.getSocketId() === socketId);
}

function isCatalogExtracting(catalogId) {
  if (threadList.find(thread => thread.getCatalogId() === catalogId)) {
    return true;
  }
  return false;
}

exports.init = server => {
  const io = require("socket.io")(server);

  io.on("connection", socket => {
    console.log(
      `=> [W${process.pid} - ${require("moment")().format(
        "L LTS"
      )}] Connected: ${socket.id}`
    );

    // // listen start thread event
    // socket.on("thread-start", payload => {
    //   switch (payload.type) {
    //     case "extract":
    //       if (
    //         getThreadBySocketId(socket.id) ||
    //         isCatalogExtracting(payload.catalogId)
    //       ) {
    //         socket.emit("thread-message", {
    //           type: "extract-error",
    //           message: "This catalog is extracting by someone"
    //         });
    //         return;
    //       }
    //       const modulePath = require.resolve("../core/extract/extract");
    //       let threadInstance = new ExtractThread({
    //         modulePath: modulePath,
    //         socket: socket,
    //         catalogId: payload.catalogId
    //       });
    //       threadList.push(threadInstance);
    //       break;
    //     case "crawl":
    //       break;
    //   }
    // });
    //
    // // listen stop thread event
    // socket.on("thread-stop", payload => {
    //   switch (payload.type) {
    //     case "extract":
    //       let thread = getThreadBySocketId(socket.id);
    //       if (thread) {
    //         thread.terminate();
    //         let index = threadList.indexOf(thread);
    //         threadList.splice(index, 1);
    //       }
    //       break;
    //     case "crawl":
    //       break;
    //     default:
    //       break;
    //   }
    // });
    //
    // // listen pause thread event
    // socket.on("thread-pause", payload => {
    //   switch (payload.type) {
    //     case "extract":
    //       let thread = getThreadBySocketId(socket.id);
    //       if (thread) {
    //         thread.pause();
    //       }
    //       break;
    //     case "crawl":
    //       break;
    //     default:
    //       break;
    //   }
    // });
    //
    // // listen pause thread event
    // socket.on("thread-continue", payload => {
    //   switch (payload.type) {
    //     case "extract":
    //       let thread = getThreadBySocketId(socket.id);
    //       if (thread) {
    //         thread.continue();
    //       }
    //       break;
    //     case "crawl":
    //       break;
    //     default:
    //       break;
    //   }
    // });

    // disconnect
    socket.on("disconnect", reason => {
      // stop extract thread
      let extractThread = getThreadBySocketId(socket.id);
      if (extractThread) {
        extractThread.terminate();
        let index = threadList.indexOf(extractThread);
        threadList.splice(index, 1);
      }
      console.log(
        `=> [W${process.pid} - ${require("moment")().format(
          "L LTS"
        )}] Disconnected: ${socket.id} - Reason: ${reason}`
      );
    });
  });
};
