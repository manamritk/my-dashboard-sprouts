import User from "../models/User.js";      // ✅ works now
import Post from "../models/Post.js";      // ✅
import Connection from "../models/Connection.js"; // ✅
import Community from "../models/Community.js";   // ✅


const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.json({ user, token: jwt.sign({ id: user._id }, process.env.JWT_SECRET) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ user, token: jwt.sign({ id: user._id }, process.env.JWT_SECRET) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
