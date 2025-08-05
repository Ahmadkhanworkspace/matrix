-- MLM System Database Schema for MySQL
-- Import this file into your cPanel MySQL database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status INT DEFAULT 1 COMMENT '1=active, 2=pro, 0=pending, -1=deleted',
  balance DECIMAL(10,2) DEFAULT 0.00,
  unpaid DECIMAL(10,2) DEFAULT 0.00,
  paid DECIMAL(10,2) DEFAULT 0.00,
  ref_by VARCHAR(255),
  tron_wallet VARCHAR(255),
  banners INT DEFAULT 0,
  textads INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_ref_by (ref_by)
);

-- Matrix configurations (membership levels)
CREATE TABLE IF NOT EXISTS membership_levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  fee DECIMAL(10,2) NOT NULL,
  matrix_type INT DEFAULT 1 COMMENT '1=regular, 2=company',
  levels INT DEFAULT 8,
  forced_matrix INT DEFAULT 2,
  ref_bonus DECIMAL(10,2) DEFAULT 0.00,
  ref_bonus_paid INT DEFAULT 0,
  payout_type INT DEFAULT 1,
  matrix_bonus DECIMAL(10,2) DEFAULT 0.00,
  matching_bonus DECIMAL(10,2) DEFAULT 0.00,
  -- Level bonuses
  level1 DECIMAL(10,2) DEFAULT 0.00,
  level2 DECIMAL(10,2) DEFAULT 0.00,
  level3 DECIMAL(10,2) DEFAULT 0.00,
  level4 DECIMAL(10,2) DEFAULT 0.00,
  level5 DECIMAL(10,2) DEFAULT 0.00,
  level6 DECIMAL(10,2) DEFAULT 0.00,
  level7 DECIMAL(10,2) DEFAULT 0.00,
  level8 DECIMAL(10,2) DEFAULT 0.00,
  level9 DECIMAL(10,2) DEFAULT 0.00,
  level10 DECIMAL(10,2) DEFAULT 0.00,
  -- Matching bonuses
  level1m DECIMAL(10,2) DEFAULT 0.00,
  level2m DECIMAL(10,2) DEFAULT 0.00,
  level3m DECIMAL(10,2) DEFAULT 0.00,
  level4m DECIMAL(10,2) DEFAULT 0.00,
  level5m DECIMAL(10,2) DEFAULT 0.00,
  level6m DECIMAL(10,2) DEFAULT 0.00,
  level7m DECIMAL(10,2) DEFAULT 0.00,
  level8m DECIMAL(10,2) DEFAULT 0.00,
  level9m DECIMAL(10,2) DEFAULT 0.00,
  level10m DECIMAL(10,2) DEFAULT 0.00,
  -- Cycle bonuses
  level1c DECIMAL(10,2) DEFAULT 0.00,
  level2c DECIMAL(10,2) DEFAULT 0.00,
  level3c DECIMAL(10,2) DEFAULT 0.00,
  level4c DECIMAL(10,2) DEFAULT 0.00,
  level5c DECIMAL(10,2) DEFAULT 0.00,
  level6c DECIMAL(10,2) DEFAULT 0.00,
  level7c DECIMAL(10,2) DEFAULT 0.00,
  level8c DECIMAL(10,2) DEFAULT 0.00,
  level9c DECIMAL(10,2) DEFAULT 0.00,
  level10c DECIMAL(10,2) DEFAULT 0.00,
  -- Credits
  text_credits_entry INT DEFAULT 0,
  banner_credits_entry INT DEFAULT 0,
  text_credits_cycle INT DEFAULT 0,
  banner_credits_cycle INT DEFAULT 0,
  -- Re-entry settings
  reentry INT DEFAULT 0,
  reentry_num INT DEFAULT 0,
  -- Entry to other matrices
  entry1 INT DEFAULT 0,
  entry1_num INT DEFAULT 0,
  matrix_id1 INT DEFAULT 0,
  entry2 INT DEFAULT 0,
  entry2_num INT DEFAULT 0,
  matrix_id2 INT DEFAULT 0,
  entry3 INT DEFAULT 0,
  entry3_num INT DEFAULT 0,
  matrix_id3 INT DEFAULT 0,
  entry4 INT DEFAULT 0,
  entry4_num INT DEFAULT 0,
  matrix_id4 INT DEFAULT 0,
  entry5 INT DEFAULT 0,
  entry5_num INT DEFAULT 0,
  matrix_id5 INT DEFAULT 0,
  -- Email settings
  welcome_mail INT DEFAULT 0,
  subject1 TEXT,
  message1 TEXT,
  eformat1 INT DEFAULT 0,
  cycle_mail INT DEFAULT 0,
  subject2 TEXT,
  message2 TEXT,
  eformat2 INT DEFAULT 0,
  cycle_mail_sponsor INT DEFAULT 0,
  subject3 TEXT,
  message3 TEXT,
  eformat3 INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_matrix_type (matrix_type),
  INDEX idx_fee (fee)
);

