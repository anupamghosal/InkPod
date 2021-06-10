const express = require("express");

const topics = require("../../config/topics");

const router = express.Router();
router.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Successfully fetched topics",
    topics,
  });
});

module.exports = router;
