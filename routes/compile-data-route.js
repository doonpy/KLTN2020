const express = require("express");
const router = express.Router();
const compileDataController = require("../controllers/compile-data-controller");

router.get("/", compileDataController.getLastCompile);

module.exports = router;
