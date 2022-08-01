const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');
const { post } = require('../routes/users-routes');

// @route    GET api/comments/cid
// @desc     Getting a comment from its id
// @access   Private
const getCommentById = async (req, res, next) => {
    try{
        const comment = await Comment.findById(req.params.cid);
        if(!comment){
            return res.status(404).send("Post id not found");
        }
        res.json({ comment: comment });
    }catch(err){
        console.log(err.message);
        return res
          .status(500)
          .send("Something went wrong, could not find thread.");
    }
};

// @route    POST api/comments/post_id
// @desc     Creating a comment inside the post (post parent id is needed in path)
// @access   Private
const createComment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid input.', 422);
    }

    try{
        const { text } = req.body;
        const today = new Date();
        const createdComment = new Comment({
            text,
            createdAt: today,
            creator: req.user.id,
            postParent: req.params.post_id,
        });
        
        let post_parent = await Post.findById(req.params.post_id);
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdComment.save({ session: sess });
        post_parent.comments.push(createdComment);
        await post_parent.save({ session: sess });
        sess.commitTransaction();

        res.json({ comment: createdComment });
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Invalid credentials, Failed to connect.");
    }
};

// const deleteComment = async (req, res, next) => {
//     const postId = req.params.pid;

//     let post;
//     try {
//         post = await Post.findById(postId).populate('author');
//     } catch (err) {
//         const error = new HttpError('Something went wrong, could not delete post.', 500);
//         return next(error);
//     }

//     if (!post) {
//         const error = new HttpError('Could find post for this id.', 404);
//         return next(error);
//     }

//     try {
//         const sess = await mongoose.startSession();
//         sess.startTransaction();
//         await post.remove({ session: sess });
//         post.author.posts.pull(post);
//         await post.author.save({ session: sess });
//         await sess.commitTransaction();
//     } catch (err) {
//         const error = new HttpError('Something went wrong, could not delete post.', 500);
//         return next(error);
//     }

//     res.status(200).json({ message: 'Post has been deleted.' });
// };

exports.getCommentById = getCommentById;
exports.createComment = createComment;