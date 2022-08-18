const express = require("express");
const { check } = require("express-validator");

const postsControllers = require("../controllers/post-controller");
const auth = require("../middleware/auth");
const router = express.Router();

router.use(auth);

//Get all post
router.get("/", postsControllers.getPosts);

//Get only one post
router.get("/single/:pid", postsControllers.getPostById);

//Get all posts from one user
router.get("/user", postsControllers.getPostsByUserId);

//like a post
router.post("/like/:pid", postsControllers.likePost);

//dislike a post
router.post("/dislike/:pid", postsControllers.dislikePost);

//Create new post
router.post(
  "/",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  postsControllers.createPost
);

//Delete a post
router.delete("/:pid", postsControllers.deletePost);

module.exports = router;