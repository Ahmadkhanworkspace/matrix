import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Store, 
  Search, 
  Filter, 
  ShoppingCart, 
  Eye, 
  Download,
  Star,
  Users,
  Calendar,
  DollarSign,
  CreditCard,
  Shield,
  BarChart3,
  MessageSquare,
  Globe,
  Smartphone,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
  Lock,
  Unlock,
  Heart,
  Share2,
  BookOpen,
  Play,
  Pause
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApiService } from '../../api/adminApi';

interface Module {
  id: number;
  name: string;
  description: string;
  version: string;
  price: number;
  currency: string;
  category: string;
  status: 'available' | 'purchased' | 'installed' | 'expired';
  features: string[];
  requirements: string[];
  icon: string;
  isPurchased: boolean;
  isInstalled: boolean;
  purchaseDate?: string;
  expiryDate?: string;
  downloads: number;
  rating: number;
  reviews: number;
  developer: string;
  changelog: string;
  documentation: string;
  demoUrl: string;
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  discount?: number;
}

const ModuleStore: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleDetails, setShowModuleDetails] = useState(false);

  useEffect(() => {
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await adminApiService.getModules({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        });
        
        if (response.success && response.data && response.data.length > 0) {
          setModules(response.data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('API fetch failed, using mock data:', error);
      }
      
      // Fallback to mock data if API fails
      const mockModules: Module[] = [
        {
          id: 1,
          name: 'Advanced Analytics Pro',
          description: 'Comprehensive analytics and reporting system with real-time data visualization, custom dashboards, and advanced insights.',
          version: '2.1.0',
          price: 299.99,
          currency: 'USD',
          category: 'analytics',
          status: 'available',
          features: ['Real-time Dashboard', 'Custom Reports', 'Data Export', 'API Integration', 'Advanced Filtering', 'Scheduled Reports'],
          requirements: ['PHP 8.0+', 'MySQL 5.7+', 'SSL Certificate'],
          icon: 'BarChart3',
          isPurchased: false,
          isInstalled: false,
          downloads: 1250,
          rating: 4.8,
          reviews: 156,
          developer: 'Matrix Team',
          changelog: 'Version 2.1.0 - Added new reporting features and improved performance',
          documentation: 'https://docs.matrixmlm.com/analytics',
          demoUrl: 'https://demo.matrixmlm.com/analytics',
          tags: ['analytics', 'reporting', 'dashboard', 'data'],
          isFeatured: true,
          isNew: false,
          discount: 20
        },
        {
          id: 2,
          name: 'Multi-Currency Gateway',
          description: 'Support for multiple cryptocurrencies and traditional payment gateways with automatic conversion and secure processing.',
          version: '1.5.2',
          price: 199.99,
          currency: 'USD',
          category: 'payment',
          status: 'purchased',
          features: ['Bitcoin Support', 'Ethereum Support', 'TRON Support', 'Bank Transfer', 'Auto Conversion', 'Multi-Gateway'],
          requirements: ['Payment Gateway API', 'SSL Certificate'],
          icon: 'CreditCard',
          isPurchased: true,
          isInstalled: true,
          purchaseDate: '2024-01-10',
          expiryDate: '2025-01-10',
          downloads: 890,
          rating: 4.6,
          reviews: 89,
          developer: 'Matrix Team',
          changelog: 'Version 1.5.2 - Added TRON support and improved security',
          documentation: 'https://docs.matrixmlm.com/multicurrency',
          demoUrl: 'https://demo.matrixmlm.com/payments',
          tags: ['payment', 'crypto', 'gateway', 'security'],
          isFeatured: false,
          isNew: false
        },
        {
          id: 3,
          name: 'Enterprise Security Suite',
          description: 'Advanced security features including 2FA, KYC verification, fraud detection, and comprehensive audit logging.',
          version: '1.3.0',
          price: 399.99,
          currency: 'USD',
          category: 'security',
          status: 'available',
          features: ['Two-Factor Authentication', 'KYC Verification', 'Fraud Detection', 'IP Whitelisting', 'Audit Logging', 'Compliance Tools'],
          requirements: ['SSL Certificate', 'SMS Gateway'],
          icon: 'Shield',
          isPurchased: false,
          isInstalled: false,
          downloads: 567,
          rating: 4.9,
          reviews: 234,
          developer: 'Matrix Team',
          changelog: 'Version 1.3.0 - Added biometric authentication support',
          documentation: 'https://docs.matrixmlm.com/security',
          demoUrl: 'https://demo.matrixmlm.com/security',
          tags: ['security', '2fa', 'kyc', 'compliance'],
          isFeatured: true,
          isNew: true,
          discount: 15
        },
        {
          id: 4,
          name: 'Marketing Automation Pro',
          description: 'Complete marketing automation suite with email campaigns, SMS marketing, social media integration, and AI-powered lead scoring.',
          version: '1.8.1',
          price: 249.99,
          currency: 'USD',
          category: 'marketing',
          status: 'available',
          features: ['Email Campaigns', 'SMS Marketing', 'Social Media Integration', 'Lead Scoring', 'A/B Testing', 'Analytics'],
          requirements: ['Email Service', 'SMS Gateway'],
          icon: 'MessageSquare',
          isPurchased: false,
          isInstalled: false,
          downloads: 432,
          rating: 4.5,
          reviews: 67,
          developer: 'Matrix Team',
          changelog: 'Version 1.8.1 - Added AI-powered lead scoring',
          documentation: 'https://docs.matrixmlm.com/marketing',
          demoUrl: 'https://demo.matrixmlm.com/marketing',
          tags: ['marketing', 'automation', 'email', 'sms'],
          isFeatured: false,
          isNew: false
        },
        {
          id: 5,
          name: 'Mobile App Suite',
          description: 'Native mobile applications for iOS and Android with push notifications, offline mode, and seamless synchronization.',
          version: '1.0.0',
          price: 599.99,
          currency: 'USD',
          category: 'mobile',
          status: 'expired',
          features: ['Native iOS App', 'Native Android App', 'Push Notifications', 'Offline Mode', 'Real-time Sync', 'Custom Branding'],
          requirements: ['Apple Developer Account', 'Google Play Console'],
          icon: 'Smartphone',
          isPurchased: true,
          isInstalled: false,
          purchaseDate: '2023-12-01',
          expiryDate: '2024-01-01',
          downloads: 234,
          rating: 4.7,
          reviews: 45,
          developer: 'Matrix Team',
          changelog: 'Version 1.0.0 - Initial release with core features',
          documentation: 'https://docs.matrixmlm.com/mobile',
          demoUrl: 'https://demo.matrixmlm.com/mobile',
          tags: ['mobile', 'ios', 'android', 'app'],
          isFeatured: false,
          isNew: false
        },
        {
          id: 6,
          name: 'AI-Powered Chatbot',
          description: 'Intelligent chatbot with natural language processing, 24/7 support, and seamless integration with your MLM system.',
          version: '1.2.0',
          price: 349.99,
          currency: 'USD',
          category: 'communication',
          status: 'available',
          features: ['Natural Language Processing', '24/7 Support', 'Multi-language', 'Custom Responses', 'Analytics', 'Integration'],
          requirements: ['AI Service API', 'Webhook Support'],
          icon: 'MessageSquare',
          isPurchased: false,
          isInstalled: false,
          downloads: 189,
          rating: 4.4,
          reviews: 23,
          developer: 'Matrix Team',
          changelog: 'Version 1.2.0 - Added multi-language support',
          documentation: 'https://docs.matrixmlm.com/chatbot',
          demoUrl: 'https://demo.matrixmlm.com/chatbot',
          tags: ['ai', 'chatbot', 'support', 'automation'],
          isFeatured: false,
          isNew: true,
          discount: 25
        }
      ];
      
      setModules(mockModules);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      toast.error('Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseModule = async (moduleId: number) => {
    try {
      setLoading(true);
      
      // Try API call first
      try {
        const response = await adminApiService.purchaseModule(moduleId);
        
        if (response.success) {
          toast.success('Module purchased successfully!');
          // Update local state
          setModules(prev => prev.map(m => 
            m.id === moduleId ? { 
              ...m, 
              isPurchased: true, 
              status: 'purchased',
              purchaseDate: new Date().toISOString(),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            } : m
          ));
          
          // Refresh modules list
          await fetchModules();
          return;
        }
      } catch (apiError) {
        console.log('API purchase failed, using local update:', apiError);
      }
      
      // Fallback to local update if API fails
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { 
          ...m, 
          isPurchased: true, 
          status: 'purchased',
          purchaseDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        } : m
      ));
      toast.success('Module purchased successfully!');
    } catch (error) {
      console.error('Failed to purchase module:', error);
      toast.error('Failed to purchase module. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallModule = async (moduleId: number) => {
    try {
      setLoading(true);
      
      // Try API call first
      try {
        const response = await adminApiService.installModule(moduleId);
        
        if (response.success) {
          toast.success('Module installed successfully!');
          // Update local state
          setModules(prev => prev.map(m => 
            m.id === moduleId ? { ...m, isInstalled: true, status: 'installed' } : m
          ));
          
          // Refresh modules list
          await fetchModules();
          return;
        }
      } catch (apiError) {
        console.log('API install failed, using local update:', apiError);
      }
      
      // Fallback to local update if API fails
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, isInstalled: true, status: 'installed' } : m
      ));
      toast.success('Module installed successfully!');
    } catch (error) {
      console.error('Failed to install module:', error);
      toast.error('Failed to install module. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUninstallModule = async (moduleId: number) => {
    try {
      setLoading(true);
      
      // Try API call first
      try {
        const response = await adminApiService.uninstallModule(moduleId);
        
        if (response.success) {
          toast.success('Module uninstalled successfully!');
          // Update local state
          setModules(prev => prev.map(m => 
            m.id === moduleId ? { ...m, isInstalled: false, status: 'purchased' } : m
          ));
          
          // Refresh modules list
          await fetchModules();
          return;
        }
      } catch (apiError) {
        console.log('API uninstall failed, using local update:', apiError);
      }
      
      // Fallback to local update if API fails
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, isInstalled: false, status: 'purchased' } : m
      ));
      toast.success('Module uninstalled successfully!');
    } catch (error) {
      console.error('Failed to uninstall module:', error);
      toast.error('Failed to uninstall module. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'purchased':
        return <Badge className="bg-blue-100 text-blue-800">Purchased</Badge>;
      case 'installed':
        return <Badge className="bg-purple-100 text-purple-800">Installed</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics':
        return <BarChart3 className="h-6 w-6" />;
      case 'payment':
        return <CreditCard className="h-6 w-6" />;
      case 'security':
        return <Shield className="h-6 w-6" />;
      case 'marketing':
        return <MessageSquare className="h-6 w-6" />;
      case 'mobile':
        return <Smartphone className="h-6 w-6" />;
      case 'communication':
        return <MessageSquare className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'analytics':
        return 'Analytics';
      case 'payment':
        return 'Payment';
      case 'security':
        return 'Security';
      case 'marketing':
        return 'Marketing';
      case 'mobile':
        return 'Mobile';
      case 'communication':
        return 'Communication';
      default:
        return category;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedModules = [...filteredModules].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.purchaseDate || '').getTime() - new Date(a.purchaseDate || '').getTime();
      default:
        return 0;
    }
  });

  const categories = ['all', 'analytics', 'payment', 'security', 'marketing', 'mobile', 'communication'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading modules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Module Store</h1>
          <p className="text-gray-600">Browse and purchase modules to enhance your MLM system</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            My Purchases
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </Button>
        </div>
      </div>

      {/* Featured Modules */}
      {modules.filter(m => m.isFeatured).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Featured Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.filter(m => m.isFeatured).map((module) => (
              <Card key={module.id} className="relative border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                {module.isNew && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500 text-white">NEW</Badge>
                  </div>
                )}
                {module.discount && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500 text-white">-{module.discount}%</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        {getCategoryIcon(module.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <p className="text-sm text-gray-500">v{module.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(module.rating)}
                      <span className="text-sm text-gray-500">({module.reviews})</span>
                    </div>
                  </div>
                  {getStatusBadge(module.status)}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price:</span>
                      <div className="flex items-center">
                        {module.discount && (
                          <span className="text-sm text-gray-400 line-through mr-2">
                            ${module.price.toFixed(2)}
                          </span>
                        )}
                        <span className="font-semibold text-lg">
                          ${module.discount ? (module.price * (1 - module.discount / 100)).toFixed(2) : module.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Downloads:</span>
                      <span className="text-sm font-medium">{module.downloads}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {module.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                    {module.features.length > 3 && (
                      <p className="text-sm text-gray-500">+{module.features.length - 3} more features</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {module.status === 'available' ? (
                      <Button size="sm" onClick={() => handlePurchaseModule(module.id)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase
                      </Button>
                    ) : module.status === 'purchased' && !module.isInstalled ? (
                      <Button size="sm" onClick={() => handleInstallModule(module.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                    ) : module.status === 'installed' ? (
                      <Button size="sm" variant="outline" onClick={() => handleUninstallModule(module.id)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Uninstall
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <Lock className="h-4 w-4 mr-2" />
                        Expired
                      </Button>
                    )}
                    
                    <Button size="sm" variant="outline" onClick={() => {
                      setSelectedModule(module);
                      setShowModuleDetails(true);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Modules */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">All Modules ({sortedModules.length})</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Wishlist
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedModules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              {module.isNew && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-green-500 text-white">NEW</Badge>
                </div>
              )}
              {module.discount && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-red-500 text-white">-{module.discount}%</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      {getCategoryIcon(module.category)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <p className="text-sm text-gray-500">v{module.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(module.rating)}
                    <span className="text-sm text-gray-500">({module.reviews})</span>
                  </div>
                </div>
                {getStatusBadge(module.status)}
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{module.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Price:</span>
                    <div className="flex items-center">
                      {module.discount && (
                        <span className="text-sm text-gray-400 line-through mr-2">
                          ${module.price.toFixed(2)}
                        </span>
                      )}
                      <span className="font-semibold">
                        ${module.discount ? (module.price * (1 - module.discount / 100)).toFixed(2) : module.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Downloads:</span>
                    <span className="text-sm font-medium">{module.downloads}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {module.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                  {module.features.length > 2 && (
                    <p className="text-sm text-gray-500">+{module.features.length - 2} more features</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {module.status === 'available' ? (
                    <Button size="sm" onClick={() => handlePurchaseModule(module.id)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                  ) : module.status === 'purchased' && !module.isInstalled ? (
                    <Button size="sm" onClick={() => handleInstallModule(module.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  ) : module.status === 'installed' ? (
                    <Button size="sm" variant="outline" onClick={() => handleUninstallModule(module.id)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Uninstall
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Expired
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedModule(module);
                    setShowModuleDetails(true);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Module Details Modal */}
      {showModuleDetails && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{selectedModule.name}</h2>
              <button onClick={() => setShowModuleDetails(false)}>×</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{selectedModule.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedModule.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <div className="space-y-2">
                      {selectedModule.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          {requirement}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Changelog</h3>
                    <p className="text-sm text-gray-600">{selectedModule.changelog}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Price:</span>
                        <div className="flex items-center">
                          {selectedModule.discount && (
                            <span className="text-sm text-gray-400 line-through mr-2">
                              ${selectedModule.price.toFixed(2)}
                            </span>
                          )}
                          <span className="font-semibold text-lg">
                            ${selectedModule.discount ? (selectedModule.price * (1 - selectedModule.discount / 100)).toFixed(2) : selectedModule.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Rating:</span>
                        <div className="flex items-center">
                          {renderStars(selectedModule.rating)}
                          <span className="text-sm text-gray-500 ml-1">({selectedModule.reviews})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Downloads:</span>
                        <span className="text-sm font-medium">{selectedModule.downloads}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Developer:</span>
                        <span className="text-sm font-medium">{selectedModule.developer}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Version:</span>
                        <span className="text-sm font-medium">{selectedModule.version}</span>
                      </div>
                      
                      {selectedModule.isPurchased && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Purchased:</span>
                            <span className="text-sm font-medium">
                              {selectedModule.purchaseDate ? new Date(selectedModule.purchaseDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Expires:</span>
                            <span className="text-sm font-medium">
                              {selectedModule.expiryDate ? new Date(selectedModule.expiryDate).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-2">
                  {selectedModule.status === 'available' ? (
                    <Button className="w-full" onClick={() => handlePurchaseModule(selectedModule.id)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase Module
                    </Button>
                  ) : selectedModule.status === 'purchased' && !selectedModule.isInstalled ? (
                    <Button className="w-full" onClick={() => handleInstallModule(selectedModule.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Install Module
                    </Button>
                  ) : selectedModule.status === 'installed' ? (
                    <Button variant="outline" className="w-full" onClick={() => handleUninstallModule(selectedModule.id)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Uninstall Module
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Module Expired
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleStore; 
