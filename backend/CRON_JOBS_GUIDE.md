# Cron Jobs Guide

This guide explains how to add and manage cron jobs in the Matrix MLM system.

## Overview

Cron jobs are scheduled tasks that run automatically at specified intervals. They are managed by the `CronService` class located in `backend/src/services/CronService.js`.

## Existing Cron Jobs

The system currently has the following cron jobs:

1. **Matrix Processing** - Runs every hour (`0 * * * *`)
   - Processes matrix queue entries
   - Handles cycle completions
   - Distributes bonuses

2. **Payment Processing** - Runs every 15 minutes (`*/15 * * * *`)
   - Processes pending payments
   - Approves deposits
   - Updates transaction statuses

3. **Withdrawal Processing** - Runs every 30 minutes (`*/30 * * * *`)
   - Processes withdrawal requests
   - Updates withdrawal statuses

4. **Email Processing** - Runs every 5 minutes (`*/5 * * * *`)
   - Sends welcome emails for new users
   - Processes email queue

5. **Database Cleanup** - Runs daily at 2 AM (`0 2 * * *`)
   - Cleans up old logs
   - Removes expired data

6. **System Health Check** - Runs every 10 minutes (`*/10 * * * *`)
   - Checks system status
   - Monitors database connections

## Cron Schedule Format

Cron jobs use the standard cron format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, where 0 and 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Common Schedule Examples

- `0 * * * *` - Every hour at minute 0
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1` - Every Monday at 9 AM
- `0 0 1 * *` - First day of every month at midnight

## How to Add a New Cron Job

### Step 1: Create the Task Function

Add your task function to `CronService.js`:

```javascript
// Example: Daily bonus calculation
async calculateDailyBonuses() {
  try {
    console.log('Calculating daily bonuses...');
    
    // Your logic here
    const [eligibleUsers] = await db.execute(
      'SELECT * FROM users WHERE status = "active" AND last_bonus_date < DATE_SUB(NOW(), INTERVAL 1 DAY)'
    );
    
    for (const user of eligibleUsers) {
      // Calculate and award bonus
      // ...
    }
    
    console.log(`Calculated bonuses for ${eligibleUsers.length} users`);
  } catch (error) {
    console.error('Error calculating daily bonuses:', error);
    throw error;
  }
}
```

### Step 2: Register the Cron Job

Add your cron job in the `initialize()` method:

```javascript
async initialize() {
  console.log('Initializing cron jobs...');
  
  // ... existing jobs ...
  
  // Daily bonus calculation - runs daily at 6 AM
  this.scheduleJob('daily-bonus-calculation', '0 6 * * *', async () => {
    await this.calculateDailyBonuses();
  });
  
  console.log('All cron jobs initialized successfully');
}
```

### Step 3: (Optional) Add Manual Trigger Endpoint

For testing purposes, you can add a manual trigger endpoint in `server.js`:

```javascript
app.post('/api/cron/trigger-daily-bonus', async (req, res) => {
  try {
    await CronService.calculateDailyBonuses();
    res.json({ success: true, message: 'Daily bonus calculation triggered' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Cron Job Best Practices

1. **Error Handling**: Always wrap your logic in try-catch blocks
2. **Logging**: Log start and completion of jobs for debugging
3. **Idempotency**: Ensure jobs can be run multiple times safely
4. **Performance**: Consider processing in batches for large datasets
5. **Locking**: Use database locks to prevent concurrent execution

### Example with Locking:

```javascript
async processWithLock(name, task) {
  try {
    // Check if job is already running
    const [status] = await db.execute(
      'SELECT * FROM cronjobs WHERE name = ? AND status = "running"',
      [name]
    );
    
    if (status.length > 0) {
      console.log(`${name} already running, skipping...`);
      return;
    }
    
    // Mark as running
    await db.execute(
      `INSERT INTO cronjobs (name, status, start_time, last_run) 
       VALUES (?, 'running', NOW(), NOW()) 
       ON DUPLICATE KEY UPDATE status = 'running', start_time = NOW()`,
      [name]
    );
    
    // Execute task
    await task();
    
    // Mark as completed
    await db.execute(
      'UPDATE cronjobs SET status = "completed", end_time = NOW() WHERE name = ?',
      [name]
    );
  } catch (error) {
    // Mark as failed
    await db.execute(
      'UPDATE cronjobs SET status = "failed", end_time = NOW(), error = ? WHERE name = ?',
      [error.message, name]
    );
    throw error;
  }
}
```

## Managing Cron Jobs

### Get Job Status

```javascript
const jobStatus = CronService.getJobStatus();
console.log(jobStatus);
```

### Stop a Job

```javascript
CronService.stopJob('job-name');
```

### Stop All Jobs

```javascript
CronService.stopAllJobs();
```

### Check if Job Exists

```javascript
const exists = CronService.jobs.has('job-name');
```

## Testing Cron Jobs

1. **Manual Trigger**: Use the manual trigger endpoints for testing
2. **Short Schedule**: Temporarily use a short schedule (e.g., `*/1 * * * *` for every minute)
3. **Logs**: Monitor console logs for job execution
4. **Database**: Check database tables for expected changes

## Common Use Cases

### 1. Daily Reports

```javascript
this.scheduleJob('daily-reports', '0 8 * * *', async () => {
  await this.generateDailyReports();
});
```

### 2. Weekly Cleanup

```javascript
this.scheduleJob('weekly-cleanup', '0 3 * * 0', async () => {
  await this.weeklyCleanup();
});
```

### 3. Monthly Calculations

```javascript
this.scheduleJob('monthly-calculations', '0 0 1 * *', async () => {
  await this.calculateMonthlyBonuses();
});
```

### 4. Real-time Processing (Every Minute)

```javascript
this.scheduleJob('realtime-processing', '* * * * *', async () => {
  await this.processRealtimeQueue();
});
```

## Monitoring

Monitor cron job execution through:
- Console logs
- Database `cronjobs` table
- System status endpoint: `/api/system/status`

## Troubleshooting

1. **Job not running**: Check if job is scheduled and not stopped
2. **Job failing**: Check error logs and database status
3. **Concurrent execution**: Ensure proper locking mechanism
4. **Memory issues**: Process in batches for large datasets

## Notes

- All cron jobs run in UTC timezone
- Jobs are automatically restarted on server restart
- Use database transactions for critical operations
- Consider using job queues (like Bull) for complex workflows

