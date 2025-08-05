# Matrix MLM Backend API

This is the backend API for the Matrix MLM System, built with Node.js, Express, and MySQL.

## Features

- **Authentication**: JWT-based authentication system
- **User Management**: CRUD operations for users/members
- **Matrix Management**: Matrix configurations and positions
- **Payment Processing**: Deposits, withdrawals, and transactions
- **Settings Management**: System configuration and settings
- **Database Integration**: MySQL database with connection pooling

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env` and configure your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials and other settings.

### 3. Database Setup

Make sure you have MySQL running and create a database named `mlm_system`.

The API will automatically create the required tables on first run.

### 4. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on port 3001 by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users` - Get all users (with pagination and filters)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/overview` - Get user statistics
- `GET /api/users/search/:term` - Search users

### Matrix

- `GET /api/matrix/configs` - Get all matrix configurations
- `GET /api/matrix/configs/:id` - Get matrix configuration by ID
- `POST /api/matrix/configs` - Create new matrix configuration
- `PUT /api/matrix/configs/:id` - Update matrix configuration
- `DELETE /api/matrix/configs/:id` - Delete matrix configuration
- `GET /api/matrix/stats/:matrixId` - Get matrix statistics
- `GET /api/matrix/positions/:matrixId` - Get matrix positions
- `POST /api/matrix/entry` - Process matrix entry

### Payments

- `GET /api/payments/transactions` - Get all transactions
- `GET /api/payments/deposits` - Get deposits
- `GET /api/payments/withdrawals` - Get withdrawals
- `POST /api/payments/deposit` - Process deposit
- `POST /api/payments/withdrawal` - Process withdrawal
- `PUT /api/payments/transactions/:id/approve` - Approve transaction
- `PUT /api/payments/transactions/:id/reject` - Reject transaction
- `GET /api/payments/stats` - Get payment statistics

### Settings

- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get setting by key
- `PUT /api/settings/:key` - Update setting
- `DELETE /api/settings/:key` - Delete setting
- `POST /api/settings/init` - Initialize default settings

### Health Check

- `GET /api/health` - Health check endpoint

## Database Schema

The API automatically creates the following tables:

- `users` - User accounts and profiles
- `settings` - System configuration
- `matrix_configs` - Matrix configurations
- `transactions` - Payment transactions

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- Error handling middleware

## Development

The backend uses:
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong JWT secret
3. Configure proper CORS settings
4. Set up a reverse proxy (nginx)
5. Use PM2 or similar for process management 