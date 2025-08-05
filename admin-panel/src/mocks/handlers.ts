import { http, HttpResponse } from 'msw';

// Mock data
const mockSettings = {
  siteName: 'Matrix MLM System',
  siteUrl: 'https://matrixmlm.com',
  adminEmail: 'admin@matrixmlm.com',
  adminUsername: 'admin',
  adminPassword: 'admin123',
  siteMaintenance: false,
  coinPaymentsActive: true,
  coinPaymentsMerchantId: 'demo_merchant_id',
  coinPaymentsPrivateKey: 'demo_private_key',
  coinPaymentsPublicKey: 'demo_public_key',
  coinPaymentsIpnSecret: 'demo_ipn_secret',
  nowPaymentsActive: false,
  nowPaymentsApiKey: '',
  nowPaymentsIpnSecret: '',
  nowPaymentsPayoutCurrency: 'usdt',
  stripeActive: false,
  stripeSecretKey: '',
  stripePublishableKey: '',
  stripeWebhookSecret: '',
  paypalActive: false,
  paypalClientId: '',
  paypalClientSecret: '',
  paypalMode: 'sandbox',
  mailerType: 'php',
  mailServer: '',
  mailPort: 587,
  mailUsername: '',
  mailPassword: '',
  sslRequired: true,
  freeMemberRegistration: true,
  emailConfirmationRequired: false,
  phoneNumberRequired: false,
  tronAddressRequired: false,
  minimumDeposit: 10,
  depositFee: 0,
  eWalletFee: 0,
  referralPercentage: 10,
  defaultMatrixLevel: 1,
  maxPositionsPerLevel: 3,
  matrixWidth: 2,
  matrixDepth: 8,
  referralBonusPercentage: 10,
  matrixBonusPercentage: 5,
  matchingBonusPercentage: 3,
  cycleBonusPercentage: 15,
};

const mockPaymentGatewayConfig = {
  coinpayments: {
    isActive: true,
    config: {
      merchantId: 'demo_merchant_id',
      privateKey: 'demo_private_key',
      publicKey: 'demo_public_key',
      ipnSecret: 'demo_ipn_secret',
    },
  },
  nowpayments: {
    isActive: false,
    config: {
      apiKey: '',
      ipnSecret: '',
      payoutCurrency: 'usdt',
    },
  },
  stripe: {
    isActive: false,
    config: {
      secretKey: '',
      publishableKey: '',
      webhookSecret: '',
    },
  },
  paypal: {
    isActive: false,
    config: {
      clientId: '',
      clientSecret: '',
      mode: 'sandbox',
    },
  },
};

const mockMatrices = [
  {
    id: 'starter',
    name: 'Starter Matrix',
    width: 2,
    depth: 8,
    price: 10,
    currency: 'USD',
    isActive: true,
    referralBonus: 10,
    matrixBonus: 5,
    matchingBonus: 3,
    cycleBonus: 15,
    totalPositions: 255,
    filledPositions: 127,
    completionRate: 49.8,
  },
  {
    id: 'basic',
    name: 'Basic Matrix',
    width: 3,
    depth: 6,
    price: 25,
    currency: 'USD',
    isActive: true,
    referralBonus: 12,
    matrixBonus: 6,
    matchingBonus: 4,
    cycleBonus: 18,
    totalPositions: 364,
    filledPositions: 182,
    completionRate: 50.0,
  },
  {
    id: 'advanced',
    name: 'Advanced Matrix',
    width: 4,
    depth: 5,
    price: 50,
    currency: 'USD',
    isActive: true,
    referralBonus: 15,
    matrixBonus: 8,
    matchingBonus: 5,
    cycleBonus: 20,
    totalPositions: 341,
    filledPositions: 170,
    completionRate: 49.9,
  },
  {
    id: 'master',
    name: 'Master Matrix',
    width: 5,
    depth: 4,
    price: 100,
    currency: 'USD',
    isActive: true,
    referralBonus: 18,
    matrixBonus: 10,
    matchingBonus: 6,
    cycleBonus: 25,
    totalPositions: 156,
    filledPositions: 78,
    completionRate: 50.0,
  },
];

