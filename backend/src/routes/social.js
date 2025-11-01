const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Generate OAuth state token
const generateState = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ============ SOCIAL LOGIN ============

// Initiate social login
router.post('/auth/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { redirectUri } = req.body;

    const validProviders = ['facebook', 'google', 'twitter', 'linkedin'];
    
    if (!validProviders.includes(provider.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider'
      });
    }

    const state = generateState();
    let authUrl = '';

    switch (provider.toLowerCase()) {
      case 'facebook':
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri || process.env.FACEBOOK_REDIRECT_URI)}&state=${state}&scope=email,public_profile`;
        break;
      case 'google':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri || process.env.GOOGLE_REDIRECT_URI)}&response_type=code&scope=openid email profile&state=${state}`;
        break;
      case 'twitter':
        // Twitter OAuth 2.0
        authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri || process.env.TWITTER_REDIRECT_URI)}&scope=tweet.read users.read&state=${state}`;
        break;
      case 'linkedin':
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri || process.env.LINKEDIN_REDIRECT_URI)}&state=${state}&scope=openid profile email`;
        break;
    }

    // Store state in session/cache (in production, use Redis)
    // For now, return it to client to verify on callback

    res.json({
      success: true,
      data: {
        authUrl,
        state,
        provider: provider.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate social login'
    });
  }
});

// OAuth callback
router.get('/auth/:provider/callback', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code required'
      });
    }

    // In production, verify state token here
    // Exchange code for access token
    // Then fetch user info from provider
    // Create or update user account

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // TODO: Implement actual OAuth flow with provider APIs
      // For now, return success
      
      // Example: Create user or return existing
      const mockUser = {
        id: 'social-user-' + Date.now(),
        email: `user@${provider}.com`,
        username: `social_user_${Date.now()}`,
        provider: provider.toLowerCase()
      };

      await prisma.$disconnect();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: mockUser.id, 
          username: mockUser.username,
          role: 'user' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Social login successful',
        data: {
          user: mockUser,
          token
        }
      });
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process OAuth callback'
      });
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process OAuth callback'
    });
  }
});

// ============ SOCIAL SHARING ============

