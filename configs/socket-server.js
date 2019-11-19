exports.init = server => {
  const io = require("socket.io")(server);

  io.on("connection", socket => {
    console.log("Someone was connected!");
    setInterval(() => {
      socket.emit("test", "hellog");
    }, 2000);
  });

  global.io = io;
};
