const Joi = require('joi');

const recordValidator = {
  create: Joi.object({
    amount: Joi.number().positive().required().messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required',
    }),
    type: Joi.string().valid('income', 'expense').required().messages({
      'any.only': 'Type must be either income or expense',
      'any.required': 'Type is required',
    }),
    category: Joi.string()
      .valid('salary', 'freelance', 'investment', 'food', 'transportation', 'utilities', 'entertainment', 'health', 'education', 'shopping', 'other')
      .required()
      .messages({
        'any.only': 'Invalid category',
        'any.required': 'Category is required',
      }),
    date: Joi.date().iso().messages({
      'date.iso': 'Date must be a valid ISO date',
    }),
    notes: Joi.string().max(500).messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
    description: Joi.string().max(500),
  }),

  update: Joi.object({
    amount: Joi.number().positive().messages({
      'number.positive': 'Amount must be greater than 0',
    }),
    type: Joi.string().valid('income', 'expense').messages({
      'any.only': 'Type must be either income or expense',
    }),
    category: Joi.string()
      .valid('salary', 'freelance', 'investment', 'food', 'transportation', 'utilities', 'entertainment', 'health', 'education', 'shopping', 'other')
      .messages({
        'any.only': 'Invalid category',
      }),
    date: Joi.date().iso().messages({
      'date.iso': 'Date must be a valid ISO date',
    }),
    notes: Joi.string().max(500).messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
  }).min(1),
};

module.exports = recordValidator;
