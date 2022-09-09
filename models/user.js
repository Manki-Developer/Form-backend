const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, required: true},
  image: {
    type: String,
    default: "uploads\\images\\default-profile-icon-24.jpg",
  },
  posts: [{ type: mongoose.Types.ObjectId, ref: "Post" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);