import Joi from 'joi';

// User Registration Schema
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be at most 30 characters long',
      'any.required': 'Username is required'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must be at most 50 characters long',
      'any.required': 'First name is required'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must be at most 50 characters long',
      'any.required': 'Last name is required'
    }),
  sponsorId: Joi.string()
    .optional()
    .messages({
      'string.base': 'Sponsor ID must be a string'
    })
});

// User Login Schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Password Reset Schema
export const passwordResetSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
});

// Forgot Password Schema
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Resend Verification Schema
export const resendVerificationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// User Profile Update Schema
export const userProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must be at most 50 characters long'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must be at most 50 characters long'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    })
});

// Password Change Schema
export const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    })
});

// Payment Schema
export const paymentSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .min(10)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive',
      'number.min': 'Amount must be at least $10',
      'any.required': 'Amount is required'
    }),
  currency: Joi.string()
    .valid('USD', 'EUR', 'BTC', 'ETH', 'USDT')
    .default('USD')
    .messages({
      'any.only': 'Currency must be USD, EUR, BTC, ETH, or USDT'
    }),
  paymentMethod: Joi.string()
    .valid('COINPAYMENTS', 'NOWPAYMENTS', 'STRIPE', 'PAYPAL', 'CRYPTO')
    .required()
    .messages({
      'any.only': 'Payment method must be COINPAYMENTS, NOWPAYMENTS, STRIPE, PAYPAL, or CRYPTO',
      'any.required': 'Payment method is required'
    }),
  gatewayId: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Gateway ID must be a string',
      'any.required': 'Gateway ID is required'
    }),
  description: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Description must be at most 200 characters long'
    })
});

// Withdrawal Schema
export const withdrawalSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .min(10)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive',
      'number.min': 'Amount must be at least $10',
      'any.required': 'Amount is required'
    }),
  currency: Joi.string()
    .valid('USD', 'EUR', 'BTC', 'ETH', 'USDT')
    .default('USD')
    .messages({
      'any.only': 'Currency must be USD, EUR, BTC, ETH, or USDT'
    }),
  walletAddress: Joi.string()
    .min(26)
    .max(100)
    .required()
    .messages({
      'string.min': 'Wallet address must be at least 26 characters long',
      'string.max': 'Wallet address must be at most 100 characters long',
      'any.required': 'Wallet address is required'
    })
});

// Matrix Position Schema
export const matrixPositionSchema = Joi.object({
  matrixLevel: Joi.number()
    .integer()
    .min(1)
    .max(15)
    .required()
    .messages({
      'number.base': 'Matrix level must be a number',
      'number.integer': 'Matrix level must be an integer',
      'number.min': 'Matrix level must be at least 1',
      'number.max': 'Matrix level must be at most 15',
      'any.required': 'Matrix level is required'
    }),
  sponsorId: Joi.string()
    .optional()
    .messages({
      'string.base': 'Sponsor ID must be a string'
    })
});

// Admin User Update Schema
export const adminUserUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED')
    .optional()
    .messages({
      'any.only': 'Status must be PENDING, ACTIVE, SUSPENDED, or BANNED'
    }),
  memberType: Joi.string()
    .valid('FREE', 'PRO')
    .optional()
    .messages({
      'any.only': 'Member type must be FREE or PRO'
    }),
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Is active must be a boolean'
    }),
  emailVerified: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Email verified must be a boolean'
    })
});

