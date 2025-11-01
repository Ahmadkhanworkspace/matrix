const db = require('../config/database');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

/**
 * Comprehensive Payment Gateway Service
 * Supports: CoinPayments, NOWPayments, Binance Pay
 * Features: IPN handling, auto-deposit approval, withdrawal processing
 */
class PaymentGatewayService {
  constructor() {
    this.gateways = {
      coinpayments: null,
      nowpayments: null,
      binance: null
    };
    this.initializeGateways();
  }

  /**
   * Initialize payment gateways from database settings
   */
  async initializeGateways() {
    try {
      // Try Prisma first (PostgreSQL)
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const configs = await prisma.paymentGatewayConfig.findMany({
          where: { isActive: true }
        });

        for (const config of configs) {
          const gatewayConfig = config.config;
          
          if (config.gateway === 'COINPAYMENTS') {
            this.gateways.coinpayments = {
              privateKey: gatewayConfig.privateKey || gatewayConfig.private_key,
              publicKey: gatewayConfig.publicKey || gatewayConfig.public_key,
              ipnSecret: gatewayConfig.ipnSecret || gatewayConfig.ipn_secret,
              merchantId: gatewayConfig.merchantId || gatewayConfig.merchant_id,
              enabled: true,
              isTestMode: config.isTestMode
            };
          } else if (config.gateway === 'NOWPAYMENTS') {
            this.gateways.nowpayments = {
              apiKey: gatewayConfig.apiKey || gatewayConfig.api_key,
              ipnSecret: gatewayConfig.ipnSecret || gatewayConfig.ipn_secret_key,
              enabled: true,
              isTestMode: config.isTestMode
            };
          } else if (config.gateway === 'BINANCE') {
            this.gateways.binance = {
              apiKey: gatewayConfig.apiKey || gatewayConfig.api_key,
              secretKey: gatewayConfig.secretKey || gatewayConfig.secret_key,
              merchantId: gatewayConfig.merchantId || gatewayConfig.merchant_id,
              ipnSecret: gatewayConfig.ipnSecret || gatewayConfig.ipn_secret,
              enabled: true,
              isTestMode: config.isTestMode
            };
          }
        }

        await prisma.$disconnect();
      } catch (prismaError) {
        console.log('Prisma not available, trying MySQL...');
      }

      // Fallback to MySQL
      try {
        const [settings] = await db.execute('SELECT * FROM adminsettings LIMIT 1');
        
        if (settings[0]) {
          const config = settings[0];
          
          // CoinPayments
          if (config.private_key && config.public_key) {
            this.gateways.coinpayments = {
              privateKey: config.private_key,
              publicKey: config.public_key,
              ipnSecret: config.coinpayments_ipn_secret || config.ipn_secret,
              merchantId: config.coinpayments_merchant_id,
              enabled: true,
              isTestMode: config.coinpayments_test_mode || false
            };
          }
          
          // NOWPayments
          if (config.tron_apikey || config.nowpayments_api_key) {
            this.gateways.nowpayments = {
              apiKey: config.nowpayments_api_key || config.tron_apikey,
              ipnSecret: config.nowpayments_ipn_secret || config.nowpayments_ipn_secret_key,
              enabled: true,
              isTestMode: config.nowpayments_test_mode || false
            };
          }
          
          // Binance
          if (config.binance_api_key && config.binance_secret_key) {
            this.gateways.binance = {
              apiKey: config.binance_api_key,
              secretKey: config.binance_secret_key,
              merchantId: config.binance_merchant_id,
              ipnSecret: config.binance_ipn_secret,
              enabled: true,
              isTestMode: config.binance_test_mode || false
            };
          }
        }
      } catch (mysqlError) {
        console.error('Error loading gateway config from MySQL:', mysqlError);
      }

      console.log('Payment gateways initialized:', {
        coinpayments: this.gateways.coinpayments?.enabled || false,
        nowpayments: this.gateways.nowpayments?.enabled || false,
        binance: this.gateways.binance?.enabled || false
      });
    } catch (error) {
      console.error('Error initializing payment gateways:', error);
    }
  }

  /**
   * Create deposit payment request
   */
  async createDeposit(username, amount, currency = 'USDT', gateway = 'coinpayments', metadata = {}) {
    try {
      // Get user information
      let user;
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        user = await prisma.user.findUnique({ where: { username } });
        await prisma.$disconnect();
      } catch {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ? OR Username = ?', [username, username]);
        user = users[0];
      }

      if (!user) {
        throw new Error('User not found');
      }

      const transactionId = this.generateTransactionId();
      const siteUrl = process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

      let paymentData;

      switch (gateway.toLowerCase()) {
        case 'coinpayments':
          paymentData = await this.createCoinPaymentsRequest(amount, currency, transactionId, user.email || user.Email);
          break;
        case 'nowpayments':
          paymentData = await this.createNOWPaymentsRequest(amount, currency, transactionId, metadata);
          break;
        case 'binance':
          paymentData = await this.createBinanceRequest(amount, currency, transactionId, metadata);
          break;
        default:
          throw new Error(`Unsupported gateway: ${gateway}`);
      }

      // Store transaction in database
      await this.saveTransaction({
        userId: user.id || user.ID || user.Id,
        username: username,
        amount: amount,
        currency: currency,
        gateway: gateway.toLowerCase(),
        transactionId: transactionId,
        status: 'pending',
        type: 'deposit',
        metadata: metadata
      });

      return {
        success: true,
        transactionId,
        paymentData,
        gateway: gateway.toLowerCase(),
        redirectUrl: paymentData.url || paymentData.paymentUrl
      };
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw error;
    }
  }

  /**
   * Create CoinPayments payment request
   */
  async createCoinPaymentsRequest(amount, currency, transactionId, buyerEmail) {
    const gateway = this.gateways.coinpayments;
    if (!gateway || !gateway.enabled) {
      throw new Error('CoinPayments gateway not configured');
    }

    const siteUrl = process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const payload = {
      amount: amount,
      currency1: currency,
      currency2: currency,
      buyer_email: buyerEmail || 'user@example.com',
      item_name: 'Matrix MLM Deposit',
      item_number: transactionId,
      invoice: transactionId,
      ipn_url: `${siteUrl}/api/payments/ipn/coinpayments`,
      success_url: `${siteUrl}/payment/success`,
      cancel_url: `${siteUrl}/payment/cancel`,
      custom: JSON.stringify({ transactionId, type: 'deposit' })
    };

    const signature = this.createCoinPaymentsSignature(payload, gateway.privateKey);

    return {
      url: gateway.isTestMode 
        ? 'https://www.coinpayments.net/index.php'
        : 'https://www.coinpayments.net/index.php',
      method: 'POST',
      data: {
        ...payload,
        cmd: 'create_transaction',
        key: gateway.publicKey,
        format: 'json',
        version: 1,
        signature
      },
      redirectUrl: gateway.isTestMode 
        ? `https://www.coinpayments.net/index.php?cmd=_pay&reset=1&merchant=${gateway.merchantId}&item_name=${encodeURIComponent(payload.item_name)}&amountf=${amount}&currency=${currency}&invoice=${transactionId}`
        : null
    };
  }

  /**
   * Create NOWPayments payment request
   */
  async createNOWPaymentsRequest(amount, currency, transactionId, metadata = {}) {
    const gateway = this.gateways.nowpayments;
    if (!gateway || !gateway.enabled) {
      throw new Error('NOWPayments gateway not configured');
    }

    const siteUrl = process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const apiUrl = gateway.isTestMode 
      ? 'https://api-sandbox.nowpayments.io/v1'
      : 'https://api.nowpayments.io/v1';

    const payload = {
      price_amount: amount,
      price_currency: currency.toUpperCase(),
      pay_currency: currency.toUpperCase(),
      order_id: transactionId,
      order_description: metadata.description || 'Matrix MLM Deposit',
      ipn_callback_url: `${siteUrl}/api/payments/ipn/nowpayments`,
      success_url: `${siteUrl}/payment/success?transactionId=${transactionId}`,
      cancel_url: `${siteUrl}/payment/cancel?transactionId=${transactionId}`,
      ...metadata
    };

    try {
      // Make API call to NOWPayments
      const response = await this.makeHttpRequest({
        url: `${apiUrl}/payment`,
        method: 'POST',
        headers: {
          'x-api-key': gateway.apiKey,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      return {
        url: response.payment_url || response.invoice_url,
        paymentUrl: response.payment_url || response.invoice_url,
        paymentId: response.payment_id,
        data: response
      };
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw new Error(`NOWPayments API error: ${error.message}`);
    }
  }

  /**
   * Create Binance Pay payment request
   */
  async createBinanceRequest(amount, currency, transactionId, metadata = {}) {
    const gateway = this.gateways.binance;
    if (!gateway || !gateway.enabled) {
      throw new Error('Binance Pay gateway not configured');
    }

    const siteUrl = process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const apiUrl = gateway.isTestMode
      ? 'https://bpay-testnet.binanceapi.com'
      : 'https://bpay.binanceapi.com';

    const timestamp = Date.now();
    const payload = {
      env: {
        terminalType: 'WEB'
      },
      merchantTradeNo: transactionId,
      orderAmount: amount,
      currency: currency.toUpperCase(),
      goods: {
        goodsType: '02',
        goodsCategory: 'D000',
        referenceGoodsId: transactionId,
        goodsName: metadata.description || 'Matrix MLM Deposit'
      },
      returnUrl: `${siteUrl}/payment/success?transactionId=${transactionId}`,
      cancelUrl: `${siteUrl}/payment/cancel?transactionId=${transactionId}`
    };

    try {
      const signature = this.createBinanceSignature(JSON.stringify(payload), gateway.secretKey, timestamp);
      
      const response = await this.makeHttpRequest({
        url: `${apiUrl}/binancepay/openapi/v2/order`,
        method: 'POST',
        headers: {
          'BinancePay-Timestamp': timestamp.toString(),
          'BinancePay-Nonce': this.generateNonce(),
          'BinancePay-Certificate-SN': gateway.apiKey,
          'BinancePay-Signature': signature,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      return {
        url: response.data?.checkoutUrl || response.checkoutUrl,
        paymentUrl: response.data?.checkoutUrl || response.checkoutUrl,
        prepayId: response.data?.prepayId,
        data: response
      };
    } catch (error) {
      console.error('Binance Pay API error:', error);
      throw new Error(`Binance Pay API error: ${error.message}`);
    }
  }

  /**
   * Process IPN (Instant Payment Notification) for auto-approval
   */
  async processIPN(gateway, data, headers = {}) {
    try {
      console.log(`Processing IPN for ${gateway}:`, data);

      let result;
      switch (gateway.toLowerCase()) {
        case 'coinpayments':
          result = await this.processCoinPaymentsIPN(data);
          break;
        case 'nowpayments':
          result = await this.processNOWPaymentsIPN(data, headers);
          break;
        case 'binance':
          result = await this.processBinanceIPN(data, headers);
          break;
        default:
          throw new Error(`Unsupported gateway: ${gateway}`);
      }

      return result;
    } catch (error) {
      console.error(`Error processing ${gateway} IPN:`, error);
      throw error;
    }
  }

  /**
   * Process CoinPayments IPN with auto-deposit approval
   */
  async processCoinPaymentsIPN(data) {
    const gateway = this.gateways.coinpayments;
    if (!gateway) {
      throw new Error('CoinPayments not configured');
    }

    // Verify signature
    if (!this.verifyCoinPaymentsSignature(data, gateway.privateKey)) {
      throw new Error('Invalid CoinPayments signature');
    }

    const { txn_id, status, currency1, amount1, item_number, invoice, custom } = data;
    const transactionId = invoice || item_number;

    // Check if already processed
    if (await this.isTransactionProcessed(`coinpayments:${txn_id}`)) {
      return { success: true, message: 'Transaction already processed' };
    }

    // Auto-approve deposit if status >= 100 (confirmed/complete)
    if (status >= 100) {
      await this.autoApproveDeposit({
        transactionId,
        amount: parseFloat(amount1),
        currency: currency1,
        gateway: 'coinpayments',
        gatewayTxId: txn_id,
        status: status >= 100 ? 'completed' : 'pending'
      });
    }

    return { success: true, message: 'IPN processed successfully' };
  }

  /**
   * Process NOWPayments IPN with auto-deposit approval
   */
  async processNOWPaymentsIPN(data, headers = {}) {
    const gateway = this.gateways.nowpayments;
    if (!gateway) {
      throw new Error('NOWPayments not configured');
    }

    // Verify signature if IPN secret is configured
    if (gateway.ipnSecret) {
      const signature = headers['x-nowpayments-sig'] || headers['x-nowpayments-signature'];
      if (!this.verifyNOWPaymentsSignature(data, gateway.ipnSecret, signature)) {
        throw new Error('Invalid NOWPayments signature');
      }
    }

    const { payment_id, payment_status, pay_amount, pay_currency, order_id, invoice_id } = data;
    const transactionId = order_id || invoice_id;

    // Check if already processed
    if (await this.isTransactionProcessed(`nowpayments:${payment_id}`)) {
      return { success: true, message: 'Transaction already processed' };
    }

    // Auto-approve deposit if status is confirmed or finished
    if (payment_status === 'confirmed' || payment_status === 'finished' || payment_status === 'confirmed') {
      await this.autoApproveDeposit({
        transactionId,
        amount: parseFloat(pay_amount),
        currency: pay_currency,
        gateway: 'nowpayments',
        gatewayTxId: payment_id,
        status: 'completed'
      });
    }

    return { success: true, message: 'IPN processed successfully' };
  }

  /**
   * Process Binance Pay IPN with auto-deposit approval
   */
  async processBinanceIPN(data, headers = {}) {
    const gateway = this.gateways.binance;
    if (!gateway) {
      throw new Error('Binance Pay not configured');
    }

    // Verify signature
    const timestamp = headers['binancepay-timestamp'] || headers['BinancePay-Timestamp'];
    const nonce = headers['binancepay-nonce'] || headers['BinancePay-Nonce'];
    const signature = headers['binancepay-signature'] || headers['BinancePay-Signature'];
    const certSn = headers['binancepay-certificate-sn'] || headers['BinancePay-Certificate-SN'];

    if (!this.verifyBinanceSignature(data, gateway.secretKey, timestamp, nonce, signature)) {
      throw new Error('Invalid Binance Pay signature');
    }

    const { merchantTradeNo, status, orderAmount, currency } = data.data || data;

    // Check if already processed
    if (await this.isTransactionProcessed(`binance:${merchantTradeNo}`)) {
      return { success: true, message: 'Transaction already processed' };
    }

    // Auto-approve deposit if status is SUCCESS
    if (status === 'SUCCESS' || status === 'PAID') {
      await this.autoApproveDeposit({
        transactionId: merchantTradeNo,
        amount: parseFloat(orderAmount),
        currency: currency,
        gateway: 'binance',
        gatewayTxId: merchantTradeNo,
        status: 'completed'
      });
    }

    return { success: true, message: 'IPN processed successfully' };
  }

  /**
   * Auto-approve deposit and credit user account
   */
  async autoApproveDeposit({ transactionId, amount, currency, gateway, gatewayTxId, status }) {
    try {
      console.log(`Auto-approving deposit: ${transactionId} for ${amount} ${currency}`);

      // Find transaction
      let transaction;
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        transaction = await prisma.transaction.findFirst({
          where: {
            OR: [
              { transactionId: transactionId },
              { description: { contains: transactionId } }
            ],
            type: 'DEPOSIT',
            status: 'PENDING'
          },
          include: { user: true }
        });

        if (!transaction) {
          // Try MySQL format
          const [transactions] = await db.execute(
            'SELECT * FROM transaction WHERE PaymentMode LIKE ? OR PaymentMode = ? LIMIT 1',
            [`%${transactionId}%`, `pending:${transactionId}`]
          );
          
          if (transactions[0]) {
            transaction = {
              id: transactions[0].ID || transactions[0].id,
              userId: transactions[0].user_id || transactions[0].UserId,
              username: transactions[0].username || transactions[0].Username,
              amount: parseFloat(transactions[0].amount || transactions[0].Amount),
              currency: transactions[0].currency || transactions[0].Currency || currency
            };
          }
        }

        await prisma.$disconnect();
      } catch {
        // Fallback to MySQL
        const [transactions] = await db.execute(
          'SELECT * FROM transaction WHERE ID = ? OR PaymentMode LIKE ? LIMIT 1',
          [transactionId, `%${transactionId}%`]
        );
        
        if (transactions[0]) {
          transaction = {
            id: transactions[0].ID || transactions[0].id,
            userId: transactions[0].user_id || transactions[0].UserId,
            username: transactions[0].username || transactions[0].Username || transactions[0].Username,
            amount: parseFloat(transactions[0].amount || transactions[0].Amount),
            currency: transactions[0].currency || transactions[0].Currency || currency
          };
        }
      }

      if (!transaction) {
        console.error(`Transaction not found: ${transactionId}`);
        return { success: false, error: 'Transaction not found' };
      }

      const username = transaction.username || transaction.user?.username;
      const userId = transaction.userId || transaction.userId || transaction.user?.id;

      // Update transaction status
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.transaction.updateMany({
          where: {
            OR: [
              { transactionId: transactionId },
              { id: transaction.id }
            ],
            status: 'PENDING'
          },
          data: {
            status: 'COMPLETED',
            transactionId: gatewayTxId || transactionId,
            updatedAt: new Date()
          }
        });

        // Update user balance
        await prisma.user.update({
          where: { id: userId },
          data: {
            unpaidEarnings: { increment: amount },
            totalEarnings: { increment: amount }
          }
        });

        await prisma.$disconnect();
      } catch {
        // MySQL fallback
        await db.execute(
          `UPDATE transaction SET PaymentMode = ?, Status = ? WHERE ID = ?`,
          [`${gateway}:${gatewayTxId}`, 'completed', transaction.id]
        );

        await db.execute(
          `UPDATE users SET Unpaid = Unpaid + ?, Total = Total + ? WHERE username = ? OR Username = ?`,
          [amount, amount, username, username]
        );
      }

      // If transaction has matrix info, add to verifier queue
      if (transaction.matrixid || transaction.matrixLevel) {
        const matrixId = transaction.matrixid || transaction.matrixLevel || 1;
        
        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          await prisma.verifier.create({
            data: {
              username: username,
              userId: userId,
              mid: matrixId,
              date: new Date(),
              etype: transaction.etype || 1,
              sponsor: transaction.sponsor || null,
              processed: false
            }
          });

          await prisma.$disconnect();
        } catch {
          await db.execute(
            `INSERT INTO verifier (Username, mid, Date, etype, Sponsor, processed) 
             VALUES (?, ?, NOW(), ?, ?, 0)`,
            [username, matrixId, transaction.etype || 1, transaction.sponsor || null]
          );
        }
      }

      console.log(`Deposit auto-approved: ${username} - ${amount} ${currency}`);
      
      return { success: true, message: 'Deposit approved and credited' };
    } catch (error) {
      console.error('Error auto-approving deposit:', error);
      throw error;
    }
  }

  /**
   * Signature verification methods
   */
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

  verifyCoinPaymentsSignature(data, privateKey) {
    const { ipn_signature } = data;
    if (!ipn_signature) return false;

    const dataForVerification = { ...data };
    delete dataForVerification.ipn_signature;

    const expectedSignature = this.createCoinPaymentsSignature(dataForVerification, privateKey);
    return ipn_signature === expectedSignature;
  }

  verifyNOWPaymentsSignature(data, ipnSecret, signature) {
    if (!signature || !ipnSecret) return true; // Skip if not configured

    const payload = JSON.stringify(data);
    const expectedSignature = crypto
      .createHmac('sha512', ipnSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  createBinanceSignature(payload, secretKey, timestamp) {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const message = `${timestamp}\n${this.generateNonce()}\n${payloadStr}`;
    
    return crypto
      .createHmac('sha512', secretKey)
      .update(message)
      .digest('hex');
  }

  verifyBinanceSignature(data, secretKey, timestamp, nonce, signature) {
    const payloadStr = typeof data === 'string' ? data : JSON.stringify(data);
    const message = `${timestamp}\n${nonce}\n${payloadStr}`;
    
    const expectedSignature = crypto
      .createHmac('sha512', secretKey)
      .update(message)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Utility methods
   */
  generateTransactionId() {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateNonce() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async isTransactionProcessed(gatewayTxId) {
    try {
      // Try Prisma
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const exists = await prisma.transaction.findFirst({
          where: {
            transactionId: { contains: gatewayTxId },
            status: 'COMPLETED'
          }
        });

        await prisma.$disconnect();
        return !!exists;
      } catch {
        // MySQL fallback
        const [result] = await db.execute(
          'SELECT * FROM transaction WHERE PaymentMode LIKE ? OR PaymentMode = ? LIMIT 1',
          [`%${gatewayTxId}%`, gatewayTxId]
        );
        return result.length > 0;
      }
    } catch (error) {
      console.error('Error checking transaction:', error);
      return false;
    }
  }

  async saveTransaction(data) {
    try {
      // Try Prisma
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        await prisma.transaction.create({
          data: {
            userId: data.userId,
            type: 'DEPOSIT',
            amount: data.amount,
            currency: data.currency,
            status: 'PENDING',
            transactionId: data.transactionId,
            description: `Deposit via ${data.gateway}`,
            createdAt: new Date()
          }
        });

        await prisma.$disconnect();
      } catch {
        // MySQL fallback
        await db.execute(
          `INSERT INTO transaction (Username, PaymentMode, Amount, Currency, Status, Date, matrixid) 
           VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
          [
            data.username,
            `pending:${data.gateway}:${data.transactionId}`,
            data.amount,
            data.currency,
            'pending',
            data.matrixid || 1
          ]
        );
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  async makeHttpRequest({ url, method = 'GET', headers = {}, data = null }) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: headers
      };

      if (data) {
        const postData = typeof data === 'string' ? data : JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);

        const req = httpModule.request(options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            try {
              const parsed = JSON.parse(responseData);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(parsed);
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseData}`));
              }
            } catch (e) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(responseData);
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
              }
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(postData);
        req.end();
      } else {
        const req = httpModule.request(options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            try {
              const parsed = JSON.parse(responseData);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(parsed);
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseData}`));
              }
            } catch (e) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(responseData);
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
              }
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.end();
      }
    });
  }

  /**
   * Get gateway status
   */
  getGatewayStatus() {
    return {
      coinpayments: {
        enabled: this.gateways.coinpayments?.enabled || false,
        isTestMode: this.gateways.coinpayments?.isTestMode || false,
        configured: !!(this.gateways.coinpayments?.privateKey && this.gateways.coinpayments?.publicKey)
      },
      nowpayments: {
        enabled: this.gateways.nowpayments?.enabled || false,
        isTestMode: this.gateways.nowpayments?.isTestMode || false,
        configured: !!this.gateways.nowpayments?.apiKey
      },
      binance: {
        enabled: this.gateways.binance?.enabled || false,
        isTestMode: this.gateways.binance?.isTestMode || false,
        configured: !!(this.gateways.binance?.apiKey && this.gateways.binance?.secretKey)
      }
    };
  }
}

module.exports = new PaymentGatewayService();

