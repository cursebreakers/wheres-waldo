// index.js - Main route controller

const express = require('express');
const router = express.Router();
const gameControl = require('./game')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Tag Your Friends:' });
});

// GET scoreboard/roster
router.get('/roster', gameControl.get_roster)

// POST scoreboard/roster
router.post('/roster', gameControl.high_score)

// POST game answers
router.post('/check', gameControl.check_guess);

module.exports = router;
