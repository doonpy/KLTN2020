var express = require("express");
var router = express.Router();
apiController = require("../controllers/api-controller");

router.get("/get-html/:hostname/:filename", apiController.getHtmls);

router.get("/definition/:definitionId",apiController.getDefinitionById);

module.exports = router;
