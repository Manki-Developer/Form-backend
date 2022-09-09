const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Post = require('../models/post');
const Postlike = require('../models/postlike');
const User = require('../models/user');
const Comment = require("../models/comment");

// @route    GET api/posts/
// @desc     Get all posts information
// @access   Private
const getPosts = async (req, res, next) => {
    try{
        const posts = await Post.find({});
        res.json(posts);
    }catch(err){
        console.log(err.message);
        return res
          .status(500)
          .send("Something went wrong, could not find thread.");
    }
}

// @route    GET api/posts/single/postId
// @desc     Get one specific Post using its ID
// @access   Private
const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.pid);

        if (!post) {
          return res.status(404).send("Thread id not found.");
        }

        res.json(post);
    } catch (err) {
        console.log(err.message);
        return res
          .status(500)
          .send("Something went wrong, could not find thread.");
    }
};

// @route    GET api/posts/user
// @desc     Get all the posts from one user (for the user profile page)
// @access   Private
// const getPostsByUserId = async (req, res, next) => {
//     try {
//         const posts = await Post.find({creator: req.user.id});

//         if (!posts || posts.length === 0) {
//           return res
//             .status(404)
//             .send("Could not find thread for the provided user id");
//         }
//         res.json(posts.map((post) => post));
//     } catch (err) {
//         console.error(err.message);
//         res
//           .status(500)
//           .send("Failed to fetch threads, please try again later.");
//     }
// };

const getPostByUsername = async (req, res, next) => {
    try {
        const posts = await Post.find({creatorUsername: req.params.id});

        if (!posts || posts.length === 0) {
          return res.json([]);
        }
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res
          .status(500)
          .send("Failed to fetch threads, please try again later.");
    }
};


// @route    POST api/posts/
// @desc     Create new post
// @access   Private
const createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid input.', 422);
    }

    try {
        const user = await User.findById(req.user.id);
        const {title, description } = req.body;
        const today = new Date();
        const createdPost = new Post({
          title,
          description,
          createdAt: today,
          comments: [],
          like: [],
          dislike:[],
          creatorName: user.name,
          creatorUsername: user.username,
          creatorImage: user.image,
          creator: req.user.id,
        });

        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPost.save({ session: sess });
        user.posts.push(createdPost);
        await user.save({ session: sess });
        sess.commitTransaction();

        res.json( createdPost );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Invalid credentials, Failed to connect.');
    }
};

// @route    DELETE api/posts/postId
// @desc     Delete a specfic posts
// @access   Private
const deletePost = async (req, res, next) => {
    try{
        let post = await Post.findById(req.params.pid).populate("creator");
        if (!post) {
          return res.status(404).send("Could not find post for this id");
        }
        const sess = await mongoose.startSession();
        sess.startTransaction();
        if (post.like.length > 0) {
            post.like.map(async (postlike_id) => {await Postlike.findById(postlike_id).deleteOne({ session: sess });});
        }

        if (post.dislike.length > 0) {
            post.dislike.map(async (postlike_id) => {
              await Postlike.findById(postlike_id).deleteOne({ session: sess });
            });
        }
        if(post.comments.length > 0){
            post.comments.map(async (comment_id) => {
              post.creator.comments.pull(comment_id);
              await Comment.findById(comment_id).deleteOne({ session: sess });
            });
        }
        await post.remove({ session: sess });
        post.creator.posts.pull(post);
        await post.creator.save({ session: sess });
        await sess.commitTransaction();

        res.json({ message: "Thread has been deleted." });
    }catch(err){
        console.log(err.message);
        res.status(500).send("Something went wrong, could not delete thread.");
    }

};

const likePost = async (req, res, next) => {
  try {
    const postId = req.params.pid;
    console.log(postId);
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("Could not find post for this id");
    }

    const postlike = await Postlike.findOne({
      post: postId,
      user: req.user.id,
    });

    const sess = await mongoose.startSession();
    sess.startTransaction();
    if (!postlike) {
      let createPostLike = new Postlike({
        post: postId,
        user: req.user.id,
        like: true,
        dislike: false,
      });
      await createPostLike.save({ session: sess });
      post.like.push(createPostLike);
      await post.save({ session: sess });
    } else if (postlike.dislike) {
      post.dislike.remove(postlike);
      postlike.like = true;
      postlike.dislike = false;
      await postlike.save({ session: sess });
      post.like.push(postlike);
      await post.save({ session: sess });
    } else {
      await postlike.remove({ session: sess });
      post.like.pull(postlike);
      await post.save({ session: sess });
    }
    await sess.commitTransaction();
    res.json(post);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something went wrong, could not like post.");
  }
};

const dislikePost = async (req, res, next) => {
  try {
    const postId = req.params.pid;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("Could not find post for this id");
    }

    const postlike = await Postlike.findOne({
      post: postId,
      user: req.user.id,
    });

    const sess = await mongoose.startSession();
    sess.startTransaction();
    if (!postlike) {
      let createPostLike = new Postlike({
        post: postId,
        user: req.user.id,
        like: false,
        dislike: true,
      });
      await createPostLike.save({ session: sess });
      post.dislike.push(createPostLike);
      await post.save({ session: sess });
    } else if (postlike.like) {
      post.like.remove(postlike);
      postlike.dislike = true;
      postlike.like = false;
      await postlike.save({ session: sess });
      post.dislike.push(postlike);
      await post.save({ session: sess });
    } else {
      await postlike.remove({ session: sess });
      post.dislike.pull(postlike);
      await post.save({ session: sess });
    }
    await sess.commitTransaction();
    res.json(post);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something went wrong, could not dislike post.");
  }
};

// exports.getPostsByUserId = getPostsByUserId;
exports.getPostById = getPostById;
exports.getPostByUsername = getPostByUsername;
exports.getPosts = getPosts;
exports.createPost = createPost;
exports.deletePost = deletePost;
exports.likePost = likePost;
exports.dislikePost = dislikePost;