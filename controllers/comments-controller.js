const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');

// @route    GET api/comments/post_id
// @desc     Getting all the comment inside the post (post parent id is needed in path)
// @access   Private
const getCommentByPost = async (req,res,next) => {
    try{
        const postId = req.params.post_id;
        const currentPost = await Post.findById(postId).populate('comments');
        res.json(currentPost.comments);
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Invalid credentials, Failed to connect.");
    }
}

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
        const user = await User.findById(req.user.id);
        const createdComment = new Comment({
            text,
            createdAt: today,
            creatorName: user.name,
            creatorUsername: user.username,
            creatorImage: user.image,
            creator: req.user.id,
            postParent: req.params.post_id,
        });
        
        let post_parent = await Post.findById(req.params.post_id);
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdComment.save({ session: sess });
        post_parent.comments.push(createdComment);
        await post_parent.save({ session: sess });
        user.comments.push(createdComment);
        await user.save({session : sess});
        sess.commitTransaction();

        res.json({ comments: createdComment });
    }catch(err){
        console.log(err.message);
        return res.status(500).send("Invalid credentials, Failed to connect.");
    }
};
exports.getCommentByPost = getCommentByPost;
exports.createComment = createComment;