import express from "express";
import Community from "../models/Community.js";
import jwt from "jsonwebtoken";

const router = express.Router();

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

// Get communities
router.get("/", auth, async (req, res) => {
  const comms = await Community.find();
  res.json(comms);
});

// Create community
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const comm = await Community.create({ name, members: [req.userId] });
    res.json(comm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
