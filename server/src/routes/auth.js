const router = require("express").Router();

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const { protect } = require("../middleware/auth");
const { cleanList } = require("../utils/match");

// Generate JWT token
function generateToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Return user details without password
function getPublicUserDetails(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    headline: user.headline,
    bio: user.bio,
    skills: user.skills,
  };
}

// 1. Register a new user
// POST /api/auth/register

router.post("/register", async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const company = req.body.company;

    // Check required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Employers must provide a company name
    if (role === "employer" && !company) {
      return res.status(400).json({
        message: "Company name is required for employers",
      });
    }

    // Create user
    const newUser = await User.create({
      name: name,
      email: email,
      password: password,
      role: role,
      company: company,
    });

    const token = generateToken(newUser);
    const userDetails = getPublicUserDetails(newUser);

    res.status(201).json({
      token: token,
      user: userDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// 2. Login user
// POST /api/auth/login

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    const user = await User.findOne({
      email: (email || "").toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
      });
    }

    // Check password
    const isPasswordCorrect = await user.matchPassword(password || "");

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Incorrect email or password",
      });
    }

    const token = generateToken(user);
    const userDetails = getPublicUserDetails(user);

    res.json({
      token: token,
      user: userDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// 3. Get logged-in user details
// GET /api/auth/me

router.get("/me", protect, (req, res) => {
  const user = getPublicUserDetails(req.user);

  res.json({
    user: user,
  });
});

// 4. Update user profile
// PUT /api/auth/profile

router.put("/profile", protect, async (req, res) => {
  try {
    const user = req.user;

    // Update name
    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }

    // Update headline
    if (req.body.headline !== undefined) {
      user.headline = req.body.headline;
    }

    // Update bio
    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
    }

    // Only employers can update company name
    if (req.body.company !== undefined && user.role === "employer") {
      user.company = req.body.company;
    }

    // Only candidates can update skills
    if (req.body.skills !== undefined && user.role === "candidate") {
      user.skills = cleanList(req.body.skills);
    }

    // Save changes
    await user.save();

    const userDetails = getPublicUserDetails(user);

    res.json({
      user: userDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
