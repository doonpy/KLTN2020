var express = require("express");
var router = express.Router();
apiController = require("../controllers/api-controller");

router.get("/htmls/html/:hostname/:filename", apiController.getHtmls);

router.post("/definition", apiController.postDefinition);

module.exports = router;