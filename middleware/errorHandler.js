const errorHandler = (err, req, res, next) => {
  // Default error properties
  let error = {
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  };

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  // Validation error
  if (err.isJoi) {
    error.statusCode = 400;
    error.message = 'Validation Error';
    error.details = err.details.map((detail) => ({
      field: detail.context.key,
      message: detail.message,
    }));
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = 'Validation Error';
    error.details = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = 'Invalid ID format';
  }

  // Send response
  res.status(error.statusCode).json(error);
};

module.exports = errorHandler;
