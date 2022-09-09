const express = require("express");

const { check } = require("express-validator");

const commentsControllers = require("../controllers/comments-controller");
const auth = require("../middleware/auth");
const router = express.Router();

router.use(auth);

router.get("/:post_id", commentsControllers.getCommentByPost)

router.post(
  "/:post_id",
  [check("text").isLength({ min: 5 })],
  commentsControllers.createComment
);

// router.delete("/:pid", postsControllers.deletePost);

module.exports = router;
