const express = require("express");
const router = express.Router();
const extractController = require("../controllers/extract-controller");

/**
 * get all definition
 */
router.get("/", extractController.getIndex);

module.exports = router;
