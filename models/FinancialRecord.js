const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type must be income or expense'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'salary',
        'freelance',
        'investment',
        'food',
        'transportation',
        'utilities',
        'entertainment',
        'health',
        'education',
        'shopping',
        'other',
      ],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    description: String,
  },
  { timestamps: true }
);

// Index for efficient queries
financialRecordSchema.index({ userId: 1, date: -1 });
financialRecordSchema.index({ userId: 1, type: 1 });
financialRecordSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
