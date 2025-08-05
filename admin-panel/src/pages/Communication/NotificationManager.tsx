import React, { useState, useEffect } from 'react';
import { Bell, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Users, Globe, Target, Clock, CheckCircle } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'bonus' | 'withdrawal' | 'matrix' | 'leadership' | 'maintenance' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'inactive' | 'scheduled' | 'sent';
  targetAudience: string[];
  sendDate: string;
  readCount: number;
  totalSent: number;
  currency: string;
  isGlobal: boolean;
  requiresAction: boolean;
}

interface NotificationStats {
  totalNotifications: number;
  activeNotifications: number;
  totalSent: number;
  averageReadRate: number;
  urgentNotifications: number;
  topNotification: string;
  topReadRate: number;
}

const NotificationManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('notifications');
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to Matrix MLM!',
      message: 'Welcome to Matrix MLM! Your account has been successfully created. Start earning by completing your profile and inviting referrals.',
      type: 'system',
      priority: 'high',
      status: 'active',
      targetAudience: ['new-members'],
      sendDate: '2024-01-01',
      readCount: 1250,
      totalSent: 1300,
      currency: primaryCurrency,
      isGlobal: false,
      requiresAction: true
    },
    {
      id: '2',
      title: 'Bonus Earned - 50 TRX',
      message: 'Congratulations! You have earned a bonus of 50 TRX for completing Matrix Level 1. Check your wallet for details.',
      type: 'bonus',
      priority: 'medium',
      status: 'sent',
      targetAudience: ['active-members'],
      sendDate: '2024-01-15',
      readCount: 850,
      totalSent: 900,
      currency: primaryCurrency,
      isGlobal: false,
      requiresAction: false
    },
    {
      id: '3',
      title: 'System Maintenance Scheduled',
      message: 'System maintenance is scheduled for January 20th, 2-4 AM UTC. Services may be temporarily unavailable.',
      type: 'maintenance',
      priority: 'urgent',
      status: 'active',
      targetAudience: ['all-members'],
      sendDate: '2024-01-19',
      readCount: 5000,
      totalSent: 5200,
      currency: primaryCurrency,
      isGlobal: true,
      requiresAction: false
    },
    {
      id: '4',
      title: 'Matrix Level 3 Completed',
      message: 'Fantastic! You have completed Matrix Level 3 and earned 500 TRX bonus. Your leadership rank has been upgraded.',
      type: 'matrix',
      priority: 'high',
      status: 'sent',
      targetAudience: ['active-members'],
      sendDate: '2024-01-18',
      readCount: 320,
      totalSent: 350,
      currency: primaryCurrency,
      isGlobal: false,
      requiresAction: true
    },
    {
      id: '5',
      title: 'Withdrawal Processed',
      message: 'Your withdrawal request for 200 TRX has been processed. Transaction ID: TX123456789. Funds will be transferred within 24 hours.',
      type: 'withdrawal',
      priority: 'medium',
      status: 'sent',
      targetAudience: ['all-members'],
      sendDate: '2024-01-17',
      readCount: 180,
      totalSent: 200,
      currency: primaryCurrency,
      isGlobal: false,
      requiresAction: false
    }
  ]);

  const [stats, setStats] = useState<NotificationStats>({
    totalNotifications: 5,
    activeNotifications: 2,
    totalSent: 7950,
    averageReadRate: 85.2,
    urgentNotifications: 1,
    topNotification: 'Welcome to Matrix MLM!',
    topReadRate: 96.2
  });

  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    title: '',
    message: '',
    type: 'custom',
    priority: 'medium',
    status: 'inactive',
    targetAudience: [],
    sendDate: '',
    readCount: 0
  });

  const audienceOptions = [
    'all-members',
    'new-members',
    'pro-members',
    'active-members',
    'leadership-members',
    'inactive-members'
  ];

  const handleSaveNotification = () => {
    if (editingNotification) {
      setNotifications(notifications.map(notification => notification.id === editingNotification.id ? { ...editingNotification } : notification));
      setEditingNotification(null);
    } else {
      const notification: Notification = {
        ...newNotification as Notification,
        id: Date.now().toString()
      };
      setNotifications([...notifications, notification]);
      setNewNotification({
        title: '',
        message: '',
        type: 'custom',
        priority: 'medium',
        status: 'inactive',
        targetAudience: [],
        sendDate: '',
        readCount: 0,
        totalSent: 0,
        currency: primaryCurrency,
        isGlobal: false,
        requiresAction: false
      });
    }
    setShowModal(false);
  };

  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification);
    setShowModal(true);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setNotifications(notifications.map(notification => {
      if (notification.id === id) {
        const newStatus = notification.status === 'active' ? 'inactive' : 'active';
        return { ...notification, status: newStatus };
      }
      return notification;
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Globe className="h-4 w-4" />;
      case 'bonus': return <BarChart3 className="h-4 w-4" />;
      case 'withdrawal': return <Save className="h-4 w-4" />;
      case 'matrix': return <Target className="h-4 w-4" />;
      case 'leadership': return <Users className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'custom': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'bonus': return 'bg-green-100 text-green-800';
      case 'withdrawal': return 'bg-purple-100 text-purple-800';
      case 'matrix': return 'bg-orange-100 text-orange-800';
      case 'leadership': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
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
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-gray-100 text-gray-800';
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
                <Bell className="h-8 w-8 text-orange-600" />
                Notification Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage system notifications, user alerts, and communication preferences
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Notification
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Urgent Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgentNotifications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'notifications', name: 'Notifications', icon: Bell },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'preferences', name: 'Preferences', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
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

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notification
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
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {notification.isGlobal ? 'Global' : 'Targeted'} • {notification.requiresAction ? 'Action Required' : 'Info Only'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                          <span className="ml-1 capitalize">{notification.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Sent: {notification.totalSent.toLocaleString()}</div>
                          <div>Read: {notification.readCount.toLocaleString()}</div>
                          <div>Rate: {((notification.readCount / notification.totalSent) * 100).toFixed(1)}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditNotification(notification)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(notification.id)}
                            className={`${notification.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {notification.status === 'active' ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="font-medium">{stats.topNotification}</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      {stats.topReadRate}% read rate
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Bonus Earned - 50 TRX</span>
                    <span className="font-semibold">94.4% read rate</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>System Maintenance Scheduled</span>
                    <span className="font-semibold">96.2% read rate</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Notifications</span>
                    <span className="font-semibold">{stats.totalNotifications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Notifications</span>
                    <span className="font-semibold">{stats.activeNotifications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Sent</span>
                    <span className="font-semibold">{stats.totalSent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Read Rate</span>
                    <span className="font-semibold">{stats.averageReadRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Urgent Notifications</span>
                    <span className="font-semibold">{stats.urgentNotifications}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Global Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Enable system notifications</span>
                    <span className="text-green-600 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Email notifications</span>
                    <span className="text-green-600 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Push notifications</span>
                    <span className="text-green-600 text-sm">Active</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Member Type Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {audienceOptions.map((audience) => (
                    <div key={audience} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium capitalize">{audience.replace('-', ' ')}</span>
                        <span className="text-green-600 text-sm">Enabled</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          System notifications
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Bonus notifications
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Matrix updates
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {editingNotification ? 'Edit Notification' : 'Add New Notification'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingNotification?.title || newNotification.title}
                      onChange={(e) => editingNotification 
                        ? setEditingNotification({...editingNotification, title: e.target.value})
                        : setNewNotification({...newNotification, title: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={editingNotification?.message || newNotification.message}
                      onChange={(e) => editingNotification 
                        ? setEditingNotification({...editingNotification, message: e.target.value})
                        : setNewNotification({...newNotification, message: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={editingNotification?.type || newNotification.type}
                      onChange={(e) => editingNotification 
                        ? setEditingNotification({...editingNotification, type: e.target.value as any})
                        : setNewNotification({...newNotification, type: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="system">System</option>
                      <option value="bonus">Bonus</option>
                      <option value="withdrawal">Withdrawal</option>
                      <option value="matrix">Matrix</option>
                      <option value="leadership">Leadership</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={editingNotification?.priority || newNotification.priority}
                      onChange={(e) => editingNotification 
                        ? setEditingNotification({...editingNotification, priority: e.target.value as any})
                        : setNewNotification({...newNotification, priority: e.target.value as any})
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
                      value={editingNotification?.status || newNotification.status}
                      onChange={(e) => editingNotification 
                        ? setEditingNotification({...editingNotification, status: e.target.value as any})
                        : setNewNotification({...newNotification, status: e.target.value as any})
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Send Date</label>
                    <input
                      type="date"
                      value={editingNotification?.sendDate || newNotification.sendDate}
                      onChange={(e) => editingNotification 
                        ? setEditingNotification({...editingNotification, sendDate: e.target.value})
                        : setNewNotification({...newNotification, sendDate: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isGlobal"
                      checked={editingNotification?.isGlobal || newNotification.isGlobal}
                      onChange={(e) => editingNotification 
                        ? setEditingNotification({...editingNotification, isGlobal: e.target.checked})
                        : setNewNotification({...newNotification, isGlobal: e.target.checked})
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isGlobal" className="ml-2 block text-sm text-gray-900">
                      Global notification
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requiresAction"
                      checked={editingNotification?.requiresAction || newNotification.requiresAction}
                      onChange={(e) => editingNotification 
                        ? setEditingNotification({...editingNotification, requiresAction: e.target.checked})
                        : setNewNotification({...newNotification, requiresAction: e.target.checked})
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiresAction" className="ml-2 block text-sm text-gray-900">
                      Requires action
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingNotification(null);
                      setNewNotification({
                        title: '',
                        message: '',
                        type: 'custom',
                        priority: 'medium',
                        status: 'inactive',
                        targetAudience: [],
                        sendDate: '',
                        readCount: 0,
                        totalSent: 0,
                        currency: primaryCurrency,
                        isGlobal: false,
                        requiresAction: false
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotification}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    {editingNotification ? 'Update' : 'Create'}
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

export default NotificationManager; 
