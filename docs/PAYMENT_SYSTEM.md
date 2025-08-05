# Enhanced Payment Gateway & Currency Management System

## Overview

The new Matrix MLM system includes a comprehensive payment gateway management system that allows administrators to configure and manage multiple payment gateways directly from the admin panel. The system also includes advanced currency management with real-time exchange rates and multi-currency support.

## 🏦 Supported Payment Gateways

### 1. **CoinPayments**
- **Type**: Cryptocurrency payments
- **Supported Currencies**: BTC, ETH, LTC, USDT, and 2000+ other cryptocurrencies
- **Features**: 
  - Instant cryptocurrency payments
  - Automatic coin conversion
  - IPN (Instant Payment Notification)
  - QR code generation
- **Configuration**: Merchant ID, IPN Secret, Private/Public Keys

### 2. **NOWPayments**
- **Type**: Cryptocurrency payments
- **Supported Currencies**: 50+ cryptocurrencies
- **Features**:
  - Fixed and flexible amount payments
  - Automatic coin conversion
  - Payment status tracking
  - Webhook notifications
- **Configuration**: API Key, IPN Secret

### 3. **Stripe**
- **Type**: Traditional payment processing
- **Supported Currencies**: 135+ currencies
- **Features**:
  - Credit/debit card processing
  - Digital wallets (Apple Pay, Google Pay)
  - Subscription billing
  - Advanced fraud protection
- **Configuration**: Secret Key, Publishable Key, Webhook Secret

### 4. **PayPal**
- **Type**: Digital wallet and payment processing
- **Supported Currencies**: 25+ currencies
- **Features**:
  - PayPal account payments
  - Credit/debit card processing
  - Buy Now Pay Later options
  - International payments
- **Configuration**: Client ID, Client Secret, Mode (sandbox/live)

### 5. **Razorpay**
- **Type**: Payment gateway (India focus)
- **Supported Currencies**: INR, USD, EUR, GBP
- **Features**:
  - UPI payments
  - Net banking
  - Credit/debit cards
  - Digital wallets
- **Configuration**: Key ID, Key Secret

### 6. **MercadoPago**
- **Type**: Payment gateway (Latin America focus)
- **Supported Currencies**: ARS, BRL, CLP, COP, MXN, PEN, UYU
- **Features**:
  - Local payment methods
  - Installment payments
  - Digital wallets
- **Configuration**: Access Token, Public Key

### 7. **Flutterwave**
- **Type**: Payment gateway (Africa focus)
- **Supported Currencies**: NGN, GHS, KES, ZAR, USD, EUR, GBP
- **Features**:
  - Mobile money
  - Bank transfers
  - Card payments
  - USSD payments
- **Configuration**: Secret Key, Public Key

### 8. **Paystack**
- **Type**: Payment gateway (Nigeria focus)
- **Supported Currencies**: NGN, GHS, ZAR, USD
- **Features**:
  - Card payments
  - Bank transfers
  - USSD payments
  - Mobile money
- **Configuration**: Secret Key, Public Key

### 9. **Crypto Direct**
- **Type**: Direct cryptocurrency payments
- **Supported Currencies**: BTC, ETH, USDT, USDC, BNB, ADA, DOT, LINK
- **Features**:
  - Direct wallet-to-wallet transfers
  - Multiple blockchain support
  - Smart contract integration
- **Configuration**: Wallet Address, Private Key, Network

### 10. **Bank Transfer**
- **Type**: Manual bank transfers
- **Supported Currencies**: All fiat currencies
- **Features**:
  - Manual payment verification
  - Bank account details
  - Reference number tracking
- **Configuration**: Bank details, Account information

## 💱 Currency Management System

### Supported Currency Types

#### **Fiat Currencies**
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- CHF (Swiss Franc)
- CNY (Chinese Yuan)
- INR (Indian Rupee)
- BRL (Brazilian Real)
- MXN (Mexican Peso)
- And 150+ more...

#### **Cryptocurrencies**
- BTC (Bitcoin)
- ETH (Ethereum)
- USDT (Tether)
- USDC (USD Coin)
- BNB (Binance Coin)
- ADA (Cardano)
- DOT (Polkadot)
- LINK (Chainlink)
- LTC (Litecoin)
- XRP (Ripple)
- And 2000+ more...

### Currency Features

