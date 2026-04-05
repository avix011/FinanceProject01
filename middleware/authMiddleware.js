const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthError } = require('../utils/errors');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AuthError('No token provided. Please login first'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).populate('role');

    if (!user) {
      return next(new AuthError('User not found'));
    }

    if (user.status === 'inactive') {
      return next(new AuthError('User account is inactive'));
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AuthError('Token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthError('Invalid token'));
    }
    next(error);
  }
};

module.exports = authMiddleware;
