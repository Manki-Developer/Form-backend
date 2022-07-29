const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/auth-controller');
const fileUpload = require('../middleware/file-upload');
const auth = require('../middleware/auth');

const router = express.Router();


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

router.use(auth);

router.get('/', usersControllers.getUsers);

router.post('/update', fileUpload.single('image'), usersControllers.update);

module.exports = router;