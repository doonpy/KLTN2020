const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalog-controller");

router.get("/", catalogController.getIndex);

router.get("/detail/:catalogId", catalogController.getDetail);

router.get("/add", catalogController.getAdd);
module.exports = router;
