const DATE_REPEAT = 1;
const Target = require('../api/models/target');
const OPTIONS = {
  maxRequestPerCrawl: 10,
};

Target.find({}, 'url', (err, targetList) => {
  if (err) throw err;
  const urlList = targetList.map((a) => a.url);
  require('../core/crawler/schedule').main(urlList, DATE_REPEAT, OPTIONS);
});
