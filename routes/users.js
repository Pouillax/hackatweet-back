var express = require("express");
var router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

/* POST nouvel utilisateur (signup)*/
router.post("/", (req, res) => {
  if (!checkBody(req.body, ["firstname", "username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 12);
      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32),
      });
      newUser.save().then((userData) => {
        res.json({
          result: true,
          token: userData.token,
          firstname: userData.firstname,
          username: userData.username,
        });
      });
    } else {
      res.json({ result: false, error: "User already exists" });
    }
  });
});

//POST signin
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        firstname: data.firstname,
        username: data.username,
      });
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});

module.exports = router;
