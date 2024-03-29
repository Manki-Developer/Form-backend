const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, required: true },
  creatorName: {type: String},
  creatorUsername: {type: String},
  creatorImage: {type: String},
  creator: {type: mongoose.Types.ObjectId, required: true, ref: "User" },
  postParent: { type: mongoose.Types.ObjectId, required: true, ref: "Post" },
});

module.exports = mongoose.model("Comment", commentSchema);