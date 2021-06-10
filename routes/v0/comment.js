const express = require("express");

const router = express.Router();

const User = require("../../models/User");

const Comment = require("../../models/Comment");
const mongoose = require("mongoose");
const Article = require("../../models/Article");

router.post("/", (req, res) => {
  const { comment, articleId, userId } = req.body;

  if (!comment) {
    return res.status(400).json({
      success: false,
      message: "Comment cannot be empty",
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Cannot post an comment without user",
    });
  }

  if (!articleId) {
    return res.status(400).json({
      success: false,
      message: "Cannot post an comment without article",
    });
  }

  const owner = new mongoose.Types.ObjectId(userId);
  const article = new mongoose.Types.ObjectId(articleId);
  const _id = new mongoose.Types.ObjectId();
  const newComment = new Comment({ _id, comment, owner, article });

  newComment.save((err) => {
    if (err)
      return res.json(500).status({
        success: false,
        message: "Unknown error occured while posting comment.",
        err,
      });

    res.json({
      success: true,
      message: "Comment posted successfully.",
    });

    Article.updateOne(
      { _id: articleId },
      { $push: { comments: _id } },
      {},
      (err, _) => {
        if (err) console.log(err);
      }
    );
  });
});

router.get("/", (req, res) => {
  const { userId, articleId } = req.query;

  if (!articleId)
    return res
      .status(400)
      .json({ success: false, message: "articleId - is required" });

  Article.findOne({ _id: articleId })
    .select("comments")
    .populate({
      path: "comments",
      populate: { path: "owner", select: ["name", "comment", "profilePic"] },
      select: ["comment", "owner", "createdOn"],
    })
    .exec((err, { comments }) => {
      if (err)
        return res.status(400).json({
          message: false,
          message: "Could not get comments for this post",
        });
      res.json({ success: true, comments });
    });
});

module.exports = router;
