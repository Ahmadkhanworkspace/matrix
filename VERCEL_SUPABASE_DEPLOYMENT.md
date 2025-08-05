# 🚀 **MATRIX MLM SYSTEM - VERCEL + SUPABASE DEPLOYMENT**

## 📋 **OVERVIEW**

This guide provides step-by-step instructions for deploying the Matrix MLM System using:
- **Vercel** - Frontend hosting (User Panel + Admin Panel)
- **Supabase** - Backend API and database
- **Node.js Backend** - API server (can be hosted on Vercel Functions or separate server)

---

## 🏗️ **ARCHITECTURE**

### **Frontend (Vercel)**
- ✅ **User Panel** - React application for end users
- ✅ **Admin Panel** - React application for administrators
- ✅ **Vercel Functions** - Serverless API endpoints (optional)

### **Backend Options**
#### **Option 1: Supabase + Vercel Functions**
- ✅ **Supabase** - Database and authentication
- ✅ **Vercel Functions** - API endpoints
- ✅ **Supabase Edge Functions** - Custom serverless functions

#### **Option 2: Supabase + Separate Backend**
- ✅ **Supabase** - Database only
- ✅ **Separate Backend Server** - Node.js/Express API
- ✅ **Vercel Functions** - Additional serverless functions

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Supabase Setup**

#### **1.1 Create Supabase Project**

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com
   - Sign up/Login to your account
   - Click "New Project"

2. **Configure Project**
   ```
   Project Name: matrix-mlm-system
   Database Password: [strong password]
   Region: [choose closest to your users]
   ```

3. **Get Connection Details**
   - Go to Settings > Database
   - Copy the connection string and keys

#### **1.2 Database Schema Setup**

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase**
   ```bash
   supabase init
   ```

3. **Create Migration Files**
   Create `supabase/migrations/001_initial_schema.sql`:
   ```sql
   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";

   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     username VARCHAR(50) UNIQUE NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     first_name VARCHAR(100),
     last_name VARCHAR(100),
     phone VARCHAR(20),
     country VARCHAR(100),
     company VARCHAR(255),
     status VARCHAR(20) DEFAULT 'free',
     total_earnings DECIMAL(15,2) DEFAULT 0,
     balance DECIMAL(15,2) DEFAULT 0,
     referral_code VARCHAR(20) UNIQUE,
     sponsor_id UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     email_verified BOOLEAN DEFAULT FALSE,
     kyc_verified BOOLEAN DEFAULT FALSE
   );

   -- Matrix levels table
   CREATE TABLE matrix_levels (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     level_number INTEGER UNIQUE NOT NULL,
     name VARCHAR(100) NOT NULL,
     price DECIMAL(15,2) NOT NULL,
     positions_per_level INTEGER NOT NULL,
     cycle_bonus DECIMAL(15,2) NOT NULL,
     description TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Matrix positions table
   CREATE TABLE matrix_positions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     level_id UUID REFERENCES matrix_levels(id),
     position_number INTEGER NOT NULL,
     status VARCHAR(20) DEFAULT 'active',
     earnings DECIMAL(15,2) DEFAULT 0,
     cycle_count INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Payments table
   CREATE TABLE payments (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     amount DECIMAL(15,2) NOT NULL,
     currency VARCHAR(10) DEFAULT 'USD',
     payment_method VARCHAR(50) NOT NULL,
     payment_gateway VARCHAR(50) NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     reference_id VARCHAR(255),
     metadata JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Withdrawals table
   CREATE TABLE withdrawals (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     amount DECIMAL(15,2) NOT NULL,
     currency VARCHAR(10) DEFAULT 'USD',
     withdrawal_method VARCHAR(50) NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     processing_fee DECIMAL(15,2) DEFAULT 0,
     net_amount DECIMAL(15,2) NOT NULL,
     metadata JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Transactions table
   CREATE TABLE transactions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     type VARCHAR(50) NOT NULL,
     amount DECIMAL(15,2) NOT NULL,
     currency VARCHAR(10) DEFAULT 'USD',
     status VARCHAR(20) DEFAULT 'pending',
     description TEXT,
     reference_id VARCHAR(255),
     metadata JSONB,
     balance DECIMAL(15,2) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Bonuses table
   CREATE TABLE bonuses (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     type VARCHAR(50) NOT NULL,
     amount DECIMAL(15,2) NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     description TEXT,
     position_id UUID REFERENCES matrix_positions(id),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Payment gateway configurations
   CREATE TABLE payment_gateway_configs (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     gateway VARCHAR(50) UNIQUE NOT NULL,
     is_active BOOLEAN DEFAULT TRUE,
     config JSONB NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create indexes
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_username ON users(username);
   CREATE INDEX idx_users_referral_code ON users(referral_code);
   CREATE INDEX idx_matrix_positions_user_id ON matrix_positions(user_id);
   CREATE INDEX idx_matrix_positions_level_id ON matrix_positions(level_id);
   CREATE INDEX idx_payments_user_id ON payments(user_id);
   CREATE INDEX idx_payments_status ON payments(status);
   CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
   CREATE INDEX idx_withdrawals_status ON withdrawals(status);
   CREATE INDEX idx_transactions_user_id ON transactions(user_id);
   CREATE INDEX idx_bonuses_user_id ON bonuses(user_id);
   ```