#### **Exchange Rate Management**
- Real-time exchange rate updates (every 6 hours)
- Automatic currency conversion
- Historical rate tracking
- Rate validation and alerts

#### **Currency Configuration**
- **Decimal Places**: Configurable precision (2 for fiat, 8 for crypto)
- **Min/Max Withdrawal**: Currency-specific limits
- **Withdrawal Fees**: Percentage or fixed amount
- **Active Status**: Enable/disable currencies
- **Default Currency**: Set system default

#### **Multi-Currency Support**
- User can choose preferred currency
- Automatic conversion for bonuses and earnings
- Currency-specific payment gateways
- Localized pricing display

## 🔧 Admin Panel Features

### Payment Gateway Management

#### **Gateway Configuration**
```typescript
// Example gateway configuration
{
  "name": "Stripe Payments",
  "gateway": "STRIPE",
  "isActive": true,
  "isTestMode": false,
  "supportedCurrencies": ["USD", "EUR", "GBP", "CAD"],
  "minAmount": 1,
  "maxAmount": 10000,
  "feePercentage": 2.9,
  "fixedFee": 0.30,
  "config": {
    "secretKey": "sk_live_...",
    "publishableKey": "pk_live_...",
    "webhookSecret": "whsec_..."
  }
}
```

#### **Gateway Operations**
- **Create/Edit**: Add new gateways or modify existing ones
- **Enable/Disable**: Toggle gateway availability
- **Test Mode**: Switch between test and live environments
- **Fee Management**: Set percentage and fixed fees
- **Currency Support**: Configure supported currencies
- **Webhook URLs**: Set up notification endpoints

#### **Gateway Statistics**
- Total transactions per gateway
- Success rates
- Transaction volumes
- Revenue generated
- Last used timestamps

### Currency Management

#### **Currency Operations**
- **Add New Currency**: Create custom currencies
- **Edit Settings**: Modify limits, fees, and rates
- **Set Default**: Choose system default currency
- **Enable/Disable**: Control currency availability
- **Update Rates**: Manual or automatic rate updates

#### **Currency Statistics**
- Transaction counts per currency
- Total volume processed
- Popular currencies ranking
- Exchange rate trends

## 📊 API Endpoints

### Payment Gateway Management

```typescript
// Get all payment gateways
GET /api/admin/payment-gateways

// Create new payment gateway
POST /api/admin/payment-gateways
{
  "name": "Gateway Name",
  "gateway": "STRIPE",
  "isActive": true,
  "supportedCurrencies": ["USD", "EUR"],
  "minAmount": 1,
  "maxAmount": 10000,
  "feePercentage": 2.9,
  "fixedFee": 0.30,
  "config": { ... }
}

// Update payment gateway
PUT /api/admin/payment-gateways/:id

// Delete payment gateway
DELETE /api/admin/payment-gateways/:id

// Toggle gateway status
POST /api/admin/payment-gateways/:id/toggle
```

### Currency Management

```typescript
// Get all currencies
GET /api/admin/currencies

// Create new currency
POST /api/admin/currencies
{
  "code": "BTC",
  "name": "Bitcoin",
  "symbol": "₿",
  "isActive": true,
  "exchangeRate": 0.000025,
  "decimalPlaces": 8,
  "minWithdrawal": 0.001,
  "maxWithdrawal": 10,
  "withdrawalFee": 0.0001,
  "withdrawalFeeType": "FIXED"
}

// Update currency
PUT /api/admin/currencies/:id

// Delete currency
DELETE /api/admin/currencies/:id

// Toggle currency status
POST /api/admin/currencies/:id/toggle

// Set default currency
POST /api/admin/currencies/:id/set-default

// Update exchange rates
POST /api/admin/currencies/exchange-rates
{
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "BTC": 0.000025
  }
}
```

## 🔄 Webhook Processing

### Webhook Security
- **Signature Verification**: All webhooks are verified using gateway-specific signatures
- **IP Whitelisting**: Restrict webhook sources to gateway IPs
- **Retry Logic**: Automatic retry for failed webhook processing
- **Timeout Handling**: Configurable timeout for webhook processing

### Webhook Endpoints
```typescript
// CoinPayments webhook
POST /api/payment/webhook/coinpayments

// NOWPayments webhook
POST /api/payment/webhook/nowpayments

// Stripe webhook
POST /api/payment/webhook/stripe

// PayPal webhook
POST /api/payment/webhook/paypal
```

