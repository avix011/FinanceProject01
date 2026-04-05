const User = require('../models/User');
const Role = require('../models/Role');
const { ValidationError, NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { status, role, limit = 50, page = 1 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) filter.role = roleDoc._id;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .populate('role', 'name description')
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate('role', 'name description').select('-password');

    if (!user) {
      return next(new NotFoundError('User'));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    // Validate input
    const allowedFields = ['firstName', 'lastName', 'email'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return next(new ValidationError('No valid fields to update'));
    }

    // Check if email is being updated to an existing email
    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser && existingUser._id.toString() !== id) {
        return next(new ConflictError('Email already in use'));
      }
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('role', 'name description')
      .select('-password');

    if (!user) {
      return next(new NotFoundError('User'));
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleName } = req.body;

    if (!roleName) {
      return next(new ValidationError('Role name is required'));
    }

    const role = await Role.findOne({ name: roleName });

    if (!role) {
      return next(new NotFoundError('Role'));
    }

    // Prevent changing own role to non-admin if they are admin
    if (id === req.user._id.toString() && roleName !== 'admin') {
      return next(new AuthorizationError('You cannot demote your own admin role'));
    }

    const user = await User.findByIdAndUpdate(id, { role: role._id }, { returnDocument: 'after' })
      .populate('role', 'name description')
      .select('-password');

    if (!user) {
      return next(new NotFoundError('User'));
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent disabling own account
    if (id === req.user._id.toString()) {
      return next(new AuthorizationError('You cannot deactivate your own account'));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new NotFoundError('User'));
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    await user.populate('role', 'name description');

    res.json({
      success: true,
      message: `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (id === req.user._id.toString()) {
      return next(new AuthorizationError('You cannot delete your own account'));
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new NotFoundError('User'));
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
