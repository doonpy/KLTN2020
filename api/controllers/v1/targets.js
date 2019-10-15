const Target = require('../../models/target');
const helper = require('./helper');

exports.getAllTarget = new Promise((resolve, reject) => {
  Target.find({}, (err, data) => {
    if (err) reject(err);
    resolve(data);
  });
});

exports.addTarget = (url) => {
  return new Promise((resolve, reject) => {
    if (!helper.validateUrl(url)) reject(new Error('Target invalid'));

    Target.findOne({url: url}, (err, found) => {
      if (err) reject(err);
      if (found) reject(new Error('Target already existed'));
      const target = new Target({
        url: url,
        lastCrawl: new Date(),
      });

      target.save((err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
};

exports.removeTarget = (url) => {
  return new Promise((resolve, reject) => {
    if (!helper.validateUrl(url)) reject(new Error('Target invalid'));

    Target.findOne({url: url}, (err, found) => {
      if (err) reject(err);
      if (!found) reject(new Error('Target not existed'));

      Target.findOneAndRemove({url: url}, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
};

exports.updateTarget = (oldTarget, newTarget) => {
  return new Promise((resolve, reject) => {
    if (
      !helper.validateUrl(oldTarget.url) ||
      !helper.validateUrl(newTarget.url)
    ) {
      reject(new Error('Target invalid'));
    }

    Target.findOne({url: oldTarget.url}, (err, found) => {
      if (err) reject(err);
      if (!found) reject(new Error('Target not existed'));

      found.__v++;
      Target.findOneAndUpdate(
          {url: oldTarget.url},
          {url: newTarget.url, __v: found.__v},
          {omitUndefined: false},
          (err) => {
            if (err) reject(err);
            resolve();
          }
      );
    });
  });
};
