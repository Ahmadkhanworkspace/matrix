import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Mail, 
  Share2, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  Filter,
  Search,
  Globe,
  Megaphone,
  Award,
  Gift,
  Zap,
  Bell
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { toast } from 'react-hot-toast';

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'banner' | 'notification' | 'social' | 'referral';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  targetAudience: string[];
  content: any;
}

interface MarketingStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCtr: number;
  averageConversionRate: number;
  roi: number;
}

const MarketingTools: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Mock data - replace with actual API calls
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([
    {
      id: '1',
      name: 'Welcome Email Series',
      type: 'email',
      status: 'active',
      description: 'Automated welcome email sequence for new members',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      budget: 5000,
      spent: 2500,
      impressions: 15000,
      clicks: 1200,
      conversions: 180,
      ctr: 8.0,
      conversionRate: 15.0,
      targetAudience: ['new-members'],
      content: {}
    },
    {
      id: '2',
      name: 'Referral Bonus Promotion',
      type: 'banner',
      status: 'active',
      description: 'Promote increased referral bonuses for limited time',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      budget: 3000,
      spent: 1800,
      impressions: 25000,
      clicks: 2000,
      conversions: 150,
      ctr: 8.0,
      conversionRate: 7.5,
      targetAudience: ['active-members'],
      content: {}
    },
    {
      id: '3',
      name: 'Matrix Completion Push',
      type: 'notification',
      status: 'paused',
      description: 'Push notifications to encourage matrix completion',
      startDate: '2024-01-10',
      endDate: '2024-03-10',
      budget: 2000,
      spent: 800,
      impressions: 8000,
      clicks: 400,
      conversions: 60,
      ctr: 5.0,
      conversionRate: 15.0,
      targetAudience: ['active-members'],
      content: {}
    }
  ]);

  const [stats, setStats] = useState<MarketingStats>({
    totalCampaigns: 3,
    activeCampaigns: 2,
    totalBudget: 10000,
    totalSpent: 5100,
    totalImpressions: 48000,
    totalClicks: 3600,
    totalConversions: 390,
    averageCtr: 7.5,
    averageConversionRate: 10.8,
    roi: 245.5
  });

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0,
    targetAudience: []
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await api.marketing.getCampaigns();
      // setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch marketing campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    try {
      if (!newCampaign.name || !newCampaign.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      const campaign: MarketingCampaign = {
        id: Date.now().toString(),
        ...newCampaign,
        status: 'draft',
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0,
        content: {}
      } as MarketingCampaign;

      setCampaigns(prev => [...prev, campaign]);
      setShowModal(false);
      setNewCampaign({
        name: '',
        type: 'email',
        description: '',
        startDate: '',
        endDate: '',
        budget: 0,
        targetAudience: []
      });
      toast.success('Campaign created successfully');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleUpdateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus as any }
            : campaign
        )
      );
      toast.success(`Campaign ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      toast.success('Campaign deleted successfully');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || campaign.status === filterStatus;
    const matchesType = !filterType || campaign.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: primaryCurrency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      active: { color: 'bg-green-100 text-green-800', icon: Play },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
      completed: { color: 'bg-blue-100 text-blue-800', icon: Eye },
      cancelled: { color: 'bg-red-100 text-red-800', icon: Trash2 }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      email: Mail,
      banner: Target,
      notification: Bell,
      social: Share2,
      referral: Users
    };
    
    const Icon = icons[type as keyof typeof icons] || Target;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Tools</h1>
          <p className="text-gray-600 mt-1">Create and manage marketing campaigns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchCampaigns} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg CTR</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageCtr}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'campaigns', name: 'Campaigns', icon: Target },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 },
            { id: 'tools', name: 'Tools', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('');
                    setFilterType('');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns List */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns ({filteredCampaigns.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading campaigns...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getTypeIcon(campaign.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                            <p className="text-sm text-gray-600">{campaign.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(campaign.status)}
                          <div className="flex items-center space-x-1">
                            {campaign.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateCampaignStatus(campaign.id, 'paused')}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {campaign.status === 'paused' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCampaign(campaign)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Budget</p>
                          <p className="font-semibold">{formatCurrency(campaign.budget)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Spent</p>
                          <p className="font-semibold">{formatCurrency(campaign.spent)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Impressions</p>
                          <p className="font-semibold">{campaign.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Clicks</p>
                          <p className="font-semibold">{campaign.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">CTR</p>
                          <p className="font-semibold">{campaign.ctr}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Conversions</p>
                          <p className="font-semibold">{campaign.conversions}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {campaign.startDate} - {campaign.endDate}
                        </span>
                        <span>
                          Target: {campaign.targetAudience.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}

                  {filteredCampaigns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No campaigns found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Impressions</span>
                  <span className="font-semibold">{stats.totalImpressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Clicks</span>
                  <span className="font-semibold">{stats.totalClicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Conversions</span>
                  <span className="font-semibold">{stats.totalConversions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average CTR</span>
                  <span className="font-semibold">{stats.averageCtr}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold">{stats.averageConversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ROI</span>
                  <span className="font-semibold text-green-600">{stats.roi}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Budget</span>
                  <span className="font-semibold">{formatCurrency(stats.totalBudget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold">{formatCurrency(stats.totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-semibold">{formatCurrency(stats.totalBudget - stats.totalSpent)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(stats.totalSpent / stats.totalBudget) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  {((stats.totalSpent / stats.totalBudget) * 100).toFixed(1)}% of budget used
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 font-semibold">Email Builder</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Create and customize email templates</p>
              <Button size="sm" className="w-full">Launch Tool</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-3 font-semibold">A/B Testing</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Test different campaign variations</p>
              <Button size="sm" className="w-full">Launch Tool</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="ml-3 font-semibold">Audience Builder</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Create targeted audience segments</p>
              <Button size="sm" className="w-full">Launch Tool</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="ml-3 font-semibold">Performance Tracker</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Track campaign performance metrics</p>
              <Button size="sm" className="w-full">Launch Tool</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Share2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="ml-3 font-semibold">Social Media</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Manage social media campaigns</p>
              <Button size="sm" className="w-full">Launch Tool</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Gift className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="ml-3 font-semibold">Promotion Builder</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Create promotional campaigns</p>
              <Button size="sm" className="w-full">Launch Tool</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Campaign</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <Input
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Input
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <Input
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <Input
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <Input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter budget amount"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>
                  Create Campaign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingTools; 
