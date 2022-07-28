const express = require('express');
const { check } = require('express-validator');

const threadsControllers = require('../controllers/threads-controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/:tid', threadsControllers.getThreadById);

router.get('/user/:uid', threadsControllers.getThreadsByUserId);

router.use(auth);

router.post('/',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
    ],
    threadsControllers.newThread
);

router.patch('/:tid',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    threadsControllers.editThread
);

router.delete('/:tid', threadsControllers.deleteThread);

module.exports = router;