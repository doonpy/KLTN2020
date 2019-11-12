const express = require("express");
const router = express.Router();
const Definition = require("../models/definition-model");

/**
 * get all definition
 */
router.get("/", function (req, res, next) {
  Definition.find({}, (err, definitions) => {
    if (err) next(err);
    let assigns = {
      title: "Definition",
      breadcrumb: [
        {
          href: "/",
          pageName: "Index"
        },
        {
          href: "/definition",
          pageName: "Definition"
        }
      ],
      definitions: definitions
    };
    res.render("definition/view", assigns);
  });
});

module.exports = router;