const mockUsers = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    country: 'USA',
    status: 'active',
    joinDate: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-20T14:22:00Z',
    totalEarnings: 1250.50,
    matrixPositions: 8,
    completedCycles: 3,
    referralCount: 12,
    sponsorId: null,
    sponsorUsername: null,
    tronAddress: 'TRx1234567890abcdef',
    emailVerified: true,
    phoneVerified: true,
    kycStatus: 'approved',
    membershipLevel: 'premium',
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1987654321',
    country: 'Canada',
    status: 'active',
    joinDate: '2024-01-10T09:15:00Z',
    lastLogin: '2024-01-19T16:45:00Z',
    totalEarnings: 890.25,
    matrixPositions: 5,
    completedCycles: 2,
    referralCount: 8,
    sponsorId: '1',
    sponsorUsername: 'john_doe',
    tronAddress: 'TRxabcdef1234567890',
    emailVerified: true,
    phoneVerified: false,
    kycStatus: 'pending',
    membershipLevel: 'basic',
  },
  {
    id: '3',
    username: 'mike_wilson',
    email: 'mike@example.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    phone: '+1122334455',
    country: 'UK',
    status: 'pending',
    joinDate: '2024-01-18T11:20:00Z',
    lastLogin: null,
    totalEarnings: 0,
    matrixPositions: 0,
    completedCycles: 0,
    referralCount: 0,
    sponsorId: '2',
    sponsorUsername: 'jane_smith',
    tronAddress: null,
    emailVerified: false,
    phoneVerified: false,
    kycStatus: 'pending',
    membershipLevel: 'free',
  },
];

