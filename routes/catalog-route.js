const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalog-controller");

router.get("/", catalogController.getIndex);

router.get("/detail/:catalogId", catalogController.getDetail);

module.exports = router;
