const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postlikeSchema = new Schema({
  post: { type: mongoose.Types.ObjectId, ref: 'Post' },
  user: { type: mongoose.Types.ObjectId, ref: 'User' },
  like: {type: Boolean},
  dislike: {type: Boolean},
});

module.exports = mongoose.model("PostLike", postlikeSchema);
