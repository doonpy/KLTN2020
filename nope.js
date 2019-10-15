const dateRepeat = 1;

require('./core/crawler/schedule').main(
    [
      'https://batdongsan.com.vn/',
      'https://alonhadat.com.vn',
      'http://www.batdongsan.vn/',
      'https://www.muabannhadat.vn/',
      'https://nhadat.cafeland.vn/',
      'https://homedy.com/',
      'http://123nhadat.vn/',
      'https://kenhbds.vn/',
      'http://diaoconline.vn/',
    ],
    dateRepeat
);

// require("./crawler").main("https://vnexpress.net", { deepLimit: 2 });
