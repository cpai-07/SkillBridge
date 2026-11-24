const jwt = require("jsonwebtoken");

const User = require("../models/User");
const httpError = require("../utils/httpError");
const { cleanList } = require("../utils/match");

// Create a login token that is valid for 7 days
function generateToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Return user details without the password
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

// Register a new user
async function registerUser(data) {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw httpError(409, "Email already registered");
  }

  // The password is hashed automatically in the User model
  const newUser = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    company: data.company,
  });

  return {
    token: generateToken(newUser),
    user: getPublicUserDetails(newUser),
  };
}

// Log a user in
async function loginUser(data) {
  const user = await User.findOne({ email: data.email }).select("+password");

  // We use the same message for both problems, so attackers
  // cannot find out which emails are registered
  if (!user) {
    throw httpError(401, "Incorrect email or password");
  }

  const isPasswordCorrect = await user.matchPassword(data.password);

  if (!isPasswordCorrect) {
    throw httpError(401, "Incorrect email or password");
  }

  return {
    token: generateToken(user),
    user: getPublicUserDetails(user),
  };
}

// Update the profile of the logged-in user
async function updateProfile(user, data) {
  if (data.name !== undefined) {
    user.name = data.name;
  }

  if (data.headline !== undefined) {
    user.headline = data.headline;
  }

  if (data.bio !== undefined) {
    user.bio = data.bio;
  }

  // Only employers can update the company name
  if (data.company !== undefined && user.role === "employer") {
    user.company = data.company;
  }

  // Only candidates can update skills
  if (data.skills !== undefined && user.role === "candidate") {
    user.skills = cleanList(data.skills);
  }

  await user.save();

  return getPublicUserDetails(user);
}

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  getPublicUserDetails,
};
