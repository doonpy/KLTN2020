/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const htmlController = require('../../controllers/v1/htmls');

/* GET home page. */
router.get('/htmls', htmlController.getHtml);

module.exports = router;
