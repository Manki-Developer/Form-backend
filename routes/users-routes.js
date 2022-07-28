const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/auth-controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, usersControllers.getUsers);

router.post('/register', 
    [
        check('name').not().isEmpty(),
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ],
    usersControllers.register
);

router.post('/login', usersControllers.login);

module.exports = router;