## 💰 Fee Management

### Payment Gateway Fees
- **Percentage Fees**: Configurable percentage of transaction amount
- **Fixed Fees**: Fixed amount per transaction
- **Combined Fees**: Both percentage and fixed fees
- **Currency-Specific**: Different fees for different currencies

### Withdrawal Fees
- **Percentage**: Percentage of withdrawal amount
- **Fixed**: Fixed amount per withdrawal
- **Currency-Specific**: Different fees per currency
- **Tiered**: Fees based on withdrawal amount

## 🔐 Security Features

### Payment Security
- **PCI Compliance**: Secure card data handling
- **Encryption**: All sensitive data encrypted
- **Tokenization**: Card data tokenization
- **Fraud Detection**: Advanced fraud prevention

### Gateway Security
- **API Key Management**: Secure API key storage
- **Webhook Verification**: Signature-based verification
- **Rate Limiting**: Prevent abuse and attacks
- **Audit Logging**: Complete transaction logging

## 📈 Monitoring & Analytics

### Payment Analytics
- **Transaction Volume**: Daily, weekly, monthly trends
- **Success Rates**: Gateway performance metrics
- **Revenue Tracking**: Revenue by gateway and currency
- **User Behavior**: Payment method preferences

### System Monitoring
- **Gateway Health**: Real-time gateway status
- **Error Tracking**: Failed transaction monitoring
- **Performance Metrics**: Response times and throughput
- **Alert System**: Automated alerts for issues

## 🚀 Implementation Guide

### 1. **Setup Payment Gateways**
```bash
# 1. Configure environment variables
cp .env.example .env
# Edit .env with your gateway credentials

# 2. Run database migrations
npm run db:migrate

# 3. Initialize default currencies
npm run db:seed
```

### 2. **Configure Gateways via Admin Panel**
1. Access admin panel
2. Go to Payment Gateways section
3. Add your gateway configurations
4. Set supported currencies and fees
5. Enable desired gateways

### 3. **Setup Webhooks**
1. Configure webhook URLs in gateway settings
2. Set up webhook endpoints in your application
3. Test webhook processing
4. Monitor webhook logs

### 4. **Currency Configuration**
1. Add required currencies
2. Set exchange rates
3. Configure withdrawal limits
4. Set default currency

## 🔧 Advanced Configuration

### Custom Gateway Integration
```typescript
// Create custom gateway class
export class CustomGateway {
  async createPayment(data: PaymentData): Promise<PaymentResponse> {
    // Implement payment creation logic
  }
  
  async processWebhook(data: WebhookData): Promise<WebhookResponse> {
    // Implement webhook processing logic
  }
}
```

### Exchange Rate Providers
- **ExchangeRate-API**: Free tier available
- **Fixer.io**: Real-time rates
- **CurrencyLayer**: Historical data
- **Open Exchange Rates**: Multiple providers

### Webhook Customization
```typescript
// Custom webhook processing
app.post('/api/payment/webhook/custom', async (req, res) => {
  const paymentService = new PaymentGatewayService();
  await paymentService.processWebhook('custom-gateway-id', req.body);
  res.status(200).send('OK');
});
```

## 📋 Best Practices

### Security
- Never store sensitive credentials in code
- Use environment variables for all secrets
- Implement proper webhook verification
- Regular security audits

### Performance
- Cache exchange rates
- Use connection pooling
- Implement retry logic
- Monitor response times

### Reliability
- Implement fallback gateways
- Use multiple exchange rate providers
- Regular backup of payment data
- Comprehensive error handling

## 🆘 Troubleshooting

### Common Issues
1. **Webhook Failures**: Check signature verification
2. **Exchange Rate Errors**: Verify API keys and limits
3. **Gateway Timeouts**: Increase timeout settings
4. **Currency Conversion**: Check rate accuracy

### Debug Tools
- **Payment Logs**: Detailed transaction logging
- **Webhook Testing**: Test webhook endpoints
- **Gateway Status**: Real-time gateway health
- **Error Tracking**: Comprehensive error monitoring

---

This enhanced payment system provides a robust, scalable, and secure foundation for handling multiple payment methods and currencies in your Matrix MLM platform. 