#!/bin/bash

# Matrix MLM System Deployment Script
# This script handles the complete deployment of the Matrix MLM system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="matrix-mlm"
DOMAIN="matrixmlm.com"
EMAIL="admin@matrixmlm.com"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    success "System requirements check passed"
}

# Install SSL certificate
install_ssl() {
    log "Installing SSL certificate..."
    
    # Create SSL directory
    mkdir -p nginx/ssl
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        log "Installing certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot
    fi
    
    # Get SSL certificate
    sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Copy certificates to nginx directory
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem
    
    # Set proper permissions
    sudo chown $USER:$USER nginx/ssl/*
    sudo chmod 600 nginx/ssl/*
    
    success "SSL certificate installed successfully"
}

# Setup environment variables
setup_env() {
    log "Setting up environment variables..."
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Create .env file for backend
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://matrix_user:matrix_password@postgres:5432/matrix_mlm

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Server Configuration
PORT=3001
NODE_ENV=production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Payment Gateway Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
COINPAYMENTS_PRIVATE_KEY=your_coinpayments_private_key
COINPAYMENTS_PUBLIC_KEY=your_coinpayments_public_key
NOWPAYMENTS_API_KEY=your_nowpayments_api_key

# Redis Configuration
REDIS_URL=redis://redis:6379

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Security Configuration
CORS_ORIGIN=https://$DOMAIN
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOF
    
    success "Environment variables configured"
}

# Build and start services
deploy_services() {
    log "Building and starting services..."
    
    # Pull latest images
    docker-compose pull
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    if ! docker-compose ps | grep -q "Up"; then
        error "Some services failed to start"
    fi
    
    success "Services deployed successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    until docker-compose exec -T backend npx prisma migrate deploy; do
        log "Waiting for database to be ready..."
        sleep 5
    done
    
    success "Database migrations completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring directory
    mkdir -p monitoring
    
    # Create basic monitoring script
    cat > monitoring/health_check.sh << 'EOF'
#!/bin/bash

# Health check script for Matrix MLM system

DOMAIN="matrixmlm.com"
LOG_FILE="/var/log/matrix-mlm/health.log"

# Check if application is responding
if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
    echo "$(date): Application is healthy" >> $LOG_FILE
    exit 0
else
    echo "$(date): Application is not responding" >> $LOG_FILE
    exit 1
fi
EOF
    
    chmod +x monitoring/health_check.sh
    
    # Setup log rotation
    sudo tee /etc/logrotate.d/matrix-mlm << EOF
/var/log/matrix-mlm/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
    
    success "Monitoring setup completed"
}

# Setup backups
setup_backups() {
    log "Setting up backup system..."
    
    # Create backup directory
    mkdir -p backups
    
    # Create backup script
    cat > backups/backup.sh << 'EOF'
#!/bin/bash

# Backup script for Matrix MLM system

BACKUP_DIR="/opt/matrix-mlm/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="matrix_mlm_backup_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U matrix_user matrix_mlm > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz uploads/

# Backup configuration
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz .env nginx/ssl/

# Create combined backup
tar -czf $BACKUP_DIR/$BACKUP_FILE $BACKUP_DIR/db_backup_$DATE.sql $BACKUP_DIR/uploads_backup_$DATE.tar.gz $BACKUP_DIR/config_backup_$DATE.tar.gz

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF
    
    chmod +x backups/backup.sh
    
    # Add to crontab (daily backup at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/matrix-mlm/backups/backup.sh") | crontab -
    
    success "Backup system setup completed"
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Enable firewall
    sudo ufw --force enable
    
    success "Firewall configured"
}

# Final health check
health_check() {
    log "Performing final health check..."
    
    # Check if all services are running
    if docker-compose ps | grep -q "Up"; then
        success "All services are running"
    else
        error "Some services are not running"
    fi
    
    # Check if application is responding
    if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
        success "Application is responding"
    else
        error "Application is not responding"
    fi
    
    # Check SSL certificate
    if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates | grep -q "notAfter"; then
        success "SSL certificate is valid"
    else
        error "SSL certificate is not valid"
    fi
}

# Main deployment function
main() {
    log "Starting Matrix MLM system deployment..."
    
    check_root
    check_requirements
    setup_env
    install_ssl
    deploy_services
    run_migrations
    setup_monitoring
    setup_backups
    setup_firewall
    health_check
    
    success "Deployment completed successfully!"
    log "Your Matrix MLM system is now live at https://$DOMAIN"
    log "Admin panel: https://$DOMAIN/admin"
    log "User panel: https://$DOMAIN"
}

# Run main function
main "$@" 