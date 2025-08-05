# 🚀 **MATRIX MLM SYSTEM - DEPLOYMENT GUIDE**

## 📋 **OVERVIEW**

This guide provides step-by-step instructions for deploying the Matrix MLM system to production. The system consists of:

- **Backend API** - Node.js/Express with Prisma ORM
- **Admin Panel** - React-based admin interface
- **User Panel** - React-based user interface
- **Database** - PostgreSQL with Redis caching
- **Reverse Proxy** - Nginx with SSL/TLS
- **Monitoring** - Health checks and logging

---

## 🎯 **PREREQUISITES**

### **System Requirements**
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB, Recommended 50GB+
- **CPU**: 2+ cores recommended

### **Software Requirements**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+
- **Git**: Latest version

### **Domain & SSL**
- **Domain**: Registered domain name
- **DNS**: Proper DNS configuration
- **SSL**: Let's Encrypt certificate (automatic)

---

## 🚀 **QUICK DEPLOYMENT**

### **Option 1: Automated Deployment (Recommended)**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/matrix-mlm.git
   cd matrix-mlm
   ```

2. **Make deployment script executable**
   ```bash
   chmod +x deploy.sh
   ```

3. **Run the deployment script**
   ```bash
   ./deploy.sh
   ```

The script will automatically:
- ✅ Check system requirements
- ✅ Install SSL certificate
- ✅ Configure environment variables
- ✅ Build and deploy all services
- ✅ Run database migrations
- ✅ Setup monitoring and backups
- ✅ Configure firewall

### **Option 2: Manual Deployment**

Follow the detailed steps below for manual deployment.

---

## 📝 **MANUAL DEPLOYMENT STEPS**

### **Step 1: Server Preparation**

1. **Update system**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

### **Step 2: Project Setup**

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/matrix-mlm.git
   cd matrix-mlm
   ```

2. **Create necessary directories**
   ```bash
   mkdir -p uploads logs backups monitoring nginx/ssl
   ```

3. **Set proper permissions**
   ```bash
   chmod +x deploy.sh
   chmod +x backups/backup.sh
   chmod +x monitoring/health_check.sh
   ```

### **Step 3: Environment Configuration**

1. **Configure domain in deploy.sh**
   ```bash
   nano deploy.sh
   # Update DOMAIN and EMAIL variables
   ```

2. **Update environment variables**
   ```bash
   nano .env
   # Configure database, JWT, email, and payment settings
   ```

3. **Configure frontend environment**
   ```bash
   # Admin panel
   nano admin-panel/.env
   
   # User panel
   nano user-panel/.env
   ```

### **Step 4: SSL Certificate**

1. **Install Certbot**
   ```bash
   sudo apt install certbot
   ```

2. **Get SSL certificate**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

3. **Copy certificates**
   ```bash
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
   sudo chown $USER:$USER nginx/ssl/*
   sudo chmod 600 nginx/ssl/*
   ```

### **Step 5: Database Setup**

1. **Initialize database**
   ```bash
   docker-compose up -d postgres
   sleep 10
   ```

2. **Run migrations**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

3. **Seed database (optional)**
   ```bash
   docker-compose exec backend npx prisma db seed
   ```

### **Step 6: Deploy Services**

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

