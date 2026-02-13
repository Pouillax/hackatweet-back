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
//GET par hashtag
router.get("/hashtag/:hashtag", (req, res) => {
  const hashtag = req.params.hashtag;
  Tweet.find({ content: { $regex: `#${hashtag}`, $options: "i" } })
    .populate("author", ["username", "firstname"])
    .populate("likes", ["username"])
    .sort({ createdAt: -1 })
    .then((data) => {
      res.json({ result: true, tweets: data });
    });
});

//POST un tweet
router.post("/", (req, res) => {
  const authHeader = req.headers.authorization; 
  const token = authHeader?.startsWith("Porteur ")
    ? authHeader.slice(8)
    : null;

  const { content } = req.body;

  if (!token) {
    return res.json({ result: false, error: "Missing token" });
  }

  if (!content || content.trim().length === 0) {
    return res.json({ result: false, error: "Content cannot be empty" });
  }

  if (content.length > 280) {
    return res.json({ result: false, error: "Content exceeds 280 characters" });
  }

  User.findOne({ token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "User not found" });
    }

    const newTweet = new Tweet({
      author: user._id,
      content,
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


router.delete("/:id", (req, res) => {
  const { token } = req.body;
  const tweetId = req.params.id;
  User.findOne({ token }).then((user) => {
    if (!user) {
      res.json({ result: false, error: "User not found" });
      return;
    }

    Tweet.findOne({ _id: tweetId, author: user._id }).then((tweet) => {
      if (!tweet) {
        res.json({ result: false, error: "Tweet not found or unauthorized" });
        return;
      }

      Tweet.deleteOne({ _id: tweetId }).then(() => {
        res.json({ result: true });
      });
    });
  });
});

//GET hashtags avec nombre d'occurences pour compter
router.get("/trends/all", (req, res) => {
  Tweet.find().then((tweets) => {
    const hashtagCount = {};

    tweets.forEach((tweet) => {
      const hashtags = tweet.content.match(/#\w+/g);

      if (hashtags) {
        hashtags.forEach((hashtag) => {
          const lowercaseHashtag = hashtag.toLowerCase();

          if (hashtagCount[lowercaseHashtag]) {
            hashtagCount[lowercaseHashtag]++;
          } else {
            hashtagCount[lowercaseHashtag] = 1;
          }
        });
      }
    });

    const trends = Object.keys(hashtagCount)
      .map((hashtag) => ({
        hashtag: hashtag,
        count: hashtagCount[hashtag],
      }))
      .sort((a, b) => b.count - a.count);

    res.json({ result: true, trends });
  });
});

module.exports = router;
