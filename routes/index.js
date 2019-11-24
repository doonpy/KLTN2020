var express = require("express");
var router = express.Router();
const indexController = require("../controllers/index-controller");

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index");
});

router.post("/crawl", indexController.postCrawl);

// router.get("/crawl", indexController.getCrawl);

router.get("/definition/:hostname", indexController.getDefinition);

// router.get("/extract/:hostname", indexController.getExtract);

module.exports = router;
