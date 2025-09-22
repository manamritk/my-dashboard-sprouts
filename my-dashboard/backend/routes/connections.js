import express from "express";
import Connection from "../models/Connection.js";
import jwt from "jsonwebtoken";
import fetch from "node-fetch"; // needed for geocoding API

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

// Get all connections for user
router.get("/", auth, async (req, res) => {
  const conns = await Connection.find({ user: req.userId });
  res.json(conns);
});

// Add connection
router.post("/", auth, async (req, res) => {
  try {
    const { name, location } = req.body;

    // Default coords
    let lat = 1.3521, lng = 103.8198;

    // Geocode using OpenStreetMap Nominatim
    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const data = await geo.json();
      if (data && data[0]) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      }
    } catch (err) {
      console.warn("Geocoding failed, using default coords");
    }

    const conn = await Connection.create({ name, location, lat, lng, user: req.userId });
    res.json(conn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