4. **Apply Migration**
   ```bash
   supabase db push
   ```

#### **1.3 Configure Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Matrix positions
CREATE POLICY "Users can view own positions" ON matrix_positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own positions" ON matrix_positions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawals
CREATE POLICY "Users can view own withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Bonuses
CREATE POLICY "Users can view own bonuses" ON bonuses
  FOR SELECT USING (auth.uid() = user_id);

-- Matrix levels (public read)
CREATE POLICY "Anyone can view matrix levels" ON matrix_levels
  FOR SELECT USING (true);

-- Payment gateway configs (admin only)
CREATE POLICY "Admin can manage payment gateways" ON payment_gateway_configs
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE status = 'admin'
  ));
```

### **Step 2: Vercel Functions Setup (Option 1)**

#### **2.1 Create API Routes**

Create `api/` directory in your project root:

```typescript
// api/auth/login.ts
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ user: data.user, session: data.session });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

```typescript
// api/matrix/positions.ts
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get user's matrix positions
        const { data: positions, error } = await supabase
          .from('matrix_positions')
          .select(`
            *,
            matrix_levels (*)
          `)
          .eq('user_id', req.headers['user-id']);

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ positions });

      case 'POST':
        // Purchase new matrix position
        const { level_id, position_number } = req.body;

        const { data: position, error: insertError } = await supabase
          .from('matrix_positions')
          .insert({
            user_id: req.headers['user-id'],
            level_id,
            position_number,
          })
          .select()
          .single();

        if (insertError) {
          return res.status(400).json({ error: insertError.message });
        }

        return res.status(201).json({ position });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

#### **2.2 Environment Variables for Vercel**

Add these to your Vercel project:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Payment Gateway Keys
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
COINPAYMENTS_PRIVATE_KEY=your_coinpayments_private_key
NOWPAYMENTS_API_KEY=your_nowpayments_api_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

### **Step 3: Frontend Configuration**

#### **3.1 Update User Panel Environment**

Create `.env.local` in `user-panel/`:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
REACT_APP_API_URL=https://your-vercel-domain.vercel.app/api

# Payment Gateway Keys
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
REACT_APP_COINPAYMENTS_PUBLIC_KEY=your_coinpayments_public_key
REACT_APP_NOWPAYMENTS_API_KEY=your_nowpayments_api_key

# Application Settings
REACT_APP_NAME=Matrix MLM User Panel
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Matrix Configuration
REACT_APP_MATRIX_LEVELS=3
REACT_APP_MATRIX_POSITIONS_PER_LEVEL=3,9,27
REACT_APP_MATRIX_CYCLE_BONUS=100,250,500

# Referral System
REACT_APP_REFERRAL_BONUS_PERCENTAGE=10
REACT_APP_REFERRAL_DEPTH_LIMIT=5

# Withdrawal Settings
REACT_APP_MIN_WITHDRAWAL_AMOUNT=50
REACT_APP_MAX_WITHDRAWAL_AMOUNT=10000
REACT_APP_WITHDRAWAL_FEE_PERCENTAGE=2.5
```

#### **3.2 Update Admin Panel Environment**

Create `.env.local` in `admin-panel/`:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Configuration
REACT_APP_API_URL=https://your-vercel-domain.vercel.app/api

