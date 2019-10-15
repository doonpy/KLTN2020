/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const targetController = require('../../../controllers/v1/targets');

// get all target
router.get('/', targetController.getTarget);

// add target
router.post('/target', targetController.postTarget);

// update target
router.put('/target', targetController.putTarget);

// delete target
router.delete('/target', targetController.deleteTarget);

module.exports = router;
