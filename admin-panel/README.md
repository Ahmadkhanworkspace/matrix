# MLM Matrix System - React Admin Panel

A comprehensive React-based admin panel for MLM (Multi-Level Marketing) systems with MySQL backend integration.

## 🚀 Features

- **Complete MLM Logic**: Matrix levels, spillover, cycle completion, bonus calculations
- **User Management**: Member registration, status management, referral tracking
- **Payment Processing**: Withdrawals, deposits, multiple payment gateways
- **Matrix Management**: Position tracking, level management, cycle completion
- **Real-time Updates**: Live dashboard updates and notifications
- **Responsive Design**: Modern UI with Tailwind CSS
- **MySQL Backend**: Robust database with full MLM logic

## 📋 Prerequisites

- Node.js 16+ 
- MySQL 5.7+ (via cPanel)
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NewMatrixSystem/admin-panel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using cPanel MySQL

1. **Create Database in cPanel**:
   - Log into your cPanel
   - Go to "MySQL Databases"
   - Create a new database (e.g., `mlm_system`)
   - Create a database user with full privileges
   - Note down the database name, username, and password

2. **Import Database Schema**:
   - Go to phpMyAdmin in cPanel
   - Select your database
   - Import the `database/schema.sql` file

#### Option B: Local MySQL

```bash
# Create database
mysql -u root -p
CREATE DATABASE mlm_system;
USE mlm_system;
SOURCE database/schema.sql;
```

### 4. Environment Configuration

1. **Copy Environment File**:
```bash
cp .env.example .env
```

2. **Update Environment Variables**:
```env
# Database Configuration
REACT_APP_DB_HOST=localhost
REACT_APP_DB_USER=your_cpanel_db_user
REACT_APP_DB_PASSWORD=your_cpanel_db_password
REACT_APP_DB_NAME=your_mlm_database
REACT_APP_DB_PORT=3306

# Application Configuration
REACT_APP_APP_NAME=MLM Matrix System
REACT_APP_APP_VERSION=1.0.0

# Payment Gateway Configuration
REACT_APP_COINPAYMENTS_PRIVATE_KEY=your_coinpayments_private_key
REACT_APP_COINPAYMENTS_PUBLIC_KEY=your_coinpayments_public_key
REACT_APP_COINPAYMENTS_MERCHANT_ID=your_coinpayments_merchant_id
REACT_APP_NOWPAYMENTS_API_KEY=your_nowpayments_api_key
REACT_APP_NOWPAYMENTS_IPN_SECRET=your_nowpayments_ipn_secret

# Email Configuration
REACT_APP_SMTP_HOST=your_smtp_host
REACT_APP_SMTP_PORT=587
REACT_APP_SMTP_USER=your_smtp_user
REACT_APP_SMTP_PASS=your_smtp_password
REACT_APP_FROM_EMAIL=noreply@yourdomain.com
REACT_APP_FROM_NAME=MLM System
```

### 5. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── api/                    # API layer and services
│   └── index.ts           # Main API exports
├── components/             # Reusable UI components
│   └── ui/                # Base UI components
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication context
│   └── CurrencyContext.tsx # Currency management
├── pages/                 # Page components
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Matrix/           # Matrix management pages
│   ├── Members/          # User management pages
│   ├── Financial/        # Payment pages
│   ├── Settings/         # Configuration pages
│   └── Analytics/        # Reporting pages
├── services/              # Backend services
│   ├── DatabaseService.ts # MySQL connection
│   ├── MatrixService.ts   # MLM logic
│   ├── PaymentService.ts  # Payment processing
│   └── UserService.ts     # User management
└── utils/                 # Utility functions
```

## 🔧 Core Services

### DatabaseService
- MySQL connection pooling
- Transaction support
- Query execution with error handling

### MatrixService
- Matrix entry processing
- Cycle completion detection
- Spillover management
- Bonus calculations
- Position tracking

### PaymentService
- Withdrawal processing
- Deposit handling
- Payment gateway integration
- Transaction logging

### UserService
- User registration and authentication
- Profile management
- Referral tracking
- Status management

## 🎯 Key Features

### Matrix Management
- **8-Level Matrix System**: Configurable matrix levels
- **Spillover Logic**: Automatic position assignment
- **Cycle Completion**: Automatic bonus distribution
- **Position Tracking**: Real-time position status

### Payment System
- **Multiple Currencies**: TRX, BTC, ETH, USDT, etc.
- **Payment Gateways**: CoinPayments, NOWPayments
- **Withdrawal Processing**: Manual/automatic approval
- **Transaction Logging**: Complete audit trail

### User Management
- **Member Types**: Free, Pro, Pending
- **Referral System**: Multi-level tracking
- **KYC Integration**: Identity verification
- **Status Management**: Active, suspended, deleted

### Analytics & Reporting
- **Real-time Dashboard**: Live statistics
- **Performance Metrics**: Earnings, cycles, bonuses
- **User Analytics**: Growth, engagement, retention
- **Financial Reports**: Revenue, payouts, commissions

## 🔐 Security Features

- **Password Hashing**: Secure password storage
- **SQL Injection Protection**: Parameterized queries
- **Transaction Security**: Atomic operations
- **Access Control**: Role-based permissions

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## 📊 Database Schema

### Core Tables
- `users`: User accounts and profiles
- `membership_levels`: Matrix configurations
- `matrix1`, `matrix2`: Matrix position data
- `verifier`: Pending entries
- `tlogs`: Transaction logs
- `wtransaction`: Withdrawal transactions
- `settings`: System configuration

### Key Relationships
- Users can have multiple matrix positions
- Matrix positions track level completion
- Transactions link to users and matrices
- Settings control system behavior

## 🔄 API Endpoints

### Matrix API
- `GET /api/matrix/configs` - Get matrix configurations
- `POST /api/matrix/entry` - Process matrix entry
- `GET /api/matrix/stats/:id` - Get matrix statistics
- `POST /api/matrix/cycle/:id` - Process cycle completion

### Payment API
- `POST /api/payment/withdraw` - Process withdrawal
- `POST /api/payment/deposit` - Process deposit
- `GET /api/payment/transactions` - Get transaction history
- `PUT /api/payment/approve/:id` - Approve withdrawal

### User API
- `POST /api/user/register` - Register new user
- `GET /api/user/:id` - Get user details
- `PUT /api/user/:id` - Update user
- `GET /api/user/stats` - Get user statistics

## 🛠️ Configuration

### Matrix Settings
- Level bonuses (8 levels)
- Matching bonuses
- Cycle bonuses
- Spillover settings
- Re-entry configuration

### Payment Settings
- Primary currency (TRX)
- Supported currencies
- Payment gateway configuration
- Withdrawal limits

### Email Settings
- SMTP configuration
- Welcome emails
- Cycle completion emails
- Notification templates

## 🔧 Troubleshooting

### Database Connection Issues
1. Check database credentials in `.env`
2. Verify database exists and is accessible
3. Test connection with `npm run test:db`

### Payment Gateway Issues
1. Verify API keys in environment
2. Check gateway configuration
3. Test with small amounts first

### Matrix Processing Issues
1. Check matrix configuration
2. Verify user data integrity
3. Review transaction logs

## 📝 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

## 🔄 Updates

To update the system:
1. Pull latest changes: `git pull`
2. Install new dependencies: `npm install`
3. Run database migrations if needed
4. Restart the application

---

**Note**: This is a production-ready MLM system. Ensure proper testing and security measures before deployment. 