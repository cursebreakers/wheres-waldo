// MongoDB Controller - mongo.js

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const gameSchema = new mongoose.Schema({
  game: { type: String, required: true },
  roster: [{
    username: { type: String, required: true },
    score: { type: String, required: true },
    fingerprint: {type: String, required: false }
  }],
  keys: [{
    name: { type: String, required: true },
    type: { type: String, required: true }
  }]
});

const Game = mongoose.model('Game', gameSchema, 'game');

function connectDb() {
  mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));
}

module.exports = { connectDb, Game };
