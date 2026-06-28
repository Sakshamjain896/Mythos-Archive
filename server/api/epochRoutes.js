const express = require('express');
const router = express.Router();
const { getRomanHistory } = require('../controllers/epochControllers');

// GET /api/epochs/roman
router.get('/roman', getRomanHistory);

module.exports = router;