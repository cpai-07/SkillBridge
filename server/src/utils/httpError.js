// Creates an error that also carries an HTTP status code.
// Services throw it, and the error handler in app.js turns it into a response.
//
// Example: throw httpError(404, "Job not found");

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;

  return error;
}

module.exports = httpError;