2. **Check service status**
   ```bash
   docker-compose ps
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

### **Step 7: Post-Deployment**

1. **Setup monitoring**
   ```bash
   # Add health check to crontab
   (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/matrix-mlm/monitoring/health_check.sh") | crontab -
   ```

2. **Setup backups**
   ```bash
   # Add backup to crontab (daily at 2 AM)
   (crontab -l 2>/dev/null; echo "0 2 * * * /opt/matrix-mlm/backups/backup.sh") | crontab -
   ```

3. **Configure firewall**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw --force enable
   ```

---

## 🔧 **CONFIGURATION**

### **Environment Variables**

#### **Backend (.env)**
```env
# Database
DATABASE_URL=postgresql://matrix_user:matrix_password@postgres:5432/matrix_mlm

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key
COINPAYMENTS_PRIVATE_KEY=your_coinpayments_private_key
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
```

#### **Admin Panel (.env)**
```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_WS_URL=wss://yourdomain.com
REACT_APP_JWT_STORAGE_KEY=admin_token
```

#### **User Panel (.env)**
```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_WS_URL=wss://yourdomain.com
REACT_APP_JWT_STORAGE_KEY=user_token
```

### **Payment Gateway Configuration**

1. **Stripe**
   - Create account at https://stripe.com
   - Get API keys from dashboard
   - Configure webhook endpoint

2. **CoinPayments**
   - Create account at https://coinpayments.net
   - Get API keys from account settings
   - Configure IPN notifications

3. **NOWPayments**
   - Create account at https://nowpayments.io
   - Get API key from dashboard
   - Configure webhook URL

### **Email Configuration**

1. **Gmail SMTP**
   - Enable 2-factor authentication
   - Generate app password
   - Use app password in SMTP_PASS

2. **Custom SMTP**
   - Update SMTP_HOST, SMTP_PORT
   - Configure SMTP_USER and SMTP_PASS

---

## 🔍 **MONITORING & MAINTENANCE**

### **Health Checks**

1. **Application health**
   ```bash
   curl -f https://yourdomain.com/health
   ```

2. **Service status**
   ```bash
   docker-compose ps
   ```

3. **Database health**
   ```bash
   docker-compose exec postgres pg_isready
   ```

### **Logs**

1. **View all logs**
   ```bash
   docker-compose logs -f
   ```

2. **View specific service logs**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f admin-panel
   docker-compose logs -f user-panel
   ```

### **Backups**

1. **Manual backup**
   ```bash
   ./backups/backup.sh
   ```

2. **Restore backup**
   ```bash
   # Extract backup
   tar -xzf backup_file.tar.gz
   
   # Restore database
   docker-compose exec -T postgres psql -U matrix_user matrix_mlm < db_backup.sql
   
   # Restore uploads
   tar -xzf uploads_backup.tar.gz
   ```

### **Updates**

1. **Update application**
   ```bash
   git pull origin main
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   docker-compose exec backend npx prisma migrate deploy
   ```

2. **Update SSL certificate**
   ```bash
   sudo certbot renew
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
   docker-compose restart nginx
   ```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

1. **Services not starting**
   ```bash
   # Check logs
   docker-compose logs
   
   # Check disk space
   df -h
   
   # Check memory
   free -h
   ```

2. **Database connection issues**
   ```bash
   # Check database container
   docker-compose ps postgres
   
   # Check database logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres psql -U matrix_user -d matrix_mlm
   ```

3. **SSL certificate issues**
   ```bash
   # Check certificate validity
   openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
   
   # Renew certificate
   sudo certbot renew
   ```

4. **Performance issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Check nginx logs
   docker-compose logs nginx
   
   # Check application logs
   docker-compose logs backend
   ```

### **Performance Optimization**

1. **Database optimization**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_payments_status ON payments(status);
   CREATE INDEX idx_matrix_positions_user_id ON matrix_positions(user_id);
   ```

2. **Nginx optimization**
   ```nginx
   # Enable gzip compression
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript;
   ```

3. **Application optimization**
   ```javascript
   // Enable Redis caching
   const redis = require('redis');
   const client = redis.createClient(process.env.REDIS_URL);
   ```

---

## 📞 **SUPPORT**

### **Getting Help**

1. **Documentation**
   - Check the main README.md
   - Review API documentation
   - Check troubleshooting section

2. **Logs**
   - Application logs: `docker-compose logs backend`
   - Nginx logs: `docker-compose logs nginx`
   - Database logs: `docker-compose logs postgres`

3. **Community**
   - GitHub Issues: Report bugs and feature requests
   - GitHub Discussions: Ask questions and share solutions

### **Emergency Procedures**

1. **Service down**
   ```bash
   # Restart all services
   docker-compose restart
   
   # Check health
   curl -f https://yourdomain.com/health
   ```

2. **Database issues**
   ```bash
   # Restart database
   docker-compose restart postgres
   
   # Check database
   docker-compose exec postgres pg_isready
   ```

3. **SSL certificate expired**
   ```bash
   # Renew certificate
   sudo certbot renew
   
   # Restart nginx
   docker-compose restart nginx
   ```

---

## 🎉 **SUCCESS METRICS**

### **Technical Metrics**
- ✅ **Uptime**: > 99.9%
- ✅ **Response Time**: < 200ms
- ✅ **Error Rate**: < 0.1%
- ✅ **SSL Certificate**: Valid and auto-renewing

### **Business Metrics**
- ✅ **User Registration**: Working smoothly
- ✅ **Payment Processing**: Successful transactions
- ✅ **Matrix Functionality**: Accurate position tracking
- ✅ **Admin Management**: Efficient user management

---

**🎯 Your Matrix MLM system is now ready for production!**

**Access URLs:**
- **Main Site**: https://yourdomain.com
- **Admin Panel**: https://yourdomain.com/admin
- **API**: https://yourdomain.com/api
- **Health Check**: https://yourdomain.com/health 