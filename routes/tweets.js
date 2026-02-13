var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweets");
const User = require("../models/users");
// GET tous les tweets
router.get("/", (req, res) => {
  Tweet.find()
    .populate("author", ["username", "firstname"])
    .populate("likes", ["username"])
    .sort({ createdAt: -1 }) //trie par date
    .then((data) => {
      res.json({ result: true, tweets: data });
    });
});

//POST un tweet
router.post("/", (req, res) => {
  const { token, content } = req.body;
  if (!content || content.trim().length === 0) {
    res.json({ result: false, error: "Content cannot be empty" });
    return;
  }

  if (content.length > 280) {
    res.json({ result: false, error: "Content exceeds 280 characters" });
    return;
  }

  User.findOne({ token }).then((user) => {
    if (!user) {
      res.json({ result: false, error: "User not found" });
      return;
    }

    const newTweet = new Tweet({
      author: user._id,
      content: content,
      createdAt: new Date(),
      likes: [],
    });

    newTweet.save().then((newDoc) => {
      Tweet.findById(newDoc._id)
        .populate("author", ["username", "firstname"])
        .then((populatedTweet) => {
          res.json({ result: true, tweet: populatedTweet });
        });
    });
  });
});

router.delete('/:id', (req, res) => {
  const { token } = req.body;
  const tweetId = req.params.id;
  User.findOne({ token }).then(user => {
    if (!user) {
      res.json({ result: false, error: 'User not found' });
      return;
    }

    Tweet.findOne({ _id: tweetId, author: user._id }).then(tweet => {
      if (!tweet) {
        res.json({ result: false, error: 'Tweet not found or unauthorized' });
        return;
      }

      Tweet.deleteOne({ _id: tweetId }).then(() => {
        res.json({ result: true });
      });
    });
  });
});

module.exports = router;
