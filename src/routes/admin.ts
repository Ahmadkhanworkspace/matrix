import { Router } from 'express';
import { AdminController } from '@/controllers/AdminController';
import { verifyToken, verifyAdmin } from '@/middleware/auth';

const router = Router();
const adminController = new AdminController();

// Apply authentication and admin middleware to all routes
router.use(verifyToken);
router.use(verifyAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/activate', adminController.activateUser);
router.post('/users/:id/suspend', adminController.suspendUser);

// Matrix Management
router.get('/matrix/positions', adminController.getMatrixPositions);
router.get('/matrix/levels', adminController.getMatrixLevels);
router.post('/matrix/force-placement', adminController.forcePlacement);
router.get('/matrix/statistics', adminController.getMatrixStatistics);

// Financial Management
router.get('/transactions', adminController.getTransactions);
router.get('/withdrawals', adminController.getWithdrawals);
router.post('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminController.rejectWithdrawal);
router.get('/financial/statistics', adminController.getFinancialStatistics);

// Payment Gateway Management
router.get('/payment-gateways', adminController.getPaymentGateways);
router.post('/payment-gateways', adminController.createPaymentGateway);
router.put('/payment-gateways/:id', adminController.updatePaymentGateway);
router.delete('/payment-gateways/:id', adminController.deletePaymentGateway);
router.post('/payment-gateways/:id/toggle', adminController.togglePaymentGatewayStatus);

// Currency Management
router.get('/currencies', adminController.getCurrencies);
router.post('/currencies', adminController.createCurrency);
router.put('/currencies/:id', adminController.updateCurrency);
router.delete('/currencies/:id', adminController.deleteCurrency);
router.post('/currencies/:id/toggle', adminController.toggleCurrencyStatus);
router.post('/currencies/:id/set-default', adminController.setDefaultCurrency);
router.post('/currencies/exchange-rates', adminController.updateExchangeRates);

// System Configuration
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/matrix-config', adminController.getMatrixConfig);
router.put('/matrix-config', adminController.updateMatrixConfig);

// System Management
router.get('/system/health', adminController.getSystemHealth);
router.post('/system/backup', adminController.createBackup);
router.post('/system/maintenance', adminController.toggleMaintenance);

export default router; 