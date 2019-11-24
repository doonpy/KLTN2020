var express = require("express");
var router = express.Router();
apiController = require("../controllers/api-controller");

router.get("/get-html/:hostname/:filename", apiController.getHtmls);

module.exports = router;
