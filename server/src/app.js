const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");

const openApiSpec = require("./docs/openapi");
const { apiLimiter } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// We run behind a proxy (Render, Railway) in production.
// This makes the rate limiter see the real IP of each visitor.
app.set("trust proxy", 1);

// API documentation page: /api/docs
// It is placed before helmet because the docs page needs inline scripts.
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Security middleware
app.use(helmet()); // sets safe HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" })); // refuse very large request bodies
app.use(mongoSanitize()); // removes keys like $gt from requests (NoSQL injection)
app.use("/api", apiLimiter);

// Routes
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/skills", require("./routes/skills"));

// These two must always be last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
