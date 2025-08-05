import React, { useState, useEffect } from 'react';
import { Image, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Target, Globe, Users, Calendar, DollarSign, Bell } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  type: 'banner' | 'popup' | 'sidebar' | 'notification';
  status: 'active' | 'inactive' | 'scheduled' | 'draft';
  targetAudience: string[];
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  impressions: number;
  clicks: number;
  ctr: number;
  currency: string;
  budget: number;
  spent: number;
  dimensions: {
    width: number;
    height: number;
  };
  position: string;
}

interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  totalBudget: number;
  totalSpent: number;
  topBanner: string;
  topCtr: number;
}

const BannerManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('banners');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      name: 'Welcome Bonus Banner',
      imageUrl: '/banners/welcome-bonus.jpg',
      altText: 'Join now and get 50 TRX welcome bonus',
      linkUrl: '/register',
      type: 'banner',
      status: 'active',
      targetAudience: ['new-members', 'pro-members'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      priority: 'high',
      impressions: 25000,
      clicks: 1250,
      ctr: 5.0,
      currency: primaryCurrency,
      budget: 2000,
      spent: 900,
      dimensions: {
        width: 728,
        height: 90
      },
      position: 'header'
    },
    {
      id: '2',
      name: 'Matrix Completion Popup',
      imageUrl: '/banners/matrix-completion.jpg',
      altText: 'Complete Matrix Level 3 and earn 500 TRX',
      linkUrl: '/matrix',
      type: 'popup',
      status: 'active',
      targetAudience: ['active-members'],
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      priority: 'medium',
      impressions: 15000,
      clicks: 750,
      ctr: 5.0,
      currency: primaryCurrency,
      budget: 1000,
      spent: 400,
      dimensions: {
        width: 400,
        height: 300
      },
      position: 'center'
    },
    {
      id: '3',
      name: 'Leadership Program Sidebar',
      imageUrl: '/banners/leadership.jpg',
      altText: 'Unlock leadership bonuses up to 2000 TRX monthly',
      linkUrl: '/leadership',
      type: 'sidebar',
      status: 'scheduled',
      targetAudience: ['leadership-members'],
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      priority: 'high',
      impressions: 0,
      clicks: 0,
      ctr: 0,
      currency: primaryCurrency,
      budget: 1500,
      spent: 0,
      dimensions: {
        width: 300,
        height: 250
      },
      position: 'sidebar'
    },
    {
      id: '4',
      name: 'System Maintenance Notice',
      imageUrl: '/banners/maintenance.jpg',
      altText: 'System maintenance scheduled for January 20th',
      linkUrl: '/announcements',
      type: 'notification',
      status: 'active',
      targetAudience: ['all-members'],
      startDate: '2024-01-19',
      endDate: '2024-01-20',
      priority: 'high',
      impressions: 8000,
      clicks: 160,
      ctr: 2.0,
      currency: primaryCurrency,
      budget: 200,
      spent: 80,
      dimensions: {
        width: 600,
        height: 400
      },
      position: 'overlay'
    }
  ]);

  const [stats, setStats] = useState<BannerStats>({
    totalBanners: 4,
    activeBanners: 3,
    totalImpressions: 48000,
    totalClicks: 2160,
    averageCtr: 4.5,
    totalBudget: 4700,
    totalSpent: 1380,
    topBanner: 'Welcome Bonus Banner',
    topCtr: 5.0
  });

  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    name: '',
    imageUrl: '',
    altText: '',
    linkUrl: '',
    type: 'banner',
    status: 'draft',
    targetAudience: [],
    startDate: '',
    endDate: '',
    priority: 'medium',
    impressions: 0,
    clicks: 0,
    ctr: 0,
    currency: primaryCurrency,
    budget: 0,
    spent: 0,
    dimensions: {
      width: 728,
      height: 90
    },
    position: 'header'
  });

  const audienceOptions = [
    'all-members',
    'new-members',
    'pro-members',
    'active-members',
    'leadership-members',
    'inactive-members'
  ];

  const positionOptions = [
    'header',
    'footer',
    'sidebar',
    'center',
    'overlay',
    'popup'
  ];

  const handleSaveBanner = () => {
    if (editingBanner) {
      setBanners(banners.map(banner => banner.id === editingBanner.id ? { ...editingBanner } : banner));
      setEditingBanner(null);
    } else {
      const banner: Banner = {
        ...newBanner as Banner,
        id: Date.now().toString()
      };
      setBanners([...banners, banner]);
      setNewBanner({
        name: '',
        imageUrl: '',
        altText: '',
        linkUrl: '',
        type: 'banner',
        status: 'draft',
        targetAudience: [],
        startDate: '',
        endDate: '',
        priority: 'medium',
        impressions: 0,
        clicks: 0,
        ctr: 0,
        currency: primaryCurrency,
        budget: 0,
        spent: 0,
        dimensions: {
          width: 728,
          height: 90
        },
        position: 'header'
      });
    }
    setShowModal(false);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setShowModal(true);
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter(banner => banner.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setBanners(banners.map(banner => {
      if (banner.id === id) {
        const newStatus = banner.status === 'active' ? 'inactive' : 'active';
        return { ...banner, status: newStatus };
      }
      return banner;
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner': return <Image className="h-4 w-4" />;
      case 'popup': return <Target className="h-4 w-4" />;
      case 'sidebar': return <Globe className="h-4 w-4" />;
      case 'notification': return <Bell className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'banner': return 'bg-blue-100 text-blue-800';
      case 'popup': return 'bg-green-100 text-green-800';
      case 'sidebar': return 'bg-purple-100 text-purple-800';
      case 'notification': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Image className="h-8 w-8 text-green-600" />
                Banner Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage banners, popups, and promotional images
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Banner
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Image className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Banners</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBanners}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg CTR</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageCtr}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'banners', name: 'Banners', icon: Image },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'positions', name: 'Positions', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Banners</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Banner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-16">
                            <div className="h-12 w-16 bg-gray-200 rounded flex items-center justify-center">
                              <Image className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{banner.name}</div>
                            <div className="text-sm text-gray-500">{banner.dimensions.width}x{banner.dimensions.height}</div>
                            <div className="text-sm text-gray-500">{banner.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(banner.type)}`}>
                          {getTypeIcon(banner.type)}
                          <span className="ml-1 capitalize">{banner.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(banner.status)}`}>
                          {banner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Impressions: {banner.impressions.toLocaleString()}</div>
                          <div>Clicks: {banner.clicks.toLocaleString()}</div>
                          <div>CTR: {banner.ctr}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Budget: {primaryCurrency} {banner.budget}</div>
                          <div>Spent: {primaryCurrency} {banner.spent}</div>
                          <div className="text-xs text-gray-500">
                            {((banner.spent / banner.budget) * 100).toFixed(1)}% used
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditBanner(banner)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(banner.id)}
                            className={`${banner.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {banner.status === 'active' ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Banners</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Image className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium">{stats.topBanner}</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {stats.topCtr}% CTR
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Matrix Completion Popup</span>
                    <span className="font-semibold">5.0% CTR</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>System Maintenance Notice</span>
                    <span className="font-semibold">2.0% CTR</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Budget</span>
                    <span className="font-semibold">{primaryCurrency} {stats.totalBudget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="font-semibold">{primaryCurrency} {stats.totalSpent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="font-semibold">{primaryCurrency} {stats.totalBudget - stats.totalSpent}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(stats.totalSpent / stats.totalBudget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Banner Positions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positionOptions.map((position) => {
                const positionBanners = banners.filter(banner => banner.position === position);
                return (
                  <div key={position} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize">{position}</h4>
                      <span className="text-sm text-gray-500">{positionBanners.length} banners</span>
                    </div>
                    <div className="space-y-2">
                      {positionBanners.map((banner) => (
                        <div key={banner.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{banner.name}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(banner.status)}`}>
                            {banner.status}
                          </span>
                        </div>
                      ))}
                      {positionBanners.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No banners in this position
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner Name</label>
                    <input
                      type="text"
                      value={editingBanner?.name || newBanner.name}
                      onChange={(e) => editingBanner 
                        ? setEditingBanner({...editingBanner, name: e.target.value})
                        : setNewBanner({...newBanner, name: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={editingBanner?.imageUrl || newBanner.imageUrl}
                      onChange={(e) => editingBanner 
                        ? setEditingBanner({...editingBanner, imageUrl: e.target.value})
                        : setNewBanner({...newBanner, imageUrl: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/banners/example.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                    <input
                      type="text"
                      value={editingBanner?.altText || newBanner.altText}
                      onChange={(e) => editingBanner 
                        ? setEditingBanner({...editingBanner, altText: e.target.value})
                        : setNewBanner({...newBanner, altText: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                    <input
                      type="text"
                      value={editingBanner?.linkUrl || newBanner.linkUrl}
                      onChange={(e) => editingBanner 
                        ? setEditingBanner({...editingBanner, linkUrl: e.target.value})
                        : setNewBanner({...newBanner, linkUrl: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={editingBanner?.type || newBanner.type}
                      onChange={(e) => editingBanner 
                        ? setEditingBanner({...editingBanner, type: e.target.value as any})
                        : setNewBanner({...newBanner, type: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="banner">Banner</option>
                      <option value="popup">Popup</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="notification">Notification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <select
                      value={editingBanner?.position || newBanner.position}
                      onChange={(e) => editingBanner 
                        ? setEditingBanner({...editingBanner, position: e.target.value})
                        : setNewBanner({...newBanner, position: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {positionOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingBanner?.status || newBanner.status}
                      onChange={(e) => editingBanner 
                        ? setEditingBanner({...editingBanner, status: e.target.value as any})
                        : setNewBanner({...newBanner, status: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                    <input
                      type="number"
                      value={editingBanner?.budget || newBanner.budget}
                      onChange={(e) => editingBanner 
                        ? setEditingBanner({...editingBanner, budget: parseInt(e.target.value) || 0})
                        : setNewBanner({...newBanner, budget: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingBanner(null);
                      setNewBanner({
                        name: '',
                        imageUrl: '',
                        altText: '',
                        linkUrl: '',
                        type: 'banner',
                        status: 'draft',
                        targetAudience: [],
                        startDate: '',
                        endDate: '',
                        priority: 'medium',
                        impressions: 0,
                        clicks: 0,
                        ctr: 0,
                        currency: primaryCurrency,
                        budget: 0,
                        spent: 0,
                        dimensions: {
                          width: 728,
                          height: 90
                        },
                        position: 'header'
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBanner}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {editingBanner ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManager; 
