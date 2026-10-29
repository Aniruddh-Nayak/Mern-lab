require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

function makeToken(user) {
  return jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/auth/signup", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must contain at least 8 characters." });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    return res.status(201).json({
      message: "Account created successfully.",
      token: makeToken(user),
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    res.json({
      message: "Login successful.",
      token: makeToken(user),
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern_signup")
  .then(() => app.listen(PORT, () => console.log(`Auth API running at http://localhost:${PORT}`)))
  .catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
