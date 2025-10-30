import express from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { verifyAdmin } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';

const router = express.Router();
const transactionController = new TransactionController();

// Apply admin authentication to all routes
router.use(verifyAdmin);

// Transaction routes
router.get('/', transactionController.getTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransaction);
router.put('/:id', 
  ValidationMiddleware.validateTransactionUpdate(),
  transactionController.updateTransaction
);
router.post('/bulk-process', 
  ValidationMiddleware.validateBulkProcess(),
  transactionController.bulkProcessTransactions
);

// Deposit routes
router.get('/deposits/list', transactionController.getDeposits);
router.put('/deposits/:id/process', 
  ValidationMiddleware.validateDepositProcess(),
  transactionController.processDeposit
);

// Withdrawal routes
router.get('/withdrawals/list', transactionController.getWithdrawals);
router.put('/withdrawals/:id/process', 
  ValidationMiddleware.validateWithdrawalProcess(),
  transactionController.processWithdrawal
);

// eWallet routes
router.get('/ewallet/list', transactionController.getEWalletTransactions);
router.post('/ewallet/create', 
  ValidationMiddleware.validateEWalletTransaction(),
  transactionController.createEWalletTransaction
);

export default router;