// Share content
router.post('/share', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { platform, content, url, title, description, image } = req.body;

    const validPlatforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram'];
    
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform'
      });
    }

    let shareUrl = '';

    switch (platform.toLowerCase()) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        const tweetText = title || content || '';
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        const whatsappText = `${title || ''} ${url}`.trim();
        shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        break;
      case 'telegram':
        const telegramText = `${title || ''}\n${description || ''}\n${url}`.trim();
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(telegramText)}`;
        break;
    }

    // Track share in database
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Create share record (if you have a SocialShare table)
      // For now, just return the share URL

      await prisma.$disconnect();
    } catch (error) {
      console.error('Track share error:', error);
      // Continue even if tracking fails
    }

    res.json({
      success: true,
      data: {
        platform: platform.toLowerCase(),
        shareUrl,
        url,
        title,
        description
      }
    });
  } catch (error) {
    console.error('Share content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate share URL'
    });
  }
});

// Get social post templates
router.get('/posts/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'referral-success',
        name: 'Referral Success',
        title: 'Join me on this amazing platform!',
        content: 'I just earned ${amount} from referrals. Join me and start earning too!',
        hashtags: ['#MLM', '#EarnMoney', '#Referral'],
        platforms: ['facebook', 'twitter', 'linkedin']
      },
      {
        id: 'rank-achievement',
        name: 'Rank Achievement',
        title: 'I just achieved ${rank} rank!',
        content: 'Excited to announce I\'ve reached ${rank} rank. Thank you to my amazing team!',
        hashtags: ['#Success', '#Achievement', '#MLM'],
        platforms: ['facebook', 'twitter', 'linkedin']
      },
      {
        id: 'cycle-completion',
        name: 'Cycle Completion',
        title: 'Just completed another cycle!',
        content: 'Completed cycle ${cycleNumber} and earned ${amount}. This system works!',
        hashtags: ['#MLM', '#Success', '#Earnings'],
        platforms: ['facebook', 'twitter']
      },
      {
        id: 'welcome-new-member',
        name: 'Welcome New Member',
        title: 'Welcome to our amazing community!',
        content: 'Join ${platformName} and start your journey to financial freedom today!',
        hashtags: ['#JoinUs', '#MLM', '#Opportunity'],
        platforms: ['facebook', 'twitter', 'linkedin', 'whatsapp']
      },
      {
        id: 'custom',
        name: 'Custom Template',
        title: '',
        content: '',
        hashtags: [],
        platforms: ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram']
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
});

// Generate custom share content
router.post('/posts/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { templateId, variables, platform } = req.body;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get user data for variables
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          totalEarnings: true,
          referralLinks: {
            where: { isActive: true },
            take: 1,
            select: { url: true }
          }
        }
      });

      // Get template
      const templates = [
        {
          id: 'referral-success',
          title: `Join me on ${process.env.PLATFORM_NAME || 'this platform'}!`,
          content: `I just earned ${variables?.amount || parseFloat(user?.totalEarnings.toString() || '0')} from referrals. Join me and start earning too!`,
          hashtags: ['#MLM', '#EarnMoney', '#Referral']
        },
        {
          id: 'rank-achievement',
          title: `I just achieved ${variables?.rank || 'new'} rank!`,
          content: `Excited to announce I've reached ${variables?.rank || 'new'} rank. Thank you to my amazing team!`,
          hashtags: ['#Success', '#Achievement', '#MLM']
        },
        {
          id: 'cycle-completion',
          title: 'Just completed another cycle!',
          content: `Completed cycle ${variables?.cycleNumber || '1'} and earned ${variables?.amount || '0'}. This system works!`,
          hashtags: ['#MLM', '#Success', '#Earnings']
        },
        {
          id: 'welcome-new-member',
          title: 'Welcome to our amazing community!',
          content: `Join ${process.env.PLATFORM_NAME || 'our platform'} and start your journey to financial freedom today!`,
          hashtags: ['#JoinUs', '#MLM', '#Opportunity']
        }
      ];

      const template = templates.find(t => t.id === templateId) || templates.find(t => t.id === 'custom');

      const referralUrl = user?.referralLinks[0]?.url || `${process.env.FRONTEND_URL}/register?ref=${user?.username}`;

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          title: template.title,
          content: template.content,
          hashtags: template.hashtags,
          url: referralUrl,
          shareUrl: platform 
            ? await generateShareUrl(platform, {
                title: template.title,
                content: template.content,
                url: referralUrl
              })
            : null
        }
      });
    } catch (error) {
      console.error('Generate post error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate post'
      });
    }
  } catch (error) {
    console.error('Generate post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate post'
    });
  }
});

// Helper function to generate share URLs
async function generateShareUrl(platform, { title, content, url }) {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case 'twitter':
      const tweetText = `${title}\n${content}`.trim();
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    case 'whatsapp':
      const whatsappText = `${title}\n${content}\n${url}`.trim();
      return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    case 'telegram':
      const telegramText = `${title}\n${content}\n${url}`.trim();
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(telegramText)}`;
    default:
      return url;
  }
}

// Get social proof (success stories, testimonials)
router.get('/proof', async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get top earners as success stories
      const topEarners = await prisma.user.findMany({
        where: {
          isActive: true,
          totalEarnings: { gt: 0 }
        },
        orderBy: { totalEarnings: 'desc' },
        take: 10,
        select: {
          id: true,
          username: true,
          totalEarnings: true,
          memberType: true,
          createdAt: true
        }
      });

      // Get recent signups
      const recentSignups = await prisma.user.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          username: true,
          createdAt: true
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          successStories: topEarners.map(user => ({
            username: user.username,
            earnings: parseFloat(user.totalEarnings.toString()),
            memberType: user.memberType,
            joinedDate: user.createdAt
          })),
          recentSignups: recentSignups.map(user => ({
            username: user.username,
            joinedDate: user.createdAt
          }))
        }
      });
    } catch (error) {
      console.error('Get social proof error:', error);
      res.json({
        success: true,
        data: {
          successStories: [],
          recentSignups: []
        }
      });
    }
  } catch (error) {
    console.error('Get social proof error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get social proof'
    });
  }
});

module.exports = router;

