const mongoose = require("mongoose");

//user schema
const commentSchema = mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  createdOn: { type: Date, default: new Date() },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "article",
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "user" },
});

let Comment =
  mongoose.models.comment || mongoose.model("comment", commentSchema);

module.exports = Comment;