// MSW Handlers
export const handlers = [
  // Settings API
  http.get('/api/admin/settings', () => {
    return HttpResponse.json(mockSettings);
  }),

  http.post('/api/admin/settings', async ({ request }) => {
    const settings = await request.json();
    return HttpResponse.json({ success: true, message: 'Settings saved successfully' });
  }),

  // Payment Gateway API
  http.get('/api/admin/payment-gateways/config', () => {
    return HttpResponse.json(mockPaymentGatewayConfig);
  }),

  http.post('/api/admin/test-payment-gateway', async ({ request }) => {
    const body = await request.json() as { gateway: string; config: any };
    const { gateway, config } = body;
    return HttpResponse.json({ 
      success: true, 
      message: `${gateway} connection test successful`,
      data: { gateway, config }
    });
  }),

  // Matrix API
  http.get('/api/admin/matrices', () => {
    return HttpResponse.json(mockMatrices);
  }),

  http.get('/api/admin/matrices/:matrixId/config', ({ params }) => {
    const matrix = mockMatrices.find(m => m.id === params.matrixId);
    if (!matrix) {
      return HttpResponse.json({ error: 'Matrix not found' }, { status: 404 });
    }
    return HttpResponse.json(matrix);
  }),

  http.post('/api/admin/matrices/:matrixId/config', async ({ request }) => {
    const config = await request.json();
    return HttpResponse.json({ success: true, message: 'Matrix configuration saved' });
  }),

  // Users API
  http.get('/api/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const membership = url.searchParams.get('membership') || '';
    const kyc = url.searchParams.get('kyc') || '';

    let filteredUsers = mockUsers;

    // Apply filters
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    if (membership && membership !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.membershipLevel === membership);
    }

    if (kyc && kyc !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.kycStatus === kyc);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    });
  }),

  http.get('/api/admin/users/:userId', ({ params }) => {
    const user = mockUsers.find(u => u.id === params.userId);
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.put('/api/admin/users/:userId', async ({ request }) => {
    const userData = await request.json();
    return HttpResponse.json({ success: true, message: 'User updated successfully' });
  }),

  http.delete('/api/admin/users/:userId', () => {
    return HttpResponse.json({ success: true, message: 'User deleted successfully' });
  }),

  http.post('/api/admin/users/bulk-action', async ({ request }) => {
    const body = await request.json() as { userIds: string[]; action: string };
    const { userIds, action } = body;
    return HttpResponse.json({ 
      success: true, 
      message: `Bulk ${action} completed for ${userIds.length} users` 
    });
  }),

  // Transactions API
  http.get('/api/admin/transactions', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';
    const userId = url.searchParams.get('userId') || '';

    // Mock transactions data
    const mockTransactions = [
      {
        id: '1',
        userId: '1',
        username: 'john_doe',
        type: 'deposit',
        amount: 100,
        currency: 'USD',
        status: 'completed',
        gateway: 'coinpayments',
        transactionId: 'CP123456789',
        createdAt: '2024-01-20T10:30:00Z',
        completedAt: '2024-01-20T10:35:00Z',
      },
      {
        id: '2',
        userId: '2',
        username: 'jane_smith',
        type: 'withdrawal',
        amount: 50,
        currency: 'USD',
        status: 'pending',
        gateway: 'nowpayments',
        transactionId: 'NP987654321',
        createdAt: '2024-01-19T14:20:00Z',
        completedAt: null,
      },
    ];

    let filteredTransactions = mockTransactions;

    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }

    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }

    if (userId) {
      filteredTransactions = filteredTransactions.filter(t => t.userId === userId);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    return HttpResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / limit),
      },
    });
  }),

  http.get('/api/admin/transactions/:transactionId', ({ params }) => {
    const transaction = {
      id: params.transactionId,
      userId: '1',
      username: 'john_doe',
      type: 'deposit',
      amount: 100,
      currency: 'USD',
      status: 'completed',
      gateway: 'coinpayments',
      transactionId: 'CP123456789',
      createdAt: '2024-01-20T10:30:00Z',
      completedAt: '2024-01-20T10:35:00Z',
      details: {
        fee: 0,
        networkFee: 0,
        confirmations: 6,
        blockHeight: 12345678,
      },
    };
    return HttpResponse.json(transaction);
  }),

  http.put('/api/admin/transactions/:transactionId', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, message: 'Transaction updated successfully' });
  }),

  // Bonuses API
  http.get('/api/admin/bonuses', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type') || '';
    const userId = url.searchParams.get('userId') || '';

    const mockBonuses = [
      {
        id: '1',
        userId: '1',
        username: 'john_doe',
        type: 'referral',
        amount: 10,
        currency: 'USD',
        status: 'paid',
        description: 'Referral bonus for jane_smith',
        createdAt: '2024-01-20T10:30:00Z',
        paidAt: '2024-01-20T10:35:00Z',
      },
      {
        id: '2',
        userId: '2',
        username: 'jane_smith',
        type: 'matrix',
        amount: 5,
        currency: 'USD',
        status: 'pending',
        description: 'Matrix cycle completion bonus',
        createdAt: '2024-01-19T14:20:00Z',
        paidAt: null,
      },
    ];

    let filteredBonuses = mockBonuses;

    if (type) {
      filteredBonuses = filteredBonuses.filter(b => b.type === type);
    }

    if (userId) {
      filteredBonuses = filteredBonuses.filter(b => b.userId === userId);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBonuses = filteredBonuses.slice(startIndex, endIndex);

    return HttpResponse.json({
      bonuses: paginatedBonuses,
      pagination: {
        page,
        limit,
        total: filteredBonuses.length,
        totalPages: Math.ceil(filteredBonuses.length / limit),
      },
    });
  }),

  http.get('/api/admin/bonuses/:bonusId', ({ params }) => {
    const bonus = {
      id: params.bonusId,
      userId: '1',
      username: 'john_doe',
      type: 'referral',
      amount: 10,
      currency: 'USD',
      status: 'paid',
      description: 'Referral bonus for jane_smith',
      createdAt: '2024-01-20T10:30:00Z',
      paidAt: '2024-01-20T10:35:00Z',
      details: {
        referralId: '2',
        referralUsername: 'jane_smith',
        matrixId: 'starter',
        matrixName: 'Starter Matrix',
      },
    };
    return HttpResponse.json(bonus);
  }),

  // System Stats API
  http.get('/api/admin/stats', () => {
    return HttpResponse.json({
      totalUsers: 1250,
      activeUsers: 980,
      pendingUsers: 45,
      suspendedUsers: 25,
      totalDeposits: 125000,
      totalWithdrawals: 89000,
      totalBonuses: 15000,
      systemUptime: 99.8,
      lastBackup: '2024-01-20T02:00:00Z',
      databaseSize: '2.5GB',
    });
  }),

  http.get('/api/admin/dashboard-stats', () => {
    return HttpResponse.json({
      memberStats: {
        totalMembers: '1,250',
        activeMembers: '980',
        pendingMembers: '45',
        newMembersToday: '12',
        newMembersThisWeek: '89',
        newMembersThisMonth: '234',
      },
      boardStats: {
        totalBoards: '4',
        activeBoards: '4',
        totalPositions: '1,116',
        filledPositions: '557',
        completionRate: '49.9%',
        averageCycleTime: '15.2 days',
      },
      financialStats: {
        totalDeposits: '$125,000',
        totalWithdrawals: '$89,000',
        totalBonuses: '$15,000',
        pendingDeposits: '$2,500',
        pendingWithdrawals: '$1,800',
        systemBalance: '$36,500',
      },
      promotionalStats: {
        totalBanners: '24',
        activeBanners: '18',
        totalTextAds: '156',
        activeTextAds: '142',
        totalClicks: '45,678',
        totalImpressions: '234,567',
        clickThroughRate: '19.5%',
      },
      systemStatus: {
        systemUptime: '99.8%',
        lastBackup: '2 hours ago',
        databaseSize: '2.5GB',
        serverLoad: '45%',
        memoryUsage: '67%',
        diskUsage: '78%',
        activeConnections: '234',
        averageResponseTime: '120ms',
      },
    });
  }),

  // Backup & Reset API
  http.post('/api/admin/backup', () => {
    return HttpResponse.json({ 
      success: true, 
      message: 'Database backup created successfully',
      backupId: 'backup_20240120_143000',
      downloadUrl: '/api/admin/backup/download/backup_20240120_143000',
    });
  }),

  http.post('/api/admin/reset', () => {
    return HttpResponse.json({ 
      success: true, 
      message: 'System reset completed successfully' 
    });
  }),

  // Logs API
  http.get('/api/admin/logs', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type') || '';
    const level = url.searchParams.get('level') || '';

    const mockLogs = [
      {
        id: '1',
        timestamp: '2024-01-20T14:30:00Z',
        level: 'info',
        type: 'user',
        message: 'User john_doe logged in',
        userId: '1',
        username: 'john_doe',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
      },
      {
        id: '2',
        timestamp: '2024-01-20T14:25:00Z',
        level: 'warning',
        type: 'system',
        message: 'High memory usage detected',
        details: { memoryUsage: '85%', threshold: '80%' },
      },
    ];

    let filteredLogs = mockLogs;

    if (type) {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return HttpResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit),
      },
    });
  }),

  // Email API
  http.post('/api/admin/email/send', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: 'msg_123456789',
    });
  }),

  http.get('/api/admin/email/templates', () => {
    return HttpResponse.json([
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to Matrix MLM System',
        body: 'Welcome to our platform...',
        variables: ['username', 'firstName', 'lastName'],
      },
      {
        id: 'verification',
        name: 'Email Verification',
        subject: 'Verify your email address',
        body: 'Please verify your email...',
        variables: ['username', 'verificationLink'],
      },
    ]);
  }),

  http.post('/api/admin/email/templates', async ({ request }) => {
    const template = await request.json();
    return HttpResponse.json({ 
      success: true, 
      message: 'Email template saved successfully' 
    });
  }),
]; 