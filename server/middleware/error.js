exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

// Central error handler: every thrown error ends up here
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'CastError') { status = 404; message = 'Resource not found'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.code === 11000) { status = 409; message = 'That email is already registered'; }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
