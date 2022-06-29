const express = require('express');

const { check } = require('express-validator');

const postsControllers = require('../controllers/posts-controller');

const router = express.Router();

router.get('/:pid', postsControllers.getPostById);

router.get('/user/:uid', postsControllers.getPostsByUserId);

router.post('/',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
    ],
    postsControllers.newPost
);

router.patch('/:pid',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    postsControllers.editPost
);

router.delete('/:pid', postsControllers.deletePost);

module.exports = router;