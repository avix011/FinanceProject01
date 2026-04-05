const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { ValidationError, AuthError, ConflictError } = require('../utils/errors');
const authValidator = require('../validators/authValidator');

exports.register = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = authValidator.register.validate(req.body);
    if (error) {
      const err = new ValidationError('Validation failed');
      err.isJoi = true;
      err.details = error.details;
      return next(err);
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError('Email already registered'));
    }

    // Get default role (viewer)
    let role = await Role.findOne({ name: 'viewer' });
    if (!role) {
      await Role.seedRoles();
      role = await Role.findOne({ name: 'viewer' });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role._id,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // Populate role for response
    await user.populate('role');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = authValidator.login.validate(req.body);
    if (error) {
      const err = new ValidationError('Validation failed');
      err.isJoi = true;
      err.details = error.details;
      return next(err);
    }

    const { email, password } = value;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password').populate('role');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AuthError('Invalid email or password'));
    }

    if (user.status === 'inactive') {
      return next(new AuthError('Your account has been deactivated'));
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('role');

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
