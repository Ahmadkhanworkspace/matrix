import React, { useState, useEffect } from 'react';
import { Megaphone, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Users, Globe, Target, Clock, Calendar } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'bonus' | 'maintenance' | 'update' | 'event' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  targetAudience: string[];
  publishDate: string;
  expiryDate: string;
  isGlobal: boolean;
  isSticky: boolean;
  readCount: number;
  totalRecipients: number;
  currency: string;
}

interface AnnouncementStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  totalRecipients: number;
  averageReadRate: number;
  urgentAnnouncements: number;
  topAnnouncement: string;
  topReadRate: number;
}

const AnnouncementManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('announcements');
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Welcome to Matrix MLM - New Features Available',
      content: 'We\'re excited to announce new features including enhanced matrix visualization, improved bonus tracking, and faster withdrawal processing. Explore these new features to maximize your earnings!',
      type: 'update',
      priority: 'high',
      status: 'active',
      targetAudience: ['all-members'],
      publishDate: '2024-01-15 10:00:00',
      expiryDate: '2024-02-15 23:59:59',
      isGlobal: true,
      isSticky: true,
      readCount: 2500,
      totalRecipients: 3000,
      currency: primaryCurrency
    },
    {
      id: '2',
      title: 'System Maintenance - January 20th, 2-4 AM UTC',
      content: 'Scheduled system maintenance will occur on January 20th from 2-4 AM UTC. During this time, some services may be temporarily unavailable. We apologize for any inconvenience.',
      type: 'maintenance',
      priority: 'urgent',
      status: 'active',
      targetAudience: ['all-members'],
      publishDate: '2024-01-19 12:00:00',
      expiryDate: '2024-01-21 23:59:59',
      isGlobal: true,
      isSticky: true,
      readCount: 4800,
      totalRecipients: 5000,
      currency: primaryCurrency
    },
    {
      id: '3',
      title: 'Bonus Structure Update - Enhanced Earnings',
      content: 'We\'ve updated our bonus structure to provide even better earnings opportunities. New members now receive 75 TRX welcome bonus (increased from 50 TRX) and matrix completion bonuses have been enhanced.',
      type: 'bonus',
      priority: 'high',
      status: 'active',
      targetAudience: ['new-members', 'active-members'],
      publishDate: '2024-01-16 14:30:00',
      expiryDate: '2024-03-16 23:59:59',
      isGlobal: false,
      isSticky: false,
      readCount: 1800,
      totalRecipients: 2200,
      currency: primaryCurrency
    },
    {
      id: '4',
      title: 'Leadership Program Launch',
      content: 'Introducing our new Leadership Program! Earn additional bonuses, access exclusive training, and unlock higher earning potential. Applications are now open for qualified members.',
      type: 'event',
      priority: 'medium',
      status: 'scheduled',
      targetAudience: ['active-members', 'leadership-members'],
      publishDate: '2024-02-01 09:00:00',
      expiryDate: '2024-04-01 23:59:59',
      isGlobal: false,
      isSticky: false,
      readCount: 0,
      totalRecipients: 800,
      currency: primaryCurrency
    },
    {
      id: '5',
      title: 'Matrix Level 8 Now Available',
      content: 'Matrix Level 8 is now available for advanced members! Unlock the highest earning potential with our newest matrix level. Upgrade your membership to access this exclusive opportunity.',
      type: 'update',
      priority: 'high',
      status: 'active',
      targetAudience: ['pro-members', 'leadership-members'],
      publishDate: '2024-01-18 16:00:00',
      expiryDate: '2024-05-18 23:59:59',
      isGlobal: false,
      isSticky: false,
      readCount: 650,
      totalRecipients: 1200,
      currency: primaryCurrency
    }
  ]);

  const [stats, setStats] = useState<AnnouncementStats>({
    totalAnnouncements: 5,
    activeAnnouncements: 4,
    totalRecipients: 12200,
    averageReadRate: 82.5,
    urgentAnnouncements: 1,
    topAnnouncement: 'System Maintenance - January 20th, 2-4 AM UTC',
    topReadRate: 96.0
  });

  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    type: 'custom',
    priority: 'medium',
    status: 'draft',
    targetAudience: [],
    publishDate: '',
    expiryDate: '',
    isGlobal: false,
    isSticky: false,
    readCount: 0,
    totalRecipients: 0,
    currency: primaryCurrency
  });

  const audienceOptions = [
    'all-members',
    'new-members',
    'pro-members',
    'active-members',
    'leadership-members',
    'inactive-members'
  ];

  const handleSaveAnnouncement = () => {
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(announcement => announcement.id === editingAnnouncement.id ? { ...editingAnnouncement } : announcement));
      setEditingAnnouncement(null);
    } else {
      const announcement: Announcement = {
        ...newAnnouncement as Announcement,
        id: Date.now().toString()
      };
      setAnnouncements([...announcements, announcement]);
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'custom',
        priority: 'medium',
        status: 'draft',
        targetAudience: [],
        publishDate: '',
        expiryDate: '',
        isGlobal: false,
        isSticky: false,
        readCount: 0,
        totalRecipients: 0,
        currency: primaryCurrency
      });
    }
    setShowModal(false);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowModal(true);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setAnnouncements(announcements.map(announcement => {
      if (announcement.id === id) {
        let newStatus = announcement.status;
        if (announcement.status === 'active') {
          newStatus = 'expired';
        } else if (announcement.status === 'draft') {
          newStatus = 'active';
        }
        return { ...announcement, status: newStatus };
      }
      return announcement;
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Settings className="h-4 w-4" />;
      case 'bonus': return <BarChart3 className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      case 'update': return <Globe className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'custom': return <Megaphone className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'bonus': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'update': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-orange-100 text-orange-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
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
                <Megaphone className="h-8 w-8 text-purple-600" />
                Announcement Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage system announcements, member notifications, and communication broadcasts
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Announcement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecipients.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Read Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageReadRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgentAnnouncements}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'announcements', name: 'Announcements', icon: Megaphone },
                { id: 'scheduled', name: 'Scheduled', icon: Calendar },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
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

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Announcement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {announcements.map((announcement) => (
                    <tr key={announcement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{announcement.content}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {announcement.isGlobal ? 'Global' : 'Targeted'} • {announcement.isSticky ? 'Sticky' : 'Normal'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                          {getTypeIcon(announcement.type)}
                          <span className="ml-1 capitalize">{announcement.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                          {announcement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Recipients: {announcement.totalRecipients.toLocaleString()}</div>
                          <div>Read: {announcement.readCount.toLocaleString()}</div>
                          <div>Rate: {((announcement.readCount / announcement.totalRecipients) * 100).toFixed(1)}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(announcement.id)}
                            className={`${announcement.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {announcement.status === 'active' ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
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

        {/* Scheduled Tab */}
        {activeTab === 'scheduled' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Scheduled Announcements</h3>
            
            <div className="space-y-4">
              {announcements.filter(announcement => announcement.status === 'scheduled').map((announcement) => (
                <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                          {getTypeIcon(announcement.type)}
                          <span className="ml-1 capitalize">{announcement.type}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                      <div className="text-xs text-gray-500">
                        Publish: {new Date(announcement.publishDate).toLocaleString()} • 
                        Expiry: {new Date(announcement.expiryDate).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {announcements.filter(announcement => announcement.status === 'scheduled').length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No scheduled announcements</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Announcements</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Megaphone className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="font-medium">{stats.topAnnouncement}</span>
                    </div>
                    <span className="font-semibold text-purple-600">
                      {stats.topReadRate}% read rate
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Welcome to Matrix MLM - New Features Available</span>
                    <span className="font-semibold">83.3% read rate</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Bonus Structure Update - Enhanced Earnings</span>
                    <span className="font-semibold">81.8% read rate</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Announcement Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Announcements</span>
                    <span className="font-semibold">{stats.totalAnnouncements}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Announcements</span>
                    <span className="font-semibold">{stats.activeAnnouncements}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Recipients</span>
                    <span className="font-semibold">{stats.totalRecipients.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Read Rate</span>
                    <span className="font-semibold">{stats.averageReadRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Urgent Announcements</span>
                    <span className="font-semibold">{stats.urgentAnnouncements}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingAnnouncement?.title || newAnnouncement.title}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, title: e.target.value})
                        : setNewAnnouncement({...newAnnouncement, title: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={editingAnnouncement?.type || newAnnouncement.type}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, type: e.target.value as any})
                        : setNewAnnouncement({...newAnnouncement, type: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="system">System</option>
                      <option value="bonus">Bonus</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="update">Update</option>
                      <option value="event">Event</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={editingAnnouncement?.priority || newAnnouncement.priority}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, priority: e.target.value as any})
                        : setNewAnnouncement({...newAnnouncement, priority: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingAnnouncement?.status || newAnnouncement.status}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, status: e.target.value as any})
                        : setNewAnnouncement({...newAnnouncement, status: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                    <input
                      type="datetime-local"
                      value={editingAnnouncement?.publishDate || newAnnouncement.publishDate}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, publishDate: e.target.value})
                        : setNewAnnouncement({...newAnnouncement, publishDate: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="datetime-local"
                      value={editingAnnouncement?.expiryDate || newAnnouncement.expiryDate}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, expiryDate: e.target.value})
                        : setNewAnnouncement({...newAnnouncement, expiryDate: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={editingAnnouncement?.content || newAnnouncement.content}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, content: e.target.value})
                        : setNewAnnouncement({...newAnnouncement, content: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isGlobal"
                      checked={editingAnnouncement?.isGlobal || newAnnouncement.isGlobal}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, isGlobal: e.target.checked})
                        : setNewAnnouncement({...newAnnouncement, isGlobal: e.target.checked})
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isGlobal" className="ml-2 block text-sm text-gray-900">
                      Global announcement
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSticky"
                      checked={editingAnnouncement?.isSticky || newAnnouncement.isSticky}
                      onChange={(e) => editingAnnouncement 
                        ? setEditingAnnouncement({...editingAnnouncement, isSticky: e.target.checked})
                        : setNewAnnouncement({...newAnnouncement, isSticky: e.target.checked})
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isSticky" className="ml-2 block text-sm text-gray-900">
                      Sticky announcement
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingAnnouncement(null);
                      setNewAnnouncement({
                        title: '',
                        content: '',
                        type: 'custom',
                        priority: 'medium',
                        status: 'draft',
                        targetAudience: [],
                        publishDate: '',
                        expiryDate: '',
                        isGlobal: false,
                        isSticky: false,
                        readCount: 0,
                        totalRecipients: 0,
                        currency: primaryCurrency
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAnnouncement}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {editingAnnouncement ? 'Update' : 'Create'}
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

export default AnnouncementManager; 