# Payment Gateway Keys
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
REACT_APP_COINPAYMENTS_PUBLIC_KEY=your_coinpayments_public_key
REACT_APP_NOWPAYMENTS_API_KEY=your_nowpayments_api_key

# Application Settings
REACT_APP_NAME=Matrix MLM Admin Panel
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Email Configuration
REACT_APP_SMTP_HOST=smtp.gmail.com
REACT_APP_SMTP_PORT=587
REACT_APP_SMTP_USER=your_email@gmail.com
REACT_APP_SMTP_PASS=your_email_password

# File Upload
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### **Step 4: Deploy to Vercel**

#### **4.1 Deploy User Panel**

```bash
cd user-panel
vercel --prod
```

#### **4.2 Deploy Admin Panel**

```bash
cd admin-panel
vercel --prod
```

#### **4.3 Deploy API Functions**

```bash
# From project root
vercel --prod
```

---

## 🔧 **SUPABASE EDGE FUNCTIONS (Alternative)**

### **Create Edge Functions for Matrix Processing**

```typescript
// supabase/functions/process-matrix/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process matrix positions
    const { data: positions, error } = await supabase
      .from('matrix_positions')
      .select('*')
      .eq('status', 'active')

    if (error) {
      throw error
    }

    // Process each position
    for (const position of positions) {
      // Matrix processing logic here
      // Update earnings, check for cycle completion, etc.
    }

    return new Response(
      JSON.stringify({ success: true, processed: positions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### **Deploy Edge Functions**

```bash
supabase functions deploy process-matrix
```

---

## ⚙️ **CRON JOBS WITH SUPABASE**

### **Option 1: Supabase Cron Jobs**

Create a cron job in Supabase:

```sql
-- Create a function to process matrix
CREATE OR REPLACE FUNCTION process_matrix()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Matrix processing logic here
  -- Update earnings, check cycles, distribute bonuses
END;
$$;

-- Schedule the cron job (every 2 minutes)
SELECT cron.schedule(
  'process-matrix',
  '*/2 * * * *',
  'SELECT process_matrix();'
);
```

### **Option 2: External Cron Service**

Use a service like Cron-job.org or GitHub Actions:

```yaml
# .github/workflows/cron.yml
name: Matrix Processing Cron

on:
  schedule:
    - cron: '*/2 * * * *'  # Every 2 minutes

jobs:
  process-matrix:
    runs-on: ubuntu-latest
    steps:
      - name: Process Matrix
        run: |
          curl -X POST https://your-vercel-domain.vercel.app/api/matrix/process
```

---

## 🔐 **SECURITY CONFIGURATION**

### **1. Supabase RLS Policies**

Ensure all tables have proper RLS policies:

```sql
-- Example: Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### **2. API Route Protection**

```typescript
// Middleware for API routes
import { verifyAuth } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Continue with protected logic
}
```

---

## 📊 **MONITORING & ANALYTICS**

### **1. Supabase Dashboard**

- Monitor database performance
- Check query execution times
- View real-time logs

### **2. Vercel Analytics**

- Enable Vercel Analytics in dashboard
- Monitor frontend performance
- Track user interactions

### **3. Custom Monitoring**

```typescript
// api/health.ts
export default async function handler(req, res) {
  try {
    // Check Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({ 
        status: 'error', 
        database: 'disconnected' 
      });
    }

    return res.status(200).json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}
```

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] Supabase project created and configured
- [ ] Database schema migrated
- [ ] RLS policies configured
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] API routes created and deployed
- [ ] User panel deployed to Vercel
- [ ] Admin panel deployed to Vercel
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Cron jobs configured
- [ ] Payment gateways integrated
- [ ] Email service configured
- [ ] Health checks passing
- [ ] Matrix system processing correctly

---

## 🎉 **SUCCESS INDICATORS**

- ✅ User panel accessible at your Vercel domain
- ✅ Admin panel accessible at admin subdomain
- ✅ Users can register and login via Supabase Auth
- ✅ Matrix positions can be purchased
- ✅ Payments are processed correctly
- ✅ Database operations working
- ✅ Real-time updates functional
- ✅ All features operational

**🚀 Your Matrix MLM System is now deployed on Vercel + Supabase!** 