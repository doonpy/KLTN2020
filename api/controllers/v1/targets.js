const Target = require('../../models/target');
const helper = require('./helper');

const isTargetExist = (url) => {
  return new Promise((resolve, reject) => {
    Target.findOne({url: url}, (err, found) => {
      if (err) return reject(err);
      if (found) return resolve(true);
      resolve(false);
    });
  });
};

const getAllTarget = () => {
  return new Promise((resolve, reject) => {
    Target.find({}, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const addTarget = (url) => {
  return new Promise((resolve, reject) => {
    if (!helper.validateUrl(url)) reject(new Error('Target invalid'));

    isTargetExist(url)
        .then(async (result) => {
          if (result) return reject(new Error('Target already existed'));
          const target = new Target({
            url: url,
            lastCrawl: new Date(),
          });
          try {
            await target.save();
            resolve();
          } catch (err) {
            reject(err);
          }
        })
        .catch((err) => {
          reject(err);
        });
  });
};

const deleteTarget = (url) => {
  return new Promise((resolve, reject) => {
    if (!helper.validateUrl(url)) reject(new Error('Target invalid'));

    Target.findOne({url: url}, (err, found) => {
      if (err) {
        reject(err);
        return;
      }
      if (found == null) {
        reject(new Error('Target not existed'));
        return;
      }

      Target.findOneAndDelete({url: url}, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
};

const updateTarget = (oldTarget, newTarget) => {
  return new Promise((resolve, reject) => {
    if (
      !helper.validateUrl(oldTarget.url) ||
      !helper.validateUrl(newTarget.url)
    ) {
      return reject(new Error('Target invalid'));
    }

    isTargetExist(newTarget.url)
        .then(async (result) => {
          if (result) return reject(new Error('New target already existed'));
          const found = await Target.findOne({url: oldTarget.url});
          if (found === null) return reject(new Error('Old target not exist'));
          found.__v++;
          Target.findOneAndUpdate(
              {url: oldTarget.url},
              {url: newTarget.url, __v: found.__v},
              {omitUndefined: false},
              (err) => {
                if (err) return reject(err);
                resolve();
              }
          );
        })
        .catch((err) => {
          reject(err);
        });
  });
};

exports.getTarget = (req, res, next) => {
  getAllTarget()
      .then((targets) => {
        const body = {
          targets: targets,
          status: 'Success',
        };
        res.status(200).json(body);
      })
      .catch((err) => {
        const body = {
          message: err,
          status: 'Error',
        };
        res.status(200).json(body);
      });
};

exports.postTarget = (req, res, next) => {
  const url = req.body.url;
  if (url === undefined) {
    return res.status(400).json({
      message: 'Bad request',
      status: 'Error',
    });
  }
  addTarget(url)
      .then(() => {
        res.status(200).json({
          message: 'Add target success',
          status: 'Success',
        });
      })
      .catch((err) => {
        res.status(400).json({
          message: err.message,
          status: 'Error',
        });
      });
};

exports.putTarget = (req, res, next) => {
  const oldUrl = req.body.oldUrl;
  const newUrl = req.body.newUrl;
  if (oldUrl === undefined || newUrl === undefined) {
    return res.status(400).json({
      message: 'Bad request',
      status: 'Error',
    });
  }
  updateTarget(oldUrl, newUrl)
      .then(() => {
        res.status(200).json({
          message: 'Update target success',
          status: 'Success',
        });
      })
      .catch((err) => {
        res.status(400).json({
          message: err.message,
          status: 'Error',
        });
      });
};

exports.deleteTarget = (req, res, next) => {
  const url = req.body.url;
  if (url === undefined) {
    return res.status(400).json({
      message: 'Bad request',
      status: 'Error',
    });
  }
  deleteTarget(url)
      .then(() => {
        res.status(200).json({
          message: 'Delete target success',
          status: 'Success',
        });
      })
      .catch((err) => {
        res.status(400).json({
          message: err.message,
          status: 'Error',
        });
      });
};

exports.getAllTarget = getAllTarget;
exports.updateTarget = updateTarget;
