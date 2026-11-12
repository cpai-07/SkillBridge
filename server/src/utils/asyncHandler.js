// Wraps async route handlers so errors reach the Express error middleware
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
