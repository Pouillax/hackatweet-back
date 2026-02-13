const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, //foreign key pour trouver l'auteur
  content: String,        //max 280 caractères
  createdAt: Date,        // Date de création du tweet
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], // foreign key pour trouver le nombre de likes (avec .length)
});


const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;
