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
router.post("/add", definitionController.postAdd);

/**
 * get detail definition
 */
router.get("/detail/:id", definitionController.getDetail);

/**
 * update definition (same add)
 */
router.get("/update", definitionController.getAdd);

/**
 * delete definition
 */
router.get("/delete/:definitionId", definitionController.getDelete);
router.post("/delete", definitionController.postDelete);

module.exports = router;
