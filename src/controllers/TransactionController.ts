import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';
import { logger } from '../utils/logger';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  /**
   * Get all transactions with filtering and pagination
   */
  public getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        userId,
        startDate,
        endDate,
        search
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string,
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string
      };

      const result = await this.transactionService.getTransactions(filters);
      
      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transactions',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get transaction by ID
   */
  public getTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const transaction = await this.transactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error('Error getting transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transaction',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Update transaction status
   */
  public updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updatedTransaction = await this.transactionService.updateTransactionStatus(
        id,
        status,
        notes
      );

      res.status(200).json({
        success: true,
        data: updatedTransaction,
        message: 'Transaction updated successfully'
      });
    } catch (error) {
      logger.error('Error updating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get deposits with filtering
   */
  public getDeposits = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        gateway,
        userId,
        startDate,
        endDate
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        gateway: gateway as string,
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string
      };

      const result = await this.transactionService.getDeposits(filters);
      
      res.status(200).json({
        success: true,
        data: result.deposits,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting deposits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve deposits',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Process deposit
   */
  public processDeposit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body; // action: 'approve' | 'reject'

      const result = await this.transactionService.processDeposit(id, action, notes);

      res.status(200).json({
        success: true,
        data: result,
        message: `Deposit ${action}d successfully`
      });
    } catch (error) {
      logger.error('Error processing deposit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process deposit',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get withdrawals with filtering
   */
  public getWithdrawals = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        userId,
        startDate,
        endDate
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string
      };

      const result = await this.transactionService.getWithdrawals(filters);
      
      res.status(200).json({
        success: true,
        data: result.withdrawals,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting withdrawals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve withdrawals',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Process withdrawal
   */
  public processWithdrawal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, notes, transactionId } = req.body; // action: 'approve' | 'reject' | 'complete'

      const result = await this.transactionService.processWithdrawal(id, action, notes, transactionId);

      res.status(200).json({
        success: true,
        data: result,
        message: `Withdrawal ${action}d successfully`
      });
    } catch (error) {
      logger.error('Error processing withdrawal:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process withdrawal',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get eWallet transactions
   */
  public getEWalletTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        userId,
        startDate,
        endDate
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string
      };

      const result = await this.transactionService.getEWalletTransactions(filters);
      
      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting eWallet transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve eWallet transactions',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Create eWallet transaction
   */
  public createEWalletTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        userId,
        type,
        amount,
        currency,
        description,
        referenceId
      } = req.body;

      const transaction = await this.transactionService.createEWalletTransaction({
        userId,
        type,
        amount,
        currency,
        description,
        referenceId
      });

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'eWallet transaction created successfully'
      });
    } catch (error) {
      logger.error('Error creating eWallet transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create eWallet transaction',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get transaction statistics
   */
  public getTransactionStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = '30d' } = req.query;
      
      const stats = await this.transactionService.getTransactionStatistics(period as string);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting transaction statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transaction statistics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Bulk process transactions
   */
  public bulkProcessTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transactionIds, action, notes } = req.body;

      const result = await this.transactionService.bulkProcessTransactions(
        transactionIds,
        action,
        notes
      );

      res.status(200).json({
        success: true,
        data: result,
        message: `${result.processed} transactions processed successfully`
      });
    } catch (error) {
      logger.error('Error bulk processing transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk process transactions',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };
}

export default TransactionController;

