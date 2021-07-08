const express = require("express");

const router = express.Router();

const Article = require("../../models/Article");

router.get("/", (req, res) => {
  Article.find({})
    .sort({
      createdOn: -1,
    })
    .limit(100)
    .exec((err, articles) => {
      if (err) return console.log(err);
      if (!articles)
        return res
          .status(404)
          .json({ success: false, message: "No articles found to review" });

      return res.status(200).json({
        message: true,
        message: "Successfully got articles to review",
        articles,
      });
    });
});

router.post("/", (req, res) => {
  const { action, articleId } = req.body;

  if (action.toLowerCase() === "accept") {
    // Article.findByIdAndUpdate(articleId, { approved: true });
    res.status(200).json({
      success: true,
      message: `Accepted article with id - ${articleId}`,
    });
  } else if (action.toLowerCase() === "reject") {
    // Article.findByIdAndDelete(articleId);
    res.status(200).json({
      success: true,
      message: `Rejected article with id - ${articleId}`,
    });
  } else {
    res.status(400).json({ success: false, message: "Unknown action type" });
  }
});

module.exports = router;
