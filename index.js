const { fork } = require("child_process");
function main() {
  // fork another process
  const process = fork("./send_mail.js");
  const mails = "Poon";
  // send list of e-mails to forked process
  process.send({ mails });
  // listen for messages from forked process
  process.on("message", message => {
    log.info(`Number of mails sent ${message.counter}`);
  });
}

main();
