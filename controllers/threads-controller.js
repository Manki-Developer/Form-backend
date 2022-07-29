const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Thread = require('../models/thread');
const User = require('../models/user');

const getThreadById = async (req, res, next) => {
    try {
        const thread = await Thread.findById(req.params.tid);

        if(!thread){
            return res.json(404).send('Thread id not found.');
        }

        res.json({thread: thread.toObject({getters: true})});
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find thread.', 500);
        return next(error);
    }
};

const getThreadsByUserId = async (req, res, next) => {
    let threads;
    try {
        threads = await Thread.find({ author: userId });
    } catch (err) {
        const error = new HttpError('Failed to fetch threads, please try again later.', 500);
        return next(error);
    }

    if (!threads || threads.length === 0) {
        return next(new HttpError('Could not find threads for the provided user id.', 404));
    }

    res.json({ threads: threads.map(thread => thread.toObject({ getters: true })) });
};

const newThread = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid input.', 422);
    }

    try {
        const { username, title, description } = req.body;
        const today = new Date();
        const createdThread = new Thread({
            username,
            title,
            description,
            createdAt: today.getDate(),
            //image,
            posts
        });

        //authentication disini pake token (user.id) yang di process lewat middleware auth.js
        const user = await User.findById(req.user.id);

        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdThread.save({ session: sess });
        user.threads.push(createdThread);
        await user.save({ session: sess });
        sess.commitTransaction();

        res.status(201).json({ thread: createdThread });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Invalid credentials, Failed to connect.');
    }
};

const editThread = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input.', 422));
    }

    const { title, description } = req.body;
    const threadId = req.params.tid;

    let thread;
    try {
        thread = await Thread.findById(threadId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not edit thread.', 500);
        return next(error);
    }

    thread.title = title;
    thread.description = description;

    try {
        await thread.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not edit thread.', 500);
        return next(error);
    }

    res.status(200).json({ thread: thread.toObject({ getters: true }) });
};

const deleteThread = async (req, res, next) => {
    const threadId = req.params.tid;

    let thread;
    try {
        thread = await Thread.findById(threadId).populate('author');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete thread.', 500);
        return next(error);
    }

    if (!thread) {
        const error = new HttpError('Could find thread for this id.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await thread.remove({ session: sess });
        thread.author.threads.pull(thread);
        await thread.author.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete thread.', 500);
        return next(error);
    }

    res.status(200).json({ message: 'Thread has been deleted.' });
};

exports.getThreadById = getThreadById;
exports.getThreadsByUserId = getThreadsByUserId;
exports.newThread = newThread;
exports.editThread = editThread;
exports.deleteThread = deleteThread;