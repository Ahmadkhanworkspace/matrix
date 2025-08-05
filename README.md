# New Matrix MLM System - Phase 1

A modern, robust, and scalable Matrix MLM (Multi-Level Marketing) system built with Node.js, TypeScript, and PostgreSQL.

## 🚀 Phase 1 Overview

Phase 1 establishes the foundation of the new Matrix MLM system with the following components:

### ✅ Completed in Phase 1

#### **1. Project Structure**
```
NewMatrixSystem/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── routes/          # API routes
├── prisma/              # Database schema and migrations
├── logs/                # Application logs
├── uploads/             # File uploads
└── docs/                # Documentation
```

#### **2. Core Technologies**
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO for live updates
- **Cron Jobs**: node-cron for scheduled tasks
- **Logging**: Winston for structured logging
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, rate limiting

#### **3. Database Schema**
- **Users**: Complete user management with referral system
- **Matrix Positions**: 15-level matrix structure with 2x8 configuration
- **Payments**: Multi-gateway payment processing (CoinPayments, NOWPayments)
- **Transactions**: Complete financial tracking
- **Bonuses**: Referral, matrix, matching, and cycle bonuses
- **System Config**: Dynamic configuration management

#### **4. API Endpoints Structure**
```
/api/auth/*          # Authentication routes
/api/user/*          # User dashboard and profile
/api/matrix/*        # Matrix management
/api/payment/*       # Payment processing
/api/admin/*         # Admin panel
```

#### **5. Matrix System Features**
- **15 Matrix Levels**: Scalable matrix structure
- **2x8 Configuration**: 2 positions wide, 8 levels deep
- **Automatic Placement**: Smart position allocation
- **Cycle Detection**: Automatic matrix completion
- **Bonus Distribution**: Real-time bonus calculations

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)

### 1. Clone and Install
```bash
cd NewMatrixSystem
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

## 📊 Key Features Implemented

### **User Management**
- ✅ User registration with sponsor system
- ✅ Email verification
- ✅ JWT authentication with refresh tokens
- ✅ Password reset functionality
- ✅ User profile management

### **Matrix System**
- ✅ 15-level matrix structure
- ✅ Automatic position placement
- ✅ Matrix completion detection
- ✅ Real-time matrix updates via Socket.IO
- ✅ Matrix genealogy tracking

### **Payment System**
- ✅ CoinPayments integration
- ✅ NOWPayments integration
- ✅ Payment status tracking
- ✅ Webhook processing
- ✅ Withdrawal management

### **Bonus System**
- ✅ Referral bonuses
- ✅ Matrix completion bonuses
- ✅ Matching bonuses
- ✅ Level completion bonuses
- ✅ Automatic bonus distribution

### **Admin Panel**
- ✅ User management
- ✅ Matrix oversight
- ✅ Financial management
- ✅ System configuration
- ✅ Statistics and reporting

### **Security Features**
- ✅ JWT token authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration

## 🔄 Cron Jobs System

The system includes automated cron jobs for:

```typescript
// Matrix processing - every 2 minutes
"*/2 * * * *" - Process matrix placements and cycles

// Payment processing - every 5 minutes  
"*/5 * * * *" - Process pending payments

// Email processing - every 10 minutes
"*/10 * * * *" - Send notification emails

// System cleanup - daily at 2 AM
"0 2 * * *" - Cleanup old sessions and logs
```

## 📈 Performance Optimizations

### **Database Optimizations**
- ✅ Indexed queries for matrix operations
- ✅ Efficient hierarchical queries using LTREE
- ✅ Connection pooling with Prisma
- ✅ Query optimization for large datasets

### **Caching Strategy**
- ✅ Redis caching for frequently accessed data
- ✅ Matrix position caching
- ✅ User session caching
- ✅ Configuration caching

### **Real-time Updates**
- ✅ Socket.IO for live matrix updates
- ✅ Real-time payment notifications
- ✅ Live bonus distribution alerts
- ✅ Admin dashboard updates

## 🔧 Configuration

### **Matrix Configuration**
```typescript
MATRIX_LEVELS=15           // Number of matrix levels
MATRIX_WIDTH=2             // Positions per level
MATRIX_DEPTH=8             // Levels deep
MIN_WITHDRAWAL=10          // Minimum withdrawal amount
WITHDRAWAL_FEE=2           // Withdrawal fee percentage
```

### **Payment Gateways**
```typescript
// CoinPayments
COINPAYMENTS_MERCHANT_ID=your-merchant-id
COINPAYMENTS_IPN_SECRET=your-ipn-secret

// NOWPayments  
NOWPAYMENTS_API_KEY=your-api-key
NOWPAYMENTS_IPN_SECRET=your-ipn-secret
```

## 🚀 Deployment

### **Production Setup**
```bash
# Build the application
npm run build

# Start production server
npm start

# Or use PM2
pm2 start dist/server.js --name matrix-mlm
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t matrix-mlm .

# Run container
docker run -p 3000:3000 matrix-mlm
```

## 📝 API Documentation

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### **User Endpoints**
- `GET /api/user/dashboard` - User dashboard
- `GET /api/user/matrix` - User matrix view
- `GET /api/user/referrals` - Referral list
- `POST /api/user/withdraw` - Request withdrawal

### **Matrix Endpoints**
- `GET /api/matrix/positions` - Matrix positions
- `GET /api/matrix/genealogy` - Matrix genealogy
- `POST /api/matrix/purchase` - Purchase position

### **Admin Endpoints**
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - User management
- `GET /api/admin/matrix/statistics` - Matrix statistics

## 🔮 Next Phases

### **Phase 2: Frontend Development**
- React.js user dashboard
- Admin panel interface
- Real-time matrix visualization
- Mobile-responsive design

### **Phase 3: Advanced Features**
- Advanced analytics
- Multi-language support
- Advanced security features
- API rate limiting
- Advanced reporting

### **Phase 4: Scaling & Optimization**
- Microservices architecture
- Load balancing
- Advanced caching
- Performance monitoring
- Automated testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Phase 1 Status: ✅ COMPLETED**

The foundation is now ready for Phase 2 development! 