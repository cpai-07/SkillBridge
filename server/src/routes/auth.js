const router = require("express").Router();

const authController = require("../Controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const {
  validateRegister,
  validateLogin,
  validateProfile,
} = require("../middleware/validate");

// Each route reads like a sentence:
// limit attempts -> check the data -> run the controller

router.post(
  "/register",
  authLimiter,
  validateRegister,
  authController.register,
);
router.post("/login", authLimiter, validateLogin, authController.login);

router.get("/me", protect, authController.getMe);
router.put("/profile", protect, validateProfile, authController.updateProfile);

module.exports = router;
