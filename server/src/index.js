// Starts the server. The Express app itself is in app.js,
// which lets our tests use the app without starting a real server.

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

// Stop early with a clear message if important settings are missing
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing MONGO_URI or JWT_SECRET. Check your .env file.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() =>
    app.listen(PORT, () => console.log(`API running on port ${PORT}`)),
  )
  .catch((error) => {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  });
