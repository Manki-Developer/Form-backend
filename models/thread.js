const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const threadSchema = new Schema({
    username:  { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, required: true },
    //image: { type: String, required: false },
    posts: [{ type: mongoose.Types.ObjectId, ref: 'Thread' }]
});

module.exports = mongoose.model('Thread', threadSchema);