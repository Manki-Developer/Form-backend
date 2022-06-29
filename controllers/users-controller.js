const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Failed to fetch users.', 500);
        return next(error);
    }

    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input.', 422));
    }

    const { firstName, lastName, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Failed to sign up, please try again later.', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User has existed, please login instead.', 422);
        return next(error);
    }

    const createdUser = new User({
        firstName,
        lastName,
        email,
        password,
        //image,
        posts: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Failed to sign up, please try again.', 500);
        return next(error);
    }

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Failed to log up, please try again later.', 500);
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid email and password.', 401);
        return next(error);
    }

    res.json({ message: 'Login successful!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;