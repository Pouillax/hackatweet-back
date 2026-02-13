var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var tweetsRouter = require("./routes/tweets");
var usersRouter = require("./routes/users");

var app = express();
const cors = require("cors");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/tweets", tweetsRouter)
app.use("/users", usersRouter);

module.exports = app;
