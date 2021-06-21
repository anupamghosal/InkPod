const express = require("express");

const router = express.Router();

const User = require("../../models/User");

const Article = require("../../models/Article");
const mongoose = require("mongoose");

const imgur = require("imgur");
const fs = require("fs");
const path = require("path");

const homeDir = require("../../homeDirConfig");
const topics = require("../../config/topics");

router.post("/", async (req, res) => {
  const { title, body, userId, category } = req.body;
  const file = req.files ? req.files[0] : null;

  if (!title || !body || !category) {
    return res.status(400).json({
      success: false,
      message: "Fields cannot be empty",
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Cannot post an article without user",
    });
  }

  if (!file)
    return res.status(400).json({
      success: false,
      message: "Cannot post an article without an image",
    });

  let imageUrl = "";

  if (file)
    try {
      const filePath = path.join(homeDir, file.path);
      const response = await imgur.uploadFile(filePath);
      imageUrl = response.link;
      fs.unlinkSync(filePath);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

  try {
    const owner = new mongoose.Types.ObjectId(userId);
    const _id = new mongoose.Types.ObjectId();
    const newArticle = new Article({
      _id,
      title,
      body,
      owner,
      category,
      coverImg: imageUrl,
    });

    console.log("check 1");

    newArticle.save((err) => {
      if (err)
        return res.json(500).status({
          success: false,
          message: "Unknown error occured while saving article.",
          err,
        });
      console.log("check 2");

      User.updateOne(
        { _id: userId },
        { $push: { articles: _id } },
        {},
        (err, _) => {
          if (err) console.log({ ERROR111: err });
        }
      );
    });

    console.log("check 3");

    return res.json({
      success: true,
      message: "Article saved successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unknown error occured while saving article.",
    });
  }
});

router.get("/", (req, res) => {
  const { type, category } = req.query;
  let query = {};
  if (type && type !== "global") query = { m: 1 };
  if (category && topics.filter((topic) => topic.value == category))
    query = { ...{ category }, ...query };

  Article.find(query)
    .limit(100)
    .populate("owner", ["name", "_id"])
    .sort({ createdOn: -1 })
    .exec((err, articles) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Could not get posts. Please try again later.",
        });

      if (!articles)
        return res.status(404).json({
          success: false,
          message: "No articles was found.",
        });

      return res.json({
        success: true,
        message: "Successfully fetched articles",
        articles,
      });
    });
});

router.put("/", (req, res) => {
  const { eventType, userId, articleId } = req.body;

  const events = ["like", "dislike", "unlike", "undislike"];

  if (!eventType) {
    return res.status(400).json({
      success: false,
      message: "Missing eventType - " + events.toString(),
    });
  }

  const event = eventType.toLowerCase();

  if (!events.includes(event)) {
    return res.status(400).json({
      success: false,
      message: "eventType did not match - " + events.toString(),
    });
  } else {
    const user = new mongoose.Types.ObjectId(userId);

    let updateStatement = {};

    if (event === "like")
      updateStatement = {
        $push: { likes: user },
        $pull: { dislikes: user },
      };
    if (event === "unlike") updateStatement = { $pull: { likes: user } };
    if (event === "dislike")
      updateStatement = {
        $push: { dislikes: user },
        $pull: { likes: user },
      };
    if (event === "undislike") updateStatement = { $pull: { dislikes: user } };

    Article.updateOne(
      { _id: articleId },
      updateStatement,
      {},
      (err, article) => {
        if (err)
          return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
          });

        return res.json({
          success: true,
          message: `Successfully ${event}d the post`,
        });
      }
    );
  }
});

router.get("/:articleId", (req, res) => {
  const { articleId } = req.params;
  Article.findOne({ _id: articleId })
    .limit(100)
    .populate("owner", ["name", "_id"])
    .exec((err, article) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Could not get post. Please try again later.",
        });

      if (!article)
        return res.status(404).json({
          success: false,
          message: "No article was found with the articleId.",
        });

      return res.json({
        success: true,
        message: "Successfully fetched article",
        article,
      });
    });
});

router.get("/bookmarked", (req, res) => {
  const { userId } = req.query;

  if (!userId)
    return res
      .status(400)
      .json({ success: false, message: "userId - is a required field" });

  User.findOne({ _id: userId })
    .select("bookmarked")
    .populate("bookmarked")
    .exec((err, articles) => {
      if (err)
        return res.status(400).json({
          success: false,
          message: "Error occurred while fetching bookmarked articles",
        });

      res.json({
        success: true,
        message: "Successfully fetched bookmarked articles",
        articles,
      });
    });
});

module.exports = router;
