const express = require("express");
const router = express.Router();
const definitionController = require("../controllers/definition-controller");

/**
 * get all definition
 */
router.get("/", definitionController.getIndex);

/**
 * add definition
 */
router.get("/add", definitionController.getAdd);

module.exports = router;
