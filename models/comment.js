const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    username: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    text: { type: String, required: true },
    createdAt: { type: Date, required: true },
});

module.exports = mongoose.model("Comment", commentSchema);