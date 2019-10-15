const helper = require('./helper');

exports.getHtml = (req, res, next) => {
  const domain = req.query.domain;
  const amount = req.query.amount;

  if (domain === undefined || amount === undefined) {
    return res.status(400).json({
      message: 'Bad request',
    });
  }

  const body = helper.getHtmlFile(domain, amount);

  res.status(200).json(body);
};
