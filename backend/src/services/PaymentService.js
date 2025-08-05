const mysql = require('mysql2/promise');
const db = require('../config/database');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.gateways = {
      coinpayments: null,
      nowpayments: null
    };
    this.initializeGateways();
  }

  // Initialize payment gateways
  async initializeGateways() {
    try {
      // Get payment gateway settings from database
      const [settings] = await db.execute('SELECT * FROM adminsettings LIMIT 1');
      
      if (settings[0]) {
        const config = settings[0];
        
        // Initialize CoinPayments
        if (config.private_key && config.public_key) {
          this.gateways.coinpayments = {
            privateKey: config.private_key,
            publicKey: config.public_key,
            enabled: true
          };
        }
        
        // Initialize NOWPayments
        if (config.tron_apikey && config.tron_apisecret) {
          this.gateways.nowpayments = {
            apiKey: config.tron_apikey,
            apiSecret: config.tron_apisecret,
            enabled: true
          };
        }
      }
    } catch (error) {
      console.error('Error initializing payment gateways:', error);
    }
  }

  // Create deposit request
  async createDeposit(username, amount, currency = 'USDT', gateway = 'coinpayments') {
    try {
      // Get user information
      const [user] = await db.execute(
        'SELECT * FROM users WHERE Username = ?',
        [username]
      );
      
      if (!user[0]) {
        throw new Error('User not found');
      }
      
      // Generate unique transaction ID
      const transactionId = this.generateTransactionId();
      
      // Create deposit record
      const [result] = await db.execute(
        `INSERT INTO transaction (Username, PaymentMode, matrixid, Date) 
         VALUES (?, ?, ?, NOW())`,
        [username, gateway, 1] // Default to matrix 1
      );
      
      // Create payment request based on gateway
      let paymentData;
      
      if (gateway === 'coinpayments' && this.gateways.coinpayments?.enabled) {
        paymentData = await this.createCoinPaymentsRequest(amount, currency, transactionId);
      } else if (gateway === 'nowpayments' && this.gateways.nowpayments?.enabled) {
        paymentData = await this.createNOWPaymentsRequest(amount, currency, transactionId);
      } else {
        throw new Error('Payment gateway not available');
      }
      
      return {
        success: true,
        transactionId,
        paymentData,
        gateway
      };
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw error;
    }
  }

  // Create CoinPayments request
  async createCoinPaymentsRequest(amount, currency, transactionId) {
    const { privateKey, publicKey } = this.gateways.coinpayments;
    
    const payload = {
      amount: amount,
      currency1: currency,
      currency2: currency,
      buyer_email: 'user@example.com', // Get from user data
      item_name: 'Matrix Position',
      item_number: transactionId,
      ipn_url: `${process.env.SITE_URL}/api/payments/ipn/coinpayments`,
      success_url: `${process.env.SITE_URL}/payment/success`,
      cancel_url: `${process.env.SITE_URL}/payment/cancel`
    };
    
    // Create signature
    const signature = this.createCoinPaymentsSignature(payload, privateKey);
    
    return {
      url: 'https://www.coinpayments.net/index.php',
      method: 'POST',
      data: {
        ...payload,
        cmd: 'create_transaction',
        key: publicKey,
        format: 'json',
        version: 1,
        signature
      }
    };
  }

  // Create NOWPayments request
  async createNOWPaymentsRequest(amount, currency, transactionId) {
    const { apiKey } = this.gateways.nowpayments;
    
    const payload = {
      price_amount: amount,
      price_currency: currency.toLowerCase(),
      pay_currency: currency.toLowerCase(),
      order_id: transactionId,
      order_description: 'Matrix Position',
      ipn_callback_url: `${process.env.SITE_URL}/api/payments/ipn/nowpayments`,
      success_url: `${process.env.SITE_URL}/payment/success`,
      cancel_url: `${process.env.SITE_URL}/payment/cancel`
    };
    
    return {
      url: 'https://api.nowpayments.io/v1/payment',
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      data: payload
    };
  }

  // Create CoinPayments signature
  createCoinPaymentsSignature(payload, privateKey) {
    const queryString = Object.keys(payload)
      .sort()
      .map(key => `${key}=${payload[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha512', privateKey)
      .update(queryString)
      .digest('hex');
  }

  // Generate unique transaction ID
  generateTransactionId() {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Process IPN (Instant Payment Notification)
  async processIPN(gateway, data) {
    try {
      if (gateway === 'coinpayments') {
        return await this.processCoinPaymentsIPN(data);
      } else if (gateway === 'nowpayments') {
        return await this.processNOWPaymentsIPN(data);
      }
    } catch (error) {
      console.error(`Error processing ${gateway} IPN:`, error);
      throw error;
    }
  }

  // Process CoinPayments IPN
  async processCoinPaymentsIPN(data) {
    const { txn_id, status, currency1, amount1, item_number } = data;
    
    // Verify signature
    if (!this.verifyCoinPaymentsSignature(data)) {
      throw new Error('Invalid signature');
    }
    
    // Check if transaction already processed
    const [existing] = await db.execute(
      'SELECT * FROM transaction WHERE PaymentMode = ?',
      [`coinpayments:${txn_id}`]
    );
    
    if (existing.length > 0) {
      return { success: true, message: 'Transaction already processed' };
    }
    
    // Process payment based on status
    if (status >= 100) { // Payment confirmed
      await this.processConfirmedPayment(item_number, amount1, currency1, 'coinpayments', txn_id);
    }
    
    return { success: true };
  }

  // Process NOWPayments IPN
  async processNOWPaymentsIPN(data) {
    const { payment_id, payment_status, pay_amount, pay_currency, order_id } = data;
    
    // Check if transaction already processed
    const [existing] = await db.execute(
      'SELECT * FROM transaction WHERE PaymentMode = ?',
      [`nowpayments:${payment_id}`]
    );
    
    if (existing.length > 0) {
      return { success: true, message: 'Transaction already processed' };
    }
    
    // Process payment based on status
    if (payment_status === 'confirmed' || payment_status === 'finished') {
      await this.processConfirmedPayment(order_id, pay_amount, pay_currency, 'nowpayments', payment_id);
    }
    
    return { success: true };
  }

  // Process confirmed payment
  async processConfirmedPayment(orderId, amount, currency, gateway, gatewayTxId) {
    try {
      // Get transaction details
      const [transaction] = await db.execute(
        'SELECT * FROM transaction WHERE ID = ?',
        [orderId]
      );
      
      if (!transaction[0]) {
        throw new Error('Transaction not found');
      }
      
      const { Username, matrixid } = transaction[0];
      
      // Update transaction status
      await db.execute(
        'UPDATE transaction SET PaymentMode = ? WHERE ID = ?',
        [`${gateway}:${gatewayTxId}`, orderId]
      );
      
      // Add user to verifier queue for matrix processing
      await db.execute(
        `INSERT INTO verifier (Username, mid, Date, etype, Sponsor, processed) 
         VALUES (?, ?, NOW(), 0, ?, 0)`,
        [Username, matrixid, null] // Sponsor will be determined by matrix logic
      );
      
      // Update user balance
      await db.execute(
        `UPDATE users SET 
         Total = Total + ?, 
         Unpaid = Unpaid + ? 
         WHERE Username = ?`,
        [amount, amount, Username]
      );
      
      console.log(`Payment confirmed for ${Username}: ${amount} ${currency}`);
      
    } catch (error) {
      console.error('Error processing confirmed payment:', error);
      throw error;
    }
  }

  // Verify CoinPayments signature
  verifyCoinPaymentsSignature(data) {
    const { ipn_signature } = data;
    const { privateKey } = this.gateways.coinpayments;
    
    // Remove signature from data for verification
    const dataForVerification = { ...data };
    delete dataForVerification.ipn_signature;
    
    const expectedSignature = this.createCoinPaymentsSignature(dataForVerification, privateKey);
    return ipn_signature === expectedSignature;
  }

  // Process automatic payout
  async processAutomaticPayout(username, amount) {
    try {
      // Get user wallet address
      const [user] = await db.execute(
        'SELECT TronWallet FROM users WHERE Username = ?',
        [username]
      );
      
      if (!user[0] || !user[0].TronWallet) {
        throw new Error('No wallet address found');
      }
      
      const walletAddress = user[0].TronWallet;
      
      // Create withdrawal request
      const withdrawalId = await this.createWithdrawal(username, amount, 'USDT', walletAddress);
      
      // Process withdrawal based on available gateways
      if (this.gateways.nowpayments?.enabled) {
        return await this.processNOWPaymentsWithdrawal(withdrawalId, amount, walletAddress);
      } else if (this.gateways.coinpayments?.enabled) {
        return await this.processCoinPaymentsWithdrawal(withdrawalId, amount, walletAddress);
      }
      
      throw new Error('No payment gateway available for withdrawals');
      
    } catch (error) {
      console.error('Error processing automatic payout:', error);
      throw error;
    }
  }

  // Create withdrawal record
  async createWithdrawal(username, amount, currency, walletAddress) {
    const [result] = await db.execute(
      `INSERT INTO wtransaction (Username, PaymentMode, Amount, approved, Date) 
       VALUES (?, ?, ?, 0, NOW())`,
      [username, `pending:${walletAddress}`, amount]
    );
    
    return result.insertId;
  }

  // Process NOWPayments withdrawal
  async processNOWPaymentsWithdrawal(withdrawalId, amount, walletAddress) {
    const { apiKey } = this.gateways.nowpayments;
    
    const payload = {
      withdrawals: [{
        address: walletAddress,
        amount: amount,
        currency: 'usdt'
      }]
    };
    
    // In a real implementation, you would make an API call to NOWPayments
    // For now, we'll simulate the process
    
    // Update withdrawal status
    await db.execute(
      'UPDATE wtransaction SET PaymentMode = ?, approved = 1 WHERE ID = ?',
      [`nowpayments:simulated_${Date.now()}`, withdrawalId]
    );
    
    // Update user balance
    await db.execute(
      `UPDATE users SET 
       Unpaid = Unpaid - ?, 
       Paid = Paid + ? 
       WHERE Username = (SELECT Username FROM wtransaction WHERE ID = ?)`,
      [amount, amount, withdrawalId]
    );
    
    return { success: true, message: 'Withdrawal processed successfully' };
  }

  // Process CoinPayments withdrawal
  async processCoinPaymentsWithdrawal(withdrawalId, amount, walletAddress) {
    const { privateKey, publicKey } = this.gateways.coinpayments;
    
    // In a real implementation, you would make an API call to CoinPayments
    // For now, we'll simulate the process
    
    // Update withdrawal status
    await db.execute(
      'UPDATE wtransaction SET PaymentMode = ?, approved = 1 WHERE ID = ?',
      [`coinpayments:simulated_${Date.now()}`, withdrawalId]
    );
    
    // Update user balance
    await db.execute(
      `UPDATE users SET 
       Unpaid = Unpaid - ?, 
       Paid = Paid + ? 
       WHERE Username = (SELECT Username FROM wtransaction WHERE ID = ?)`,
      [amount, amount, withdrawalId]
    );
    
    return { success: true, message: 'Withdrawal processed successfully' };
  }

  // Get payment gateways status
  getGatewayStatus() {
    return {
      coinpayments: this.gateways.coinpayments?.enabled || false,
      nowpayments: this.gateways.nowpayments?.enabled || false
    };
  }

  // Get transaction history
  async getTransactionHistory(username, type = 'all', page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM transaction WHERE Username = ?';
    const params = [username];
    
    if (type === 'deposits') {
      query += ' AND PaymentMode LIKE "%coinpayments%" OR PaymentMode LIKE "%nowpayments%"';
    }
    
    query += ' ORDER BY Date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [transactions] = await db.execute(query, params);
    const [total] = await db.execute('SELECT COUNT(*) as count FROM transaction WHERE Username = ?', [username]);
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    };
  }

  // Get withdrawal history
  async getWithdrawalHistory(username, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const [withdrawals] = await db.execute(
      'SELECT * FROM wtransaction WHERE Username = ? ORDER BY Date DESC LIMIT ? OFFSET ?',
      [username, limit, offset]
    );
    
    const [total] = await db.execute(
      'SELECT COUNT(*) as count FROM wtransaction WHERE Username = ?',
      [username]
    );
    
    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    };
  }
}

module.exports = new PaymentService(); 