-- Matrix positions table (matrix1 - main matrix)
CREATE TABLE IF NOT EXISTS matrix1 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  sponsor VARCHAR(255),
  ref_by VARCHAR(255),
  level1 INT DEFAULT 0,
  level2 INT DEFAULT 0,
  level3 INT DEFAULT 0,
  level4 INT DEFAULT 0,
  level5 INT DEFAULT 0,
  level6 INT DEFAULT 0,
  level7 INT DEFAULT 0,
  level8 INT DEFAULT 0,
  level9 INT DEFAULT 0,
  level10 INT DEFAULT 0,
  leader INT DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0.00,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  main_id INT DEFAULT 0,
  cdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_sponsor (sponsor),
  INDEX idx_ref_by (ref_by),
  INDEX idx_main_id (main_id)
);

-- Matrix positions table (matrix2 - company matrix)
CREATE TABLE IF NOT EXISTS matrix2 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  sponsor VARCHAR(255),
  ref_by VARCHAR(255),
  level1 INT DEFAULT 0,
  level2 INT DEFAULT 0,
  level3 INT DEFAULT 0,
  level4 INT DEFAULT 0,
  level5 INT DEFAULT 0,
  level6 INT DEFAULT 0,
  level7 INT DEFAULT 0,
  level8 INT DEFAULT 0,
  level9 INT DEFAULT 0,
  level10 INT DEFAULT 0,
  leader INT DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0.00,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  main_id INT DEFAULT 0,
  cdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_sponsor (sponsor),
  INDEX idx_ref_by (ref_by),
  INDEX idx_main_id (main_id)
);

-- Pending entries (verifier table)
CREATE TABLE IF NOT EXISTS verifier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  mid INT NOT NULL COMMENT 'matrix id',
  sponsor VARCHAR(255),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  etype INT DEFAULT 0 COMMENT '0=new entry, 1=re-entry',
  INDEX idx_username (username),
  INDEX idx_mid (mid),
  INDEX idx_etype (etype),
  INDEX idx_date (date)
);

-- Transactions log
CREATE TABLE IF NOT EXISTS tlogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  memid INT DEFAULT 0,
  matrix INT DEFAULT 0,
  amount DECIMAL(10,2) DEFAULT 0.00,
  purpose VARCHAR(255),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_date (date),
  INDEX idx_purpose (purpose)
);

-- Withdrawal transactions
CREATE TABLE IF NOT EXISTS wtransaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  payment_mode VARCHAR(255),
  amount DECIMAL(10,2) DEFAULT 0.00,
  approved INT DEFAULT 0 COMMENT '0=pending, 1=approved, -1=rejected',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_approved (approved),
  INDEX idx_date (date),
  INDEX idx_payment_mode (payment_mode)
);

-- System settings
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Cron jobs tracking
CREATE TABLE IF NOT EXISTS cronjobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  active INT DEFAULT 0,
  lastid INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default matrix configuration
INSERT INTO membership_levels (
  name, fee, matrix_type, levels, forced_matrix, ref_bonus, matrix_bonus, matching_bonus,
  level1, level2, level3, level4, level5, level6, level7, level8,
  level1m, level2m, level3m, level4m, level5m, level6m, level7m, level8m,
  level1c, level2c, level3c, level4c, level5c, level6c, level7c, level8c,
  text_credits_entry, banner_credits_entry, text_credits_cycle, banner_credits_cycle,
  reentry, reentry_num, welcome_mail, cycle_mail, cycle_mail_sponsor
) VALUES (
  'Standard Matrix', 100.00, 1, 8, 2, 10.00, 50.00, 25.00,
  5.00, 3.00, 2.00, 1.50, 1.00, 0.75, 0.50, 0.25,
  2.50, 1.50, 1.00, 0.75, 0.50, 0.25, 0.10, 0.05,
  25.00, 15.00, 10.00, 7.50, 5.00, 3.75, 2.50, 1.25,
  10, 5, 5, 2,
  1, 1, 1, 1, 1
);

-- Insert default settings
INSERT INTO settings (name, value) VALUES
('site_name', 'MLM Matrix System'),
('site_description', 'Advanced MLM Matrix System'),
('primary_currency', 'TRX'),
('supported_currencies', '["TRX", "BTC", "ETH", "USDT", "BNB", "ADA", "DOT", "LINK"]'),
('payment_gateways', '{"cp_private_key": "", "cp_public_key": "", "cp_merchant_id": "", "np_api_key": "", "np_ipn_secret": "", "primary_gateway": "coinpayments"}'),
('email_settings', '{"smtp_host": "", "smtp_port": 587, "smtp_user": "", "smtp_pass": "", "from_email": "", "from_name": ""}'),
('matrix_settings', '{"max_levels": 10, "auto_spillover": true, "cycle_completion": true}'),
('bonus_settings', '{"referral_bonus": true, "matrix_bonus": true, "matching_bonus": true, "cycle_bonus": true}');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, status, balance, ref_by) VALUES
('admin', 'admin@mlmsystem.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 2, 0.00, '');

-- Insert default cron job tracking
INSERT INTO cronjobs (active, lastid) VALUES (1, 0); 