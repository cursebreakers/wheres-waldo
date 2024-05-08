// Game Controller Module - game.js

const expressAsyncHandler = require('express-async-handler')
const mongoose = require('mongoose');

const { Game } = require('./mongo');

// POST guesses for checks against database
exports.check_guess = expressAsyncHandler(async (req, res) => {
    try {

      const { selectedName, hitboxType } = req.body;

      console.log('Request Payload:', req.body);

      const game = await Game.findById('663a915a46bc8c0fe122226e');
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }

      console.log('Game for reference:', game)

      if (!game.keys || game.keys.length === 0) {
        return res.status(400).json({ message: 'Game keys not found or empty' });
      }

      const keys = game.keys;

      const match = keys.some(key => key.type === hitboxType && key.name === selectedName);

      if (match) {
        res.status(200).json({ message: 'GOOD' });
      } else {
        res.status(400).json({ message: 'Incorrect guess' });
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET usernames and high scores
exports.get_roster = expressAsyncHandler(async (req, res) => {
    console.log('Getting scoreboard...')

    const game = await Game.findById('663a915a46bc8c0fe122226e');

    const score = game.roster;

    console.log('Scores found:', score)

    if (score) {
        res.status(200).json({ message: 'Score found', score });
      } else {
        res.status(400).json({ message: 'No scores found' });
      }
});

// POST username, fingerprint and highscore to roster
exports.high_score = expressAsyncHandler(async (req, res) => {
    try {

      const { fingerprint, username, elapsedTime } = req.body;
      console.log('Saving score:', fingerprint, username, elapsedTime )

      const game = await Game.findById('663a915a46bc8c0fe122226e');
    
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }

      let userFound = false;
        for (const user of game.roster) {
            if (user.fingerprint === fingerprint && user.username === username) {
                user.score = elapsedTime;
                userFound = true;
                break;
            }
        }

        if (!userFound) {
            game.roster.push({
                fingerprint,
                username,
                score: elapsedTime
            });
        }

        await game.save();

        res.status(200).json({ message: 'High score saved successfully' })

    } catch (error) {
      console.error('Error saving score answer:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});
