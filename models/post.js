const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, required: true },
  comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
  like: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  dislike: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  creatorName: { type: String },
  creatorUsername: { type: String },
  creatorImage: { type: String },
  createdAt: { type: Date, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Post", postSchema);