// require("./schedule").main(
//   ["https://www.samanthaming.com", "https://google.com"],
//   10000
// );

// require("./crawler").main("https://vnexpress.net", { deepLimit: 2 });

console.log(
  require("./storage-method").getRawHtmlFile("vnexpress.net", "Góc nhìn")
);
