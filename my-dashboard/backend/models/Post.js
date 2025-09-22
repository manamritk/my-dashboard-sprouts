import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check auth
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Get all posts
router.get("/", auth, async (req, res) => {
  const posts = await Post.find().populate("author", "name email").sort({ createdAt: -1 });
  res.json(posts);
});

// Create post
router.post("/", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.create({ text, author: req.userId });
    await post.populate("author", "name email");
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
