const { validationResult } = require("express-validator");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const { nextTick } = require("process");

// @route    GET api/users
// @desc     Get all user information
// @access   Private
const getUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.id }).select(
      "-password"
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route    GET api/register
// @desc     To register a user
// @access   Private
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, username, email, password } = req.body;

  try {
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }

    const today = new Date();
    const createdUser = new User({
      name,
      username,
      email,
      password,
      createdAt: today,
      posts: [],
      comments: [],
    });

    const salt = await bcrypt.genSalt(10);
    createdUser.password = await bcrypt.hash(password, salt);
    await createdUser.save();

    const payload = {
      user: {
        id: createdUser.id,
      },
    };

    jwt.sign(payload, "secret_token", { expiresIn: "5 days" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Invalid credentials, Failed to connect.");
  }
};

// @route    GET api/login
// @desc     To login a user
// @access   Private
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    const isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }
    const payload = {
      user: {
        id: existingUser.id,
      },
    };

    jwt.sign(payload, "secret_token", { expiresIn: "5 days" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Invalid credentials, Failed to connect.");
  }
};

// @route    GET api/update
// @desc     To update a user profile (not finished)
// @access   Private
const update = async (req, res, next) => {
  const { name, username, email, password, newpassword } = req.body;
  // console.log(req.file);

  try {
    const existingUser = await User.findById(req.user.id);
    const isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) {
      if (req.file !== undefined) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }
    if (
      existingUser.image !== "uploads\\images\\default-profile-icon-24.jpg" &&
      req.file !== undefined
    ) {
      fs.unlink(existingUser.image, () => {});
    }
    if (req.file !== undefined) {
      existingUser.image = req.file.path;
    }
    existingUser.name = name;
    existingUser.username = username;
    existingUser.email = email;
    if (newpassword) {
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(newpassword, salt);
    }
    
    const sess = await mongoose.startSession();
    sess.startTransaction();
    
    const imageurl = existingUser.image;
    if (existingUser.posts.length > 0) {
      existingUser.posts.map(async (posts_id) => {
        await Post.findByIdAndUpdate(posts_id, {
          creatorName: name,
          creatorUsername: username,
          creatorImage: req.file !== undefined ? req.file.path : imageurl,
        },{session: sess});
      });
    }

    if(existingUser.comments.length > 0){
      existingUser.comments.map(async (comment_id) => {
        const current_comment = await Comment.findById(comment_id);
        current_comment.creatorName = name;
        current_comment.creatorUsername = username;
        current_comment.creatorImage = req.file !== undefined ? req.file.path : imageurl;
        await current_comment.save({ session: sess });
        // await Comment.findByIdAndUpdate(comment_id, {
        //   creatorName: name,
        //   creatorUsername: username,
        //   creatorImage: req.file !== undefined ? req.file.path : imageurl,
        // },{session: sess});
      });
    }
    await existingUser.save({ session: sess });
    sess.commitTransaction();
    res.json({ user: existingUser });
  } catch (err) {
    console.error(err.message);
    res.json(500).send({ message: req.user.id });
  }
};

exports.update = update;
exports.getUsers = getUsers;
exports.register = register;
exports.login = login;
exports.getUserByUsername = getUserByUsername;