// Matrix Config Schema
export const matrixConfigSchema = Joi.object({
  level: Joi.number()
    .integer()
    .min(1)
    .max(15)
    .required()
    .messages({
      'number.base': 'Level must be a number',
      'number.integer': 'Level must be an integer',
      'number.min': 'Level must be at least 1',
      'number.max': 'Level must be at most 15',
      'any.required': 'Level is required'
    }),
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name must be at most 50 characters long',
      'any.required': 'Name is required'
    }),
  price: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be positive',
      'any.required': 'Price is required'
    }),
  currency: Joi.string()
    .valid('USD', 'EUR', 'BTC', 'ETH', 'USDT')
    .default('USD')
    .messages({
      'any.only': 'Currency must be USD, EUR, BTC, ETH, or USDT'
    }),
  matrixWidth: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .default(2)
    .messages({
      'number.base': 'Matrix width must be a number',
      'number.integer': 'Matrix width must be an integer',
      'number.min': 'Matrix width must be at least 1',
      'number.max': 'Matrix width must be at most 10'
    }),
  matrixDepth: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(8)
    .messages({
      'number.base': 'Matrix depth must be a number',
      'number.integer': 'Matrix depth must be an integer',
      'number.min': 'Matrix depth must be at least 1',
      'number.max': 'Matrix depth must be at most 20'
    }),
  referralBonus: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.base': 'Referral bonus must be a number',
      'number.min': 'Referral bonus must be at least 0',
      'number.max': 'Referral bonus must be at most 100'
    }),
  matrixBonus: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Matrix bonus must be a number',
      'number.min': 'Matrix bonus must be at least 0'
    }),
  matchingBonus: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.base': 'Matching bonus must be a number',
      'number.min': 'Matching bonus must be at least 0',
      'number.max': 'Matching bonus must be at most 100'
    }),
  cycleBonus: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Cycle bonus must be a number',
      'number.min': 'Cycle bonus must be at least 0'
    }),
  isActive: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Is active must be a boolean'
    })
});

// Currency Schema
export const currencySchema = Joi.object({
  code: Joi.string()
    .length(3)
    .required()
    .messages({
      'string.length': 'Currency code must be exactly 3 characters long',
      'any.required': 'Currency code is required'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Currency name must be at least 2 characters long',
      'string.max': 'Currency name must be at most 50 characters long',
      'any.required': 'Currency name is required'
    }),
  symbol: Joi.string()
    .min(1)
    .max(5)
    .required()
    .messages({
      'string.min': 'Currency symbol must be at least 1 character long',
      'string.max': 'Currency symbol must be at most 5 characters long',
      'any.required': 'Currency symbol is required'
    }),
  exchangeRate: Joi.number()
    .positive()
    .default(1.0)
    .messages({
      'number.base': 'Exchange rate must be a number',
      'number.positive': 'Exchange rate must be positive'
    }),
  decimalPlaces: Joi.number()
    .integer()
    .min(0)
    .max(8)
    .default(2)
    .messages({
      'number.base': 'Decimal places must be a number',
      'number.integer': 'Decimal places must be an integer',
      'number.min': 'Decimal places must be at least 0',
      'number.max': 'Decimal places must be at most 8'
    }),
  minWithdrawal: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Minimum withdrawal must be a number',
      'number.min': 'Minimum withdrawal must be at least 0'
    }),
  maxWithdrawal: Joi.number()
    .positive()
    .default(10000)
    .messages({
      'number.base': 'Maximum withdrawal must be a number',
      'number.positive': 'Maximum withdrawal must be positive'
    }),
  withdrawalFee: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.base': 'Withdrawal fee must be a number',
      'number.min': 'Withdrawal fee must be at least 0',
      'number.max': 'Withdrawal fee must be at most 100'
    }),
  withdrawalFeeType: Joi.string()
    .valid('PERCENTAGE', 'FIXED')
    .default('PERCENTAGE')
    .messages({
      'any.only': 'Withdrawal fee type must be PERCENTAGE or FIXED'
    }),
  isActive: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Is active must be a boolean'
    }),
  isDefault: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Is default must be a boolean'
    })
});

// Pagination Schema
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must be at most 100'
    }),
  sortBy: Joi.string()
    .optional()
    .messages({
      'string.base': 'Sort by must be a string'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be asc or desc'
    })
});

// Search Schema
export const searchSchema = Joi.object({
  search: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Search term must be at least 2 characters long',
      'string.max': 'Search term must be at most 100 characters long'
    })
});

// Date Range Schema
export const dateRangeSchema = Joi.object({
  dateFrom: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date from must be a valid date'
    }),
  dateTo: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date to must be a valid date'
    })
});

// Amount Range Schema
export const amountRangeSchema = Joi.object({
  minAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum amount must be a number',
      'number.min': 'Minimum amount must be at least 0'
    }),
  maxAmount: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Maximum amount must be a number',
      'number.positive': 'Maximum amount must be positive'
    })
}); 