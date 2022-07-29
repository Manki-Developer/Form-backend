const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
    username: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    comment: { type: String, required: true },
    createdAt: { type: Date, required: true },
    like: { type: Integer, required: true },
    dislike: { type: Integer, required: true },
    //image: { type: String, required: false },
    //discussion: { type: String, required: true, ref: "Post" },
    thread: { type: mongoose.Types.ObjectId, required: true, ref: "Thread" },
});

module.exports = mongoose.model("Post", postSchema);