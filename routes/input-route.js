var express = require("express");
var router = express.Router();
const inputController = require("../controllers/input-controller");
router.get("/", inputController.getInput);
router.post("/input", inputController.postURL);
router.get("/input", inputController.getURL);
router.post("/catalog", inputController.postCatalog);
router.get("/listpage", inputController.getListPage);
module.exports = router;
