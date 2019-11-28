var express = require("express");
var router = express.Router();
const inputController = require("../controllers/input-controller");
const dataController = require('../controllers/data-controller');

router.get('/raw-data/:page', dataController.getAllRawData );
router.get("/", inputController.getInput);
router.post("/input", inputController.postURL);
router.get("/input", inputController.getURL);
router.post("/catalog", inputController.postCatalog);
router.get("/listpage", inputController.getListPage);
router.post("/detail", inputController.getDetailPage)
module.exports = router;
