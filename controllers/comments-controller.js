const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Post = require('../models/comment');
const User = require('../models/user');

const getPostById = async (req, res, next) => {
    const postId = req.params.pid;

    let post;
    try {
        post = await Post.findById(postId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find post.', 500);
        return next(error);
    }

    if (!post) {
        const error = new HttpError('Post id not found.', 404);
        return next(error);
    }

    res.json({ post: post.toObject({ getters: true }) });
};

const getPostsByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let posts;
    try {
        posts = await Post.find({ author: userId });
    } catch (err) {
        const error = new HttpError('Failed to fetch posts, please try again later.', 500);
        return next(error);
    }

    if (!posts || posts.length === 0) {
        return next(new HttpError('Could not find posts for the provided user id.', 404));
    }

    res.json({ posts: posts.map(post => post.toObject({ getters: true })) });
};

const newPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid input.', 422);
    }

    const { title, description, author } = req.body;
    const createdPost = new Post({
        title,
        description,
        //image,
        author
    });

    let user;
    try {
        user = await User.findById(author);
    } catch (err) {
        const error = new HttpError('Failed to create post, please try again.', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id.', 404);
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPost.save({ session: sess });
        user.posts.push(createdPost);
        await user.save({ session: sess });
        sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Failed to create post, please try again.', 500);
        return next(error);
    }

    res.status(201).json({ post: createdPost });
};

const editPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input.', 422));
    }

    const { title, description } = req.body;
    const postId = req.params.pid;

    let post;
    try {
        post = await Post.findById(postId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not edit post.', 500);
        return next(error);
    }

    post.title = title;
    post.description = description;

    try {
        await post.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not edit post.', 500);
        return next(error);
    }

    res.status(200).json({ post: post.toObject({ getters: true }) });
};

const deletePost = async (req, res, next) => {
    const postId = req.params.pid;

    let post;
    try {
        post = await Post.findById(postId).populate('author');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete post.', 500);
        return next(error);
    }

    if (!post) {
        const error = new HttpError('Could find post for this id.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await post.remove({ session: sess });
        post.author.posts.pull(post);
        await post.author.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete post.', 500);
        return next(error);
    }

    res.status(200).json({ message: 'Post has been deleted.' });
};

exports.getPostById = getPostById;
exports.getPostsByUserId = getPostsByUserId;
exports.newPost = newPost;
exports.editPost = editPost;
exports.deletePost = deletePost;