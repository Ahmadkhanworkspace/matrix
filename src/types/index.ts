// API Response Types
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  memberType: MemberType;
  sponsorId?: string;
  totalEarnings: number;
  paidEarnings: number;
  unpaidEarnings: number;
  joinDate: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  memberType: MemberType;
  totalEarnings: number;
  paidEarnings: number;
  unpaidEarnings: number;
  joinDate: Date;
  lastLogin?: Date;
  emailVerified: boolean;
}

// Matrix Types
export interface MatrixPosition {
  id: string;
  userId: string;
  matrixLevel: number;
  positionPath: string;
  sponsorId?: string;
  status: MatrixPositionStatus;
  cycleCount: number;
  totalEarned: number;
  createdAt: Date;
  cycledAt?: Date;
}

export interface MatrixLevel {
  id: string;
  userId: string;
  matrixLevel: number;
  positionsFilled: number;
  totalPositions: number;
  status: MatrixLevelStatus;
  startDate: Date;
  completionDate?: Date;
}

export interface MatrixConfig {
  id: string;
  level: number;
  name: string;
  price: number;
  currency: string;
  matrixWidth: number;
  matrixDepth: number;
  referralBonus: number;
  matrixBonus: number;
  matchingBonus: number;
  cycleBonus: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  gatewayId: string;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: any;
  description: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  status: WithdrawalStatus;
  transactionId?: string;
  gatewayResponse?: any;
  fee: number;
  netAmount: number;
  createdAt: Date;
  processedAt?: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  balance: number;
  createdAt: Date;
}

// Bonus Types
export interface Bonus {
  id: string;
  userId: string;
  type: BonusType;
  amount: number;
  currency: string;
  matrixLevel?: number;
  positionId?: string;
  sponsorId?: string;
  description: string;
  status: BonusStatus;
  createdAt: Date;
  paidAt?: Date;
}

// Currency Types
export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  isDefault: boolean;
  exchangeRate: number;
  decimalPlaces: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  withdrawalFee: number;
  withdrawalFeeType: WithdrawalFeeType;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Gateway Types
export interface PaymentGatewayConfig {
  id: string;
  name: string;
  gateway: PaymentGateway;
  isActive: boolean;
  isTestMode: boolean;
  supportedCurrencies: string[];
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  fixedFee: number;
  config: any;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// System Config Types
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter Types
export interface UserFilters {
  status?: UserStatus;
  memberType?: MemberType;
  isActive?: boolean;
  emailVerified?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentGateway?: PaymentGateway;
  currency?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface MatrixFilters {
  matrixLevel?: number;
  status?: MatrixPositionStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

// Statistics Types
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  newUsersToday: number;
}

export interface FinancialStatistics {
  totalPayments: number;
  totalWithdrawals: number;
  totalBonuses: number;
  pendingPayments: number;
  pendingWithdrawals: number;
  totalEarnings: number;
  paidEarnings: number;
  unpaidEarnings: number;
}

export interface MatrixStatistics {
  totalPositions: number;
  activePositions: number;
  completedPositions: number;
  totalUsers: number;
  levelStats: any[];
  completionRate: number;
}

// Enums
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED'
}

export enum MemberType {
  FREE = 'FREE',
  PRO = 'PRO'
}

export enum MatrixPositionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MatrixLevelStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  COINPAYMENTS = 'COINPAYMENTS',
  NOWPAYMENTS = 'NOWPAYMENTS',
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  BINANCE = 'BINANCE',
  RAZORPAY = 'RAZORPAY',
  MERCADOPAGO = 'MERCADOPAGO',
  FLUTTERWAVE = 'FLUTTERWAVE',
  PAYSTACK = 'PAYSTACK',
  CRYPTO = 'CRYPTO',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MANUAL = 'MANUAL'
}

export enum PaymentGateway {
  COINPAYMENTS = 'COINPAYMENTS',
  NOWPAYMENTS = 'NOWPAYMENTS',
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  BINANCE = 'BINANCE',
  RAZORPAY = 'RAZORPAY',
  MERCADOPAGO = 'MERCADOPAGO',
  FLUTTERWAVE = 'FLUTTERWAVE',
  PAYSTACK = 'PAYSTACK',
  CRYPTO = 'CRYPTO',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  MATRIX_BONUS = 'MATRIX_BONUS',
  MATCHING_BONUS = 'MATCHING_BONUS',
  CYCLE_BONUS = 'CYCLE_BONUS',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  CURRENCY_CONVERSION = 'CURRENCY_CONVERSION'
}

export enum BonusType {
  REFERRAL = 'REFERRAL',
  MATRIX = 'MATRIX',
  MATCHING = 'MATCHING',
  CYCLE = 'CYCLE',
  LEVEL = 'LEVEL'
}

export enum BonusStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum WithdrawalFeeType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

// Socket.IO Types
export interface SocketEvents {
  'join-user-room': (userId: string) => void;
  'matrix-update': (data: any) => void;
  'payment-update': (data: any) => void;
  'matrix-updated': (data: any) => void;
  'payment-updated': (data: any) => void;
}

// Email Types
export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Cron Job Types
export interface CronJob {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Database Types
export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_VERIFICATION_SECRET: string;
  JWT_RESET_SECRET: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
  FRONTEND_URL: string;
  REDIS_URL?: string;
  LOG_LEVEL: string;
} 