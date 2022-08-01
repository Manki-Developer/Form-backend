const express = require("express");

const { check } = require("express-validator");

const postsControllers = require("../controllers/comments-controller");

const router = express.Router();

router.get("/:pid", postsControllers.getPostById);

router.get("/user/:uid", postsControllers.getPostsByUserId);

router.post(
  "/",
  [
    check("comment").not().isEmpty(),
    //check('description').isLength({ min: 5 }),
  ],
  postsControllers.newPost
);

router.patch(
  "/:pid",
  [
    check("comment").not().isEmpty(),
    //check('description').isLength({ min: 5 })
  ],
  postsControllers.editPost
);

router.delete("/:pid", postsControllers.deletePost);

module.exports = router;
