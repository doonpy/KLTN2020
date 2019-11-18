const DetailUrl = require("../models/detail-url-model");
const Definition = require("../models/definition-model");
const async = require("async");

exports.getIndex = (req, res, next) => {
  async.parallel(
    {
      detailUrls: function(callback) {
        DetailUrl.find({}, callback);
      },
      definitions: function(callback) {
        Definition.find({}, callback);
      }
    },
    (err, results) => {
      if (err) {
        next(err);
        return;
      }
      results.detailUrls.forEach(detailUrl => {
        let definitionList = results.definitions.find(
          d => d.hostname === detailUrl.hostname
        );
        if (definitionList) {
          detailUrl.catalogList.forEach(catalog => {
            let found = definitionList.definitions.find(
              def => def.catalogName === catalog.catalogName
            );
            console.log(found);
            if (found) {
              catalog.isDefined = true;
            } else {
              catalog.isDefined = false;
            }
          });
        }
      });

      let assigns = {
        title: "Extract",
        breadcrumb: [
          {
            href: "/extract",
            pageName: "Extract"
          }
        ],
        detailUrls: results.detailUrls
      };
      res.render("extract/view", assigns);
    }
  );
};
