const express = require('express');
const router = express.Router();

// @route   GET api/tickets
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('Tickets Route'));

module.exports = router;