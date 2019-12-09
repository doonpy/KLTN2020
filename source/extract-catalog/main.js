import TargetIframe from "../components/target-iframe/TargetIframe";

const $ = require("jquery");

$(document).ready(() => {
  let iframeSrc = $("#iframe-src").text();
  let targetIframe = new TargetIframe({
    src: iframeSrc,
    posElement: "#main-content",
    type: 'catalog'
  });
  targetIframe.init();
});

function test() {
  console.log(test);
}
