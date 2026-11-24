// Handles routes that do not exist
function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

// One central place that turns errors into JSON responses.
// Every controller sends its errors here using next(error).
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  // Bad JSON sent by the client
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }

  // The data did not pass the Mongoose schema rules
  if (error.name === "ValidationError") {
    const firstMessage = Object.values(error.errors)[0].message;
    return res.status(400).json({ message: firstMessage });
  }

  // The ID in the URL was not in the correct format
  if (error.name === "CastError") {
    return res.status(404).json({ message: "Not found" });
  }

  // Unique index was broken (for example, applying to the same job twice)
  if (error.code === 11000) {
    return res.status(409).json({ message: "This record already exists" });
  }

  // Errors we created ourselves with httpError()
  if (error.status && error.status < 500) {
    return res.status(error.status).json({ message: error.message });
  }

  // Anything else is a real server problem.
  // We log it, but we do not show internal details to the user.
  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  res.status(500).json({ message: "Something went wrong on the server" });
}

module.exports = { notFound, errorHandler };
