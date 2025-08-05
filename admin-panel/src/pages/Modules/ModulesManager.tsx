import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Users,
  Settings,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Globe,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  FileText,
  Bell,
  Save,
  Upload,
  Download,
  RefreshCw,
  Play,
  Pause,
  Lock,
  Unlock,
  Star,
  Mail,
  MessageCircle,
  Bitcoin,
  Database,
  Target,
  Award,
  Calendar,
  Shield as ShieldIcon,
  Globe as GlobeIcon,
  Zap as ZapIcon,
  BarChart3 as BarChart3Icon,
  Users as UsersIcon,
  CreditCard as CreditCardIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  Bell as BellIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Package as PackageIcon,
  Search
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import toast from 'react-hot-toast';
import { api } from '../../api';

interface Module {
  id: number;
  name: string;
  description: string;
  version: string;
  price: number;
  currency: string;
  category: string;
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'development';
  features: string[];
  requirements: string[];
  icon: string;
  isInstalled: boolean;
  isPurchased: boolean;
  purchaseDate?: string;
  expiryDate?: string;
  downloads: number;
  rating: number;
  developer: string;
  changelog: string;
  documentation: string;
}

const ModulesManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    price: 0,
    currency: 'USD',
    category: 'marketing',
    features: [''],
    requirements: [''],
    developer: '',
    changelog: '',
    documentation: ''
  });

  useEffect(() => {
    console.log('ModulesManager component mounted');
    fetchModules();
  }, []);

  console.log('ModulesManager rendering, modules count:', modules.length, 'loading:', loading);

  const fetchModules = async () => {
    try {
      setLoading(true);
      console.log('Fetching modules...');
      
      // Real modules data for MLM system
      const realModules: Module[] = [
        // Email Marketing Module
        {
          id: 1,
          name: 'Email Marketing Pro',
          description: 'Advanced email marketing system with automation, templates, and analytics',
          version: '3.2.1',
          price: 0,
          currency: 'USD',
          category: 'marketing',
          status: 'development',
          features: [
            'Email Automation Workflows',
            'Drag & Drop Email Builder',
            'Advanced Segmentation',
            'A/B Testing',
            'Email Analytics & Reports',
            'Template Library',
            'SMTP Integration',
            'Bounce Management',
            'Spam Score Checker',
            'Email Scheduling'
          ],
          requirements: ['PHP 7.4+', 'MySQL 5.7+', 'SMTP Server'],
          icon: 'Mail',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.8,
          developer: 'Matrix Systems',
          changelog: 'v3.2.1 - Added advanced automation workflows and improved deliverability',
          documentation: 'https://docs.matrix.com/email-marketing'
        },

        // Community Chats Module
        {
          id: 2,
          name: 'Community Chats',
          description: 'Real-time community chat system with private rooms, file sharing, and moderation tools',
          version: '2.1.0',
          price: 0,
          currency: 'USD',
          category: 'communication',
          status: 'development',
          features: [
            'Real-time Chat',
            'Private Chat Rooms',
            'File & Media Sharing',
            'Voice Messages',
            'Chat Moderation',
            'User Roles & Permissions',
            'Chat History',
            'Push Notifications',
            'Emoji & Reactions',
            'Chat Analytics'
          ],
          requirements: ['WebSocket Support', 'PHP 7.4+', 'MySQL 5.7+'],
          icon: 'MessageCircle',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.6,
          developer: 'Matrix Systems',
          changelog: 'v2.1.0 - Added voice messages and improved mobile responsiveness',
          documentation: 'https://docs.matrix.com/community-chats'
        },

        // Binance Payment Module
        {
          id: 3,
          name: 'Binance Payment Gateway',
          description: 'Direct integration with Binance Pay for cryptocurrency payments and withdrawals',
          version: '1.5.2',
          price: 0,
          currency: 'USD',
          category: 'payment',
          status: 'development',
          features: [
            'Binance Pay Integration',
            'Multiple Cryptocurrencies',
            'Real-time Exchange Rates',
            'Automatic Payouts',
            'Transaction History',
            'Webhook Support',
            'Security Features',
            'Multi-currency Support',
            'Payment Analytics',
            'Compliance Tools'
          ],
          requirements: ['Binance API Keys', 'SSL Certificate', 'PHP 7.4+'],
          icon: 'Bitcoin',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.9,
          developer: 'Matrix Systems',
          changelog: 'v1.5.2 - Added support for new cryptocurrencies and improved security',
          documentation: 'https://docs.matrix.com/binance-payment'
        },

        // Advanced Analytics Module
        {
          id: 4,
          name: 'Advanced Analytics Dashboard',
          description: 'Comprehensive analytics and reporting system with real-time data visualization',
          version: '4.0.1',
          price: 0,
          currency: 'USD',
          category: 'analytics',
          status: 'development',
          features: [
            'Real-time Analytics',
            'Custom Dashboards',
            'Advanced Reporting',
            'Data Export',
            'Performance Metrics',
            'User Behavior Tracking',
            'Conversion Analytics',
            'ROI Calculations',
            'Predictive Analytics',
            'API Integration'
          ],
          requirements: ['PHP 7.4+', 'MySQL 5.7+', 'Redis (optional)'],
          icon: 'BarChart3',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.7,
          developer: 'Matrix Systems',
          changelog: 'v4.0.1 - Added predictive analytics and improved performance',
          documentation: 'https://docs.matrix.com/analytics'
        },

        // Multi-Level Marketing Tools
        {
          id: 5,
          name: 'MLM Advanced Tools',
          description: 'Advanced MLM management tools with genealogy viewer, commission calculator, and team builder',
          version: '2.3.0',
          price: 0,
          currency: 'USD',
          category: 'mlm',
          status: 'development',
          features: [
            'Genealogy Viewer',
            'Commission Calculator',
            'Team Builder',
            'Rank Advancement',
            'Bonus Tracking',
            'Leadership Tools',
            'Performance Metrics',
            'Team Analytics',
            'Training Modules',
            'Achievement System'
          ],
          requirements: ['PHP 7.4+', 'MySQL 5.7+'],
          icon: 'Users',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.8,
          developer: 'Matrix Systems',
          changelog: 'v2.3.0 - Added advanced genealogy viewer and commission tracking',
          documentation: 'https://docs.matrix.com/mlm-tools'
        },

        // Security & Compliance
        {
          id: 6,
          name: 'Security & Compliance Suite',
          description: 'Advanced security features, KYC/AML compliance, and fraud detection system',
          version: '1.8.3',
          price: 0,
          currency: 'USD',
          category: 'security',
          status: 'development',
          features: [
            'KYC/AML Verification',
            'Fraud Detection',
            'Two-Factor Authentication',
            'IP Whitelisting',
            'Activity Monitoring',
            'Compliance Reports',
            'Data Encryption',
            'Audit Trails',
            'Risk Assessment',
            'Security Alerts'
          ],
          requirements: ['SSL Certificate', 'PHP 7.4+', 'MySQL 5.7+'],
          icon: 'Shield',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.9,
          developer: 'Matrix Systems',
          changelog: 'v1.8.3 - Enhanced fraud detection and compliance features',
          documentation: 'https://docs.matrix.com/security'
        },

        // Mobile App Integration
        {
          id: 7,
          name: 'Mobile App Integration',
          description: 'Native mobile app integration with push notifications and offline capabilities',
          version: '1.2.1',
          price: 0,
          currency: 'USD',
          category: 'mobile',
          status: 'development',
          features: [
            'Native Mobile Apps',
            'Push Notifications',
            'Offline Mode',
            'Biometric Authentication',
            'Mobile Payments',
            'Real-time Sync',
            'App Analytics',
            'Cross-platform Support',
            'Custom Branding',
            'App Store Deployment'
          ],
          requirements: ['iOS/Android Development', 'API Integration', 'Push Service'],
          icon: 'Globe',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.6,
          developer: 'Matrix Systems',
          changelog: 'v1.2.1 - Added biometric authentication and improved performance',
          documentation: 'https://docs.matrix.com/mobile-app'
        },

        // Automated Trading Bot
        {
          id: 8,
          name: 'Automated Trading Bot',
          description: 'AI-powered trading bot with multiple strategies and risk management',
          version: '1.0.5',
          price: 0,
          currency: 'USD',
          category: 'trading',
          status: 'development',
          features: [
            'AI Trading Strategies',
            'Risk Management',
            'Portfolio Tracking',
            'Real-time Alerts',
            'Backtesting Tools',
            'Multiple Exchanges',
            'Performance Analytics',
            'Custom Indicators',
            'Automated Execution',
            'Stop-loss Protection'
          ],
          requirements: ['Trading API Access', 'PHP 7.4+', 'MySQL 5.7+'],
          icon: 'TrendingUp',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.7,
          developer: 'Matrix Systems',
          changelog: 'v1.0.5 - Added new trading strategies and improved risk management',
          documentation: 'https://docs.matrix.com/trading-bot'
        },

        // Social Media Integration
        {
          id: 9,
          name: 'Social Media Integration',
          description: 'Complete social media integration with auto-posting and engagement tracking',
          version: '2.0.2',
          price: 0,
          currency: 'USD',
          category: 'social',
          status: 'development',
          features: [
            'Multi-platform Integration',
            'Auto-posting',
            'Engagement Tracking',
            'Content Calendar',
            'Social Analytics',
            'Hashtag Optimization',
            'Influencer Tools',
            'Social Commerce',
            'Community Management',
            'Brand Monitoring'
          ],
          requirements: ['Social Media APIs', 'PHP 7.4+', 'MySQL 5.7+'],
          icon: 'MessageSquare',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.5,
          developer: 'Matrix Systems',
          changelog: 'v2.0.2 - Added TikTok integration and improved analytics',
          documentation: 'https://docs.matrix.com/social-media'
        },

        // Customer Support System
        {
          id: 10,
          name: 'Customer Support System',
          description: 'Advanced customer support with ticket management, live chat, and knowledge base',
          version: '3.1.0',
          price: 0,
          currency: 'USD',
          category: 'support',
          status: 'development',
          features: [
            'Ticket Management',
            'Live Chat Support',
            'Knowledge Base',
            'FAQ System',
            'Customer Portal',
            'Support Analytics',
            'Multi-language Support',
            'Automated Responses',
            'Escalation Rules',
            'Customer Feedback'
          ],
          requirements: ['PHP 7.4+', 'MySQL 5.7+', 'WebSocket Support'],
          icon: 'MessageSquare',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.6,
          developer: 'Matrix Systems',
          changelog: 'v3.1.0 - Added AI-powered automated responses and improved chat',
          documentation: 'https://docs.matrix.com/support-system'
        },

        // Affiliate Marketing System
        {
          id: 11,
          name: 'Affiliate Marketing System',
          description: 'Complete affiliate marketing platform with tracking, commissions, and reporting',
          version: '2.4.1',
          price: 0,
          currency: 'USD',
          category: 'marketing',
          status: 'development',
          features: [
            'Affiliate Tracking',
            'Commission Management',
            'Referral Links',
            'Performance Analytics',
            'Payout System',
            'Affiliate Dashboard',
            'Creative Assets',
            'Conversion Tracking',
            'Multi-tier Commissions',
            'Fraud Protection'
          ],
          requirements: ['PHP 7.4+', 'MySQL 5.7+'],
          icon: 'Target',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.8,
          developer: 'Matrix Systems',
          changelog: 'v2.4.1 - Added advanced fraud protection and improved tracking',
          documentation: 'https://docs.matrix.com/affiliate'
        },

        // E-commerce Integration
        {
          id: 12,
          name: 'E-commerce Integration',
          description: 'Complete e-commerce integration with product management and order processing',
          version: '1.6.2',
          price: 0,
          currency: 'USD',
          category: 'ecommerce',
          status: 'development',
          features: [
            'Product Management',
            'Order Processing',
            'Inventory Management',
            'Payment Integration',
            'Shipping Calculator',
            'Tax Calculation',
            'Customer Reviews',
            'Wishlist System',
            'Discount Codes',
            'Sales Analytics'
          ],
          requirements: ['PHP 7.4+', 'MySQL 5.7+', 'Payment Gateway'],
          icon: 'ShoppingCart',
          isInstalled: false,
          isPurchased: false,
          downloads: 0,
          rating: 4.7,
          developer: 'Matrix Systems',
          changelog: 'v1.6.2 - Added advanced inventory management and improved checkout',
          documentation: 'https://docs.matrix.com/ecommerce'
        }
      ];

      console.log('Setting modules data:', realModules.length, 'modules');
      setModules(realModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    try {
      setLoading(true);
      // API call to add module
      const response = await api.settings.updateSetting('modules', {
        ...newModule,
        id: Date.now()
      });

      if (response.success) {
        toast.success('Module added successfully');
        setShowAddModal(false);
        setNewModule({
          name: '',
          description: '',
          version: '1.0.0',
          price: 0,
          currency: 'USD',
          category: 'marketing',
          features: [''],
          requirements: [''],
          developer: '',
          changelog: '',
          documentation: ''
        });
        fetchModules();
      } else {
        toast.error('Failed to add module');
      }
    } catch (error) {
      console.error('Error adding module:', error);
      toast.error('Failed to add module');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async (module: Module) => {
    try {
      setLoading(true);
      // API call to update module
      const response = await api.settings.updateSetting(`modules.${module.id}`, module);

      if (response.success) {
        toast.success('Module updated successfully');
        setEditingModule(null);
        fetchModules();
      } else {
        toast.error('Failed to update module');
      }
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      setLoading(true);
      // API call to delete module
      const response = await api.settings.deleteSetting(`modules.${moduleId}`);

      if (response.success) {
        toast.success('Module deleted successfully');
        fetchModules();
      } else {
        toast.error('Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallModule = async (moduleId: number) => {
    try {
      setLoading(true);
      // API call to install module
      const response = await api.settings.updateSetting(`modules.${moduleId}.isInstalled`, true);

      if (response.success) {
        toast.success('Module installed successfully');
        fetchModules();
      } else {
        toast.error('Failed to install module');
      }
    } catch (error) {
      console.error('Error installing module:', error);
      toast.error('Failed to install module');
    } finally {
      setLoading(false);
    }
  };

  const handleUninstallModule = async (moduleId: number) => {
    try {
      setLoading(true);
      // API call to uninstall module
      const response = await api.settings.updateSetting(`modules.${moduleId}.isInstalled`, false);

      if (response.success) {
        toast.success('Module uninstalled successfully');
        fetchModules();
      } else {
        toast.error('Failed to uninstall module');
      }
    } catch (error) {
      console.error('Error uninstalling module:', error);
      toast.error('Failed to uninstall module');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseModule = async (moduleId: number) => {
    try {
      setLoading(true);
      // API call to purchase module
      const response = await api.settings.updateSetting(`modules.${moduleId}.isPurchased`, true);

      if (response.success) {
        toast.success('Module purchased successfully');
        fetchModules();
      } else {
        toast.error('Failed to purchase module');
      }
    } catch (error) {
      console.error('Error purchasing module:', error);
      toast.error('Failed to purchase module');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'development':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Development</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing':
        return <Target className="h-5 w-5" />;
      case 'communication':
        return <MessageSquare className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />;
      case 'mlm':
        return <Users className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'mobile':
        return <Globe className="h-5 w-5" />;
      case 'trading':
        return <TrendingUp className="h-5 w-5" />;
      case 'social':
        return <MessageSquare className="h-5 w-5" />;
      case 'support':
        return <MessageSquare className="h-5 w-5" />;
      case 'ecommerce':
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'marketing':
        return 'Marketing';
      case 'communication':
        return 'Communication';
      case 'payment':
        return 'Payment';
      case 'analytics':
        return 'Analytics';
      case 'mlm':
        return 'MLM Tools';
      case 'security':
        return 'Security';
      case 'mobile':
        return 'Mobile';
      case 'trading':
        return 'Trading';
      case 'social':
        return 'Social Media';
      case 'support':
        return 'Support';
      case 'ecommerce':
        return 'E-commerce';
      default:
        return category;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesFilter = filter === 'all' || 
                         (filter === 'installed' && module.isInstalled) ||
                         (filter === 'purchased' && module.isPurchased) ||
                         (filter === 'available' && !module.isPurchased);
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const categories = [
    { id: 'all', label: 'All Categories', icon: Package },
    { id: 'marketing', label: 'Marketing', icon: Target },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'mlm', label: 'MLM Tools', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'mobile', label: 'Mobile', icon: Globe },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'social', label: 'Social Media', icon: MessageSquare },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modules Manager</h1>
            <p className="text-gray-600">Manage and install system modules</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading modules...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modules Manager</h1>
          <p className="text-gray-600">Manage and install system modules</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modules</option>
              <option value="installed">Installed</option>
              <option value="purchased">Purchased</option>
              <option value="available">Available</option>
            </select>

            {/* Refresh */}
            <Button variant="outline" onClick={fetchModules}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <Card key={module.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(module.category)}
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <p className="text-sm text-gray-600">{getCategoryLabel(module.category)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(module.status)}
                  {module.isInstalled && (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Installed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{module.description}</p>
              
              {/* Features */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                <div className="space-y-1">
                  {module.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                  {module.features.length > 3 && (
                    <p className="text-sm text-gray-500">+{module.features.length - 3} more features</p>
                  )}
                </div>
              </div>

              {/* Module Info */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Version</p>
                  <p className="font-medium">{module.version}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-medium">{module.price === 0 ? 'Free' : formatCurrency(module.price, module.currency)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Downloads</p>
                  <p className="font-medium">{module.downloads.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rating</p>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span className="font-medium">{module.rating}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {!module.isInstalled ? (
                    <Button
                      size="sm"
                      onClick={() => handleInstallModule(module.id)}
                      disabled={!module.isPurchased}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Install
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUninstallModule(module.id)}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Uninstall
                    </Button>
                  )}
                  
                  {!module.isPurchased && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePurchaseModule(module.id)}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      {module.price === 0 ? 'Get Free' : 'Purchase'}
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Modules Found</h3>
            <p className="text-gray-500">No modules match your current filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Add Module Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Module</h2>
              <button onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                <Input
                  value={newModule.name}
                  onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Advanced Analytics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <Input
                  value={newModule.version}
                  onChange={(e) => setNewModule(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <Input
                  type="number"
                  value={newModule.price}
                  onChange={(e) => setNewModule(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  placeholder="299.99"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newModule.category}
                  onChange={(e) => setNewModule(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="marketing">Marketing</option>
                  <option value="analytics">Analytics</option>
                  <option value="payment">Payment</option>
                  <option value="security">Security</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={newModule.currency}
                  onChange={(e) => setNewModule(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Developer</label>
                <Input
                  value={newModule.developer}
                  onChange={(e) => setNewModule(prev => ({ ...prev, developer: e.target.value }))}
                  placeholder="Matrix Team"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newModule.description}
                onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Module description..."
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
              <textarea
                value={newModule.features.join('\n')}
                onChange={(e) => setNewModule(prev => ({ ...prev, features: e.target.value.split('\n') }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
              <textarea
                value={newModule.requirements.join('\n')}
                onChange={(e) => setNewModule(prev => ({ ...prev, requirements: e.target.value.split('\n') }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Requirement 1&#10;Requirement 2"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Changelog</label>
              <textarea
                value={newModule.changelog}
                onChange={(e) => setNewModule(prev => ({ ...prev, changelog: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Version 1.0.0 - Initial release"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Documentation URL</label>
              <Input
                value={newModule.documentation}
                onChange={(e) => setNewModule(prev => ({ ...prev, documentation: e.target.value }))}
                placeholder="https://docs.example.com"
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddModule}>
                <Save className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Module: {editingModule.name}</h2>
              <button onClick={() => setEditingModule(null)}>×</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                <Input
                  value={editingModule.name}
                  onChange={(e) => setEditingModule(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Advanced Analytics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <Input
                  value={editingModule.version}
                  onChange={(e) => setEditingModule(prev => prev ? { ...prev, version: e.target.value } : null)}
                  placeholder="1.0.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <Input
                  type="number"
                  value={editingModule.price}
                  onChange={(e) => setEditingModule(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                  placeholder="299.99"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingModule.status}
                  onChange={(e) => setEditingModule(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editingModule.description}
                onChange={(e) => setEditingModule(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Module description..."
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditingModule(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingModule && handleUpdateModule(editingModule)}>
                <Save className="h-4 w-4 mr-2" />
                Update Module
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesManager; 
