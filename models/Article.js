const mongoose = require("mongoose");

//user schema
let articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  coverImg: {
    type: String,
    // required: true,
  },
  category: { type: String },
  createdOn: { type: Date, default: new Date() },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
  topic: { type: String },
  approved: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
});

let Article =
  mongoose.models.article || mongoose.model("article", articleSchema);

module.exports = Article;
