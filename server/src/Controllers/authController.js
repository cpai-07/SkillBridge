const authService = require("../services/authService");

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
function getMe(req, res) {
  res.json({ user: authService.getPublicUserDetails(req.user) });
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user, req.body);

    res.json({ user: user });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe, updateProfile };
