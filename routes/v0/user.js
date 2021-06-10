const express = require("express");

const router = express.Router();

const User = require("../../models/User");
const Article = require("../../models/Article");
const mongoose = require("mongoose");
const removePass = require("../../utils/prod-util/removePass");

router.get("/", (req, res) => {
  const { userId, all } = req.query;

  if (!userId)
    return res
      .status(400)
      .json({ success: false, message: "userId is important" });

  const query = { _id: userId };
  const populateArticle = all.toLocaleLowerCase() === "true";

  User.findOne(query)
    .populate(populateArticle ? "articles" : "")
    .exec((err, user) => {
      if (err) console.log(err);
      res.json({
        success: true,
        message: "Successfully fetched user info",
        user: removePass(user),
      });
    });
});

router.get("/articles", (req, res) => {
  const { userId } = req.query;

  if (!userId)
    return res
      .status(400)
      .json({ success: false, message: "userId is important" });

  User.findOne({ _id: userId })
    .select("articles")
    .populate({ path: "articles", options: { sort: { createdOn: -1 } } })
    .exec((err, { articles }) => {
      if (err) return console.log(err);

      if (!articles)
        return res
          .status(404)
          .json({ success: false, message: "No articles found" });

      res.json({
        success: true,
        message: "Articles successfully fetched for the user",
        articles,
      });
    });
});

module.exports = router;
