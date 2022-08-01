const { validationResult } = require('express-validator');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, username, email, password } = req.body;

    try{
        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return res
            .status(400)
            .json({ errors: [{ msg: 'User already exists' }] });
        }
        

        const createdUser = new User({
            name,
            username,
            email,
            password,
            image: null,
            threads: []
        });

        const salt = await bcrypt.genSalt(10);
        createdUser.password = await bcrypt.hash(password, salt);
        await createdUser.save();
        
        const payload = {
            user: {
              id: createdUser.id
            }
          };


        jwt.sign(
            payload, 
            'secret_token', 
            { expiresIn: '5 days' },
            (err, token) => {
              if (err) throw err;
              res.json({ token });
            }
        );
    }catch(err){
        console.error(err.message);
        res.status(500).send('Invalid credentials, Failed to connect.');
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        
        const isValid = await bcrypt.compare(password, existingUser.password);
        if (!isValid) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        const payload = {
            user: {
                id: existingUser.id
            }
        };
        
        jwt.sign(
            payload,
            'secret_token',
            { expiresIn: '5 days' },
            (err, token) => {
              if (err) throw err;
              res.json({ token });
            }
          );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Invalid credentials, Failed to connect.');
    }
};

const update = async (req, res) => {
    const {image} = req.body;
    console.log('test');
    try {
        const existingUser = await User.findOne({ email });
        
        const payload = {
            user: {
                id: existingUser.id
            }
        };
        
        jwt.sign(
            payload,
            'secret_token',
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.json(500).send({"message": req.user.id});
    }
}

exports.update = update;
exports.getUsers = getUsers;
exports.register = register;
exports.login = login;