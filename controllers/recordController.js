const FinancialRecord = require('../models/FinancialRecord');
const { ValidationError, NotFoundError, AuthorizationError } = require('../utils/errors');
const recordValidator = require('../validators/recordValidator');

exports.createRecord = async (req, res, next) => {
  try {
    const { error, value } = recordValidator.create.validate(req.body);
    if (error) {
      const err = new ValidationError('Validation failed');
      err.isJoi = true;
      err.details = error.details;
      return next(err);
    }

    const record = new FinancialRecord({
      userId: req.userId,
      ...value,
    });

    await record.save();

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;

    // Build filter based on user role
    let filter = {};

    // Non-admin users can only see their own records
    if (req.user.role.name !== 'admin') {
      filter.userId = req.userId;
    } else if (req.query.userId) {
      // Admin can filter by specific user
      filter.userId = req.query.userId;
    }

    // Apply filters
    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const records = await FinancialRecord.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'firstName lastName email');

    const total = await FinancialRecord.countDocuments(filter);

    res.json({
      success: true,
      data: records,
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

exports.getRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await FinancialRecord.findById(id).populate('userId', 'firstName lastName email');

    if (!record) {
      return next(new NotFoundError('Financial Record'));
    }

    // Check authorization - users can only view their own records unless admin
    if (req.user.role.name !== 'admin' && record.userId._id.toString() !== req.userId.toString()) {
      return next(new AuthorizationError('You can only view your own records'));
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRecord = async (req, res, next) => {
  try {
    const { error, value } = recordValidator.update.validate(req.body);
    if (error) {
      const err = new ValidationError('Validation failed');
      err.isJoi = true;
      err.details = error.details;
      return next(err);
    }

    const { id } = req.params;

    const record = await FinancialRecord.findById(id);

    if (!record) {
      return next(new NotFoundError('Financial Record'));
    }

    // Check authorization
    if (req.user.role.name === 'analyst' && record.userId.toString() !== req.userId.toString()) {
      return next(new AuthorizationError('Analysts can only update their own records'));
    }

    if (req.user.role.name === 'viewer') {
      return next(new AuthorizationError('Viewers cannot update records'));
    }

    // Update record
    const updatedRecord = await FinancialRecord.findByIdAndUpdate(id, value, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await FinancialRecord.findById(id);

    if (!record) {
      return next(new NotFoundError('Financial Record'));
    }

    // Only admin can delete
    if (req.user.role.name !== 'admin') {
      return next(new AuthorizationError('Only admins can delete records'));
    }

    await FinancialRecord.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
