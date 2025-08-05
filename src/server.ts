import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import configurations
import { database } from './config/database';
import { logger } from './utils/logger';
import { ErrorHandler } from './middleware/errorHandler';
import { ValidationMiddleware } from './middleware/validation';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import matrixRoutes from './routes/matrix';
import paymentRoutes from './routes/payment';
import adminRoutes from './routes/admin';

// Import services
import { CronService } from './services/CronService';

class MatrixServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3001",
        methods: ["GET", "POST"]
      }
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeCronJobs();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3001",
      credentials: true
    }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.http(message.trim())
      }
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Data sanitization middleware
    this.app.use(ValidationMiddleware.sanitizeData());

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeRoutes(): void {
    // Health check route
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/user', userRoutes);
    this.app.use('/api/matrix', matrixRoutes);
    this.app.use('/api/payment', paymentRoutes);
    this.app.use('/api/admin', adminRoutes);

    // 404 handler
    this.app.use('*', ErrorHandler.handleNotFound);

    // Global error handler
    this.app.use(ErrorHandler.handleError);
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      // Join user to their personal room
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
      });

      // Handle matrix updates
      socket.on('matrix-update', (data) => {
        // Broadcast matrix updates to relevant users
        this.io.to(`user-${data.userId}`).emit('matrix-updated', data);
      });

      // Handle payment updates
      socket.on('payment-update', (data) => {
        this.io.to(`user-${data.userId}`).emit('payment-updated', data);
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
      });
    });

    logger.info('Socket.IO initialized');
  }

  private initializeCronJobs(): void {
    const cronService = new CronService();
    cronService.initializeCronJobs();
    logger.info('Cron jobs initialized');
  }

  public async start(): Promise<void> {
    try {
      // Initialize error handlers
      ErrorHandler.initialize();

      // Connect to database
      await database.connect();

      // Start server
      this.server.listen(this.port, () => {
        logger.info(`🚀 Matrix MLM Server running on port ${this.port}`);
        logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
        logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Received shutdown signal, starting graceful shutdown...');

    // Close server
    this.server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close database connection
    await database.disconnect();

    // Close Socket.IO
    this.io.close(() => {
      logger.info('Socket.IO server closed');
    });

    logger.info('Graceful shutdown completed');
    process.exit(0);
  }

  public getIO(): Server {
    return this.io;
  }
}

// Start the server
const server = new MatrixServer();
server.start().catch((error) => {
  logger.error('Failed to start Matrix MLM Server:', error);
  process.exit(1);
});

export default server; 