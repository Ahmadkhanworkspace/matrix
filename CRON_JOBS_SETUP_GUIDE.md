# 🕐 Cron Jobs Setup Guide

## ✅ Cron Jobs Already Configured!

Your system already has cron jobs set up in `backend/src/services/CronService.js`. They are automatically initialized when the backend server starts.

---

## 📋 Current Cron Jobs

### 1. **Payment Processing** 
- **Schedule:** Every minute (`* * * * *`)
- **Function:** `processPendingPayments()`
- **What it does:** Processes pending payment transactions

### 2. **Matrix Processing**
- **Schedule:** Every 5 minutes (`*/5 * * * *`)
- **Function:** `processMatrixQueue()`
- **What it does:** Processes matrix queue entries, handles cycle completions

### 3. **Withdrawal Processing**
- **Schedule:** Every 2 minutes (`*/2 * * * *`)
- **Function:** `processPendingWithdrawals()`
- **What it does:** Processes pending withdrawal requests

### 4. **Email Processing**
- **Schedule:** Every 2 minutes (`*/2 * * * *`)
- **Function:** `processEmailQueue()`
- **What it does:** Sends welcome emails and processes email queue

### 5. **Database Cleanup**
- **Schedule:** Daily at 2 AM (`0 2 * * *`)
- **Function:** `cleanupDatabase()`
- **What it does:** Cleans up old logs and expired data

### 6. **System Health Check**
- **Schedule:** Every 10 minutes (`*/10 * * * *`)
- **Function:** `performHealthCheck()`
- **What it does:** Monitors database and system status

---

## ⚙️ How Cron Jobs Work

Cron jobs are initialized in `backend/src/server.js`:

```javascript
// In initializeSystem() function:
await CronService.initialize();
```

They run automatically in the background when your server starts.

---

## 🔧 Update CronService for Prisma

**Current Issue:** CronService uses MySQL queries, but you're using Prisma/Supabase.

**File to Update:** `backend/src/services/CronService.js`

**Changes Needed:**
1. Replace MySQL queries with Prisma queries
2. Update database connection checks
3. Adapt queries to Prisma syntax

### Example: Update Matrix Processing

**Before (MySQL):**
```javascript
const [cronStatus] = await db.execute(
  'SELECT * FROM cronjobs WHERE name = "matrix_processing" AND status = "running"'
);
```

**After (Prisma):**
```javascript
const cronStatus = await prisma.cronJob.findFirst({
  where: {
    name: 'matrix_processing',
    active: true // or use status field if available
  }
});
```

---

## 📝 Steps to Update for Prisma

### Step 1: Add Prisma Client to CronService

```javascript
// At top of CronService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
```

### Step 2: Update Database Queries

Replace all `db.execute()` calls with Prisma queries:
- `db.execute('SELECT ...')` → `prisma.model.findMany({ where: ... })`
- `db.execute('INSERT ...')` → `prisma.model.create({ data: ... })`
- `db.execute('UPDATE ...')` → `prisma.model.update({ where: ..., data: ... })`

### Step 3: Update Model Names

Match Prisma schema model names:
- `users` → `prisma.user`
- `transaction` → `prisma.transaction`
- `wtransaction` → `prisma.withdrawalTransaction`
- `verifier` → `prisma.verifier`
- `cronjobs` → `prisma.cronJob`

---

## ✅ Verify Cron Jobs Are Running

### Check Backend Logs

When backend starts, you should see:
```
Initializing cron jobs...
Scheduled cron job: payment-processing with schedule: * * * * *
Scheduled cron job: matrix-processing with schedule: */5 * * * *
...
All cron jobs initialized successfully
```

### Manual Trigger (for Testing)

You can manually trigger cron jobs via API if you add these routes:

```javascript
// In backend/src/server.js or routes file
app.post('/api/cron/trigger-matrix', async (req, res) => {
  await CronService.triggerMatrixProcessing();
  res.json({ success: true });
});

app.post('/api/cron/trigger-payment', async (req, res) => {
  await CronService.triggerPaymentProcessing();
  res.json({ success: true });
});

app.get('/api/cron/status', (req, res) => {
  const status = CronService.getJobStatus();
  res.json({ success: true, data: status });
});
```

---

## 🚨 Important Notes

1. **Database Connection:** CronService currently uses MySQL. Update it to use Prisma when switching to Supabase.
2. **Error Handling:** All cron jobs have try-catch blocks and log errors.
3. **Timezone:** All cron jobs run in UTC timezone.
4. **Restart:** Cron jobs restart automatically when server restarts.

---

## 📚 Related Files

- `backend/src/services/CronService.js` - Cron job service
- `backend/src/server.js` - Initialization
- `backend/CRON_JOBS_GUIDE.md` - Detailed cron job documentation

---

## 🎯 Next Steps

1. ✅ Verify cron jobs are running (check logs)
2. ⚠️ Update CronService to use Prisma (if using Supabase)
3. ✅ Test manual triggers (optional)
4. ✅ Monitor cron job logs

