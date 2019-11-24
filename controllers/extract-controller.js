const DetailUrl = require("../models/detail-url-model");
const momentTimezone = require("moment-timezone");

exports.getIndex = (req, res, next) => {
    DetailUrl.aggregate([
        {$match: {isExtracted: false}},
        // { $limit: 3000 },
        {
            $lookup: {
                from: "catalogs",
                localField: "catalogId",
                foreignField: "_id",
                as: "catalog"
            }
        },
        {$unwind: "$catalog"},
        {
            $lookup: {
                from: "hosts",
                localField: "catalog.hostId",
                foreignField: "_id",
                as: "host"
            }
        },
        {$unwind: "$host"},
        {
            $lookup: {
                from: "definitions",
                localField: "catalog._id",
                foreignField: "catalogId",
                as: "definition"
            }
        },
        {
            $group: {
                _id: "$catalog",
                host: {$mergeObjects: "$host"},
                definition: {$sum: {$size: "$definition"}},
                urls: {
                    $push: {
                        urlId: "$_id",
                        url: "$url",
                        isExtracted: "$isExtracted",
                        cTime: {
                            $dateToString: {
                                format: "%Y-%m-%d %H:%M:%S",
                                date: "$cTime",
                                timezone: momentTimezone.tz.guess()
                            }
                        },
                        mTime: {
                            $dateToString: {
                                format: "%Y-%m-%d %H:%M:%S",
                                date: "$mTime",
                                timezone: momentTimezone.tz.guess()
                            }
                        }
                    }
                }
            }
        },
    {
        $group: {
            _id: "$host",
            hostId: {$addToSet: "$host._id"},
            hostname: {$addToSet: "$host.name"},
            catalogs: {
                $addToSet: {
                    catalogId: "$_id._id",
                    catalogName: "$_id.name",
                    isDefined: {
                        $cond: {
                            if: {$eq: ["$definition", 0]},
                            then: false,
                            else: true
                        }
                    },
                    urls: "$urls"
                }
            }
        }
    },
        {
            $project: {
                _id: 0
      }
    },
        {$unwind: "$hostname"},
        {$unwind: "$hostId"}
    ]).exec((err, data) => {
        if (err) {
            next(err);
        } else {
      let assigns = {
        title: "Extract",
        breadcrumb: [
          {
            href: "/extract",
            pageName: "Extract"
          }
        ],
          data: data
      };
      res.render("extract/view", assigns);
    }
    });
};
