const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/auth-controller');
const fileUpload = require('../middleware/file-upload');
const auth = require('../middleware/auth');

const router = express.Router();

//to Register
router.post('/register', 
    [
        check('name').not().isEmpty(),
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ],
    usersControllers.register
);

//to Login
router.post('/login', usersControllers.login);

router.use(auth);

//To get all the users
router.get('/', usersControllers.getUsers);

//to update a user profile (not finished)
router.post('/update/', fileUpload.single('image'), usersControllers.update);

module.exports = router;