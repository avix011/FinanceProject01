const FinancialRecord = require('../models/FinancialRecord');
const { NotFoundError } = require('../utils/errors');

exports.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build match stage
    const matchStage = {
      userId: req.userId,
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    // Admin can get summary for all users
    if (req.user.role.name === 'admin' && req.query.userId) {
      delete matchStage.userId;
      matchStage.userId = req.query.userId;
    } else if (req.user.role.name === 'admin') {
      delete matchStage.userId;
    }

    const summary = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          recordCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: { $round: ['$totalIncome', 2] },
          totalExpense: { $round: ['$totalExpense', 2] },
          netBalance: {
            $round: [{ $subtract: ['$totalIncome', '$totalExpense'] }, 2],
          },
          recordCount: 1,
        },
      },
    ]);

    const result = summary.length > 0
      ? summary[0]
      : {
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          recordCount: 0,
        };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    const matchStage = {
      userId: req.userId,
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    if (type) matchStage.type = type;

    if (req.user.role.name === 'admin' && req.query.userId) {
      delete matchStage.userId;
      matchStage.userId = req.query.userId;
    } else if (req.user.role.name === 'admin') {
      delete matchStage.userId;
    }

    const breakdown = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          type: { $first: '$type' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          type: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const matchStage = {
      userId: req.userId,
    };

    if (req.user.role.name === 'admin' && req.query.userId) {
      delete matchStage.userId;
      matchStage.userId = req.query.userId;
    } else if (req.user.role.name === 'admin') {
      delete matchStage.userId;
    }

    const recent = await FinancialRecord.find(matchStage)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName email')
      .lean();

    res.json({
      success: true,
      data: recent,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const matchStage = {
      userId: req.userId,
      date: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
      },
    };

    if (req.user.role.name === 'admin' && req.query.userId) {
      delete matchStage.userId;
      matchStage.userId = req.query.userId;
    } else if (req.user.role.name === 'admin') {
      delete matchStage.userId;
    }

    const trends = await FinancialRecord.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          type: '$_id.type',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

// New combined insights endpoint
exports.getInsights = async (req, res, next) => {
  try {
    // Build shared base match stage
    const { startDate, endDate, months = 6 } = req.query;
    const baseMatch = {};

    if (req.user.role.name !== 'admin') {
      baseMatch.userId = req.userId;
    } else if (req.query.userId) {
      baseMatch.userId = req.query.userId;
    }

    if (startDate || endDate) {
      baseMatch.date = {};
      if (startDate) baseMatch.date.$gte = new Date(startDate);
      if (endDate) baseMatch.date.$lte = new Date(endDate);
    }

    const summaryAgg = [
      { $match: baseMatch },
      { $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          recordCount: { $sum: 1 },
        }
      },
      { $project: {
          _id: 0,
          totalIncome: { $round: ['$totalIncome', 2] },
          totalExpense: { $round: ['$totalExpense', 2] },
          netBalance: { $round: [{ $subtract: ['$totalIncome', '$totalExpense'] }, 2] },
          recordCount: 1,
        }
      },
    ];

    const categoryAgg = [
      { $match: baseMatch },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 }, type: { $first: '$type' } } },
      { $project: { _id: 0, category: '$_id', total: { $round: ['$total', 2] }, count: 1, type: 1 } },
      { $sort: { total: -1 } },
    ];

    const rangeDate = new Date();
    rangeDate.setMonth(rangeDate.getMonth() - Number(months));

    const trendMatch = { ...baseMatch, date: { $gte: rangeDate } };

    const trendAgg = [
      { $match: trendMatch },
      { $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', type: '$_id.type', total: { $round: ['$total', 2] }, count: 1 } },
    ];

    const [summaryResult] = await FinancialRecord.aggregate(summaryAgg);
    const categoryBreakdown = await FinancialRecord.aggregate(categoryAgg);
    const monthlyTrends = await FinancialRecord.aggregate(trendAgg);

    res.json({
      success: true,
      data: {
        summary: summaryResult || { totalIncome: 0, totalExpense: 0, netBalance: 0, recordCount: 0 },
        categoryBreakdown,
        monthlyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};
