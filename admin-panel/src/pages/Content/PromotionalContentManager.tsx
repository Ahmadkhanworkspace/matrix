import React, { useState, useEffect } from 'react';
import { Megaphone, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Calendar, Image, FileText, Globe, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

// Calendar Component
const ContentCalendar: React.FC<{ content: PromotionalContent[] }> = ({ content }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getContentForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return content.filter(item => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const itemDate = new Date(date);
      return itemDate >= start && itemDate <= end;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDateColor = (date: Date) => {
    const items = getContentForDate(date);
    if (items.length === 0) return '';
    if (items.some(i => i.status === 'active')) return 'bg-green-100 border-green-300';
    if (items.some(i => i.status === 'scheduled')) return 'bg-blue-100 border-blue-300';
    return 'bg-yellow-100 border-yellow-300';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {months[month]} {year}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          const items = getContentForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <div
              key={day}
              onClick={() => setSelectedDate(date)}
              className={`aspect-square p-1 border rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                isToday ? 'border-blue-500 bg-blue-50' : ''
              } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${getDateColor(date)}`}
            >
              <div className="text-xs font-medium mb-1">{day}</div>
              {items.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'active' ? 'bg-green-500' :
                        item.status === 'scheduled' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}
                      title={item.title}
                    />
                  ))}
                  {items.length > 3 && (
                    <div className="text-[8px] text-gray-600">+{items.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {getContentForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getContentForDate(selectedDate).map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-600">
                      {item.type} • {item.status}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' :
                    item.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No content scheduled for this date</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Draft</span>
        </div>
      </div>
    </div>
  );
};

interface PromotionalContent {
  id: string;
  title: string;
  type: 'banner' | 'text-ad' | 'email' | 'popup' | 'notification';
  content: string;
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
}

interface ContentStats {
  totalContent: number;
  activeContent: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  totalBudget: number;
  totalSpent: number;
  topPerformer: string;
  topCtr: number;
}

const PromotionalContentManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('content');
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<PromotionalContent | null>(null);
  const [content, setContent] = useState<PromotionalContent[]>([
    {
      id: '1',
      title: 'Welcome Bonus Banner',
      type: 'banner',
      content: 'Join now and get 50 TRX welcome bonus!',
      status: 'active',
      targetAudience: ['new-members', 'pro-members'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      priority: 'high',
      impressions: 15000,
      clicks: 750,
      ctr: 5.0,
      currency: primaryCurrency,
      budget: 1000,
      spent: 450
    },
    {
      id: '2',
      title: 'Matrix Completion Promotion',
      type: 'text-ad',
      content: 'Complete Matrix Level 3 and earn 500 TRX bonus!',
      status: 'active',
      targetAudience: ['active-members'],
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      priority: 'medium',
      impressions: 8500,
      clicks: 425,
      ctr: 5.0,
      currency: primaryCurrency,
      budget: 500,
      spent: 200
    },
    {
      id: '3',
      title: 'Leadership Program Email',
      type: 'email',
      content: 'Unlock leadership bonuses and earn up to 2000 TRX monthly!',
      status: 'scheduled',
      targetAudience: ['leadership-members'],
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      priority: 'high',
      impressions: 0,
      clicks: 0,
      ctr: 0,
      currency: primaryCurrency,
      budget: 2000,
      spent: 0
    },
    {
      id: '4',
      title: 'System Maintenance Notice',
      type: 'popup',
      content: 'System maintenance scheduled for January 20th, 2-4 AM UTC',
      status: 'active',
      targetAudience: ['all-members'],
      startDate: '2024-01-19',
      endDate: '2024-01-20',
      priority: 'high',
      impressions: 5000,
      clicks: 100,
      ctr: 2.0,
      currency: primaryCurrency,
      budget: 100,
      spent: 50
    }
  ]);

  const [stats, setStats] = useState<ContentStats>({
    totalContent: 4,
    activeContent: 3,
    totalImpressions: 28500,
    totalClicks: 1275,
    averageCtr: 4.5,
    totalBudget: 3600,
    totalSpent: 700,
    topPerformer: 'Welcome Bonus Banner',
    topCtr: 5.0
  });

  const [newContent, setNewContent] = useState<Partial<PromotionalContent>>({
    title: '',
    type: 'banner',
    content: '',
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
    spent: 0
  });

  const audienceOptions = [
    'all-members',
    'new-members',
    'pro-members',
    'active-members',
    'leadership-members',
    'inactive-members'
  ];

  const handleSaveContent = () => {
    if (editingContent) {
      setContent(content.map(item => item.id === editingContent.id ? { ...editingContent } : item));
      setEditingContent(null);
    } else {
      const newItem: PromotionalContent = {
        ...newContent as PromotionalContent,
        id: Date.now().toString()
      };
      setContent([...content, newItem]);
      setNewContent({
        title: '',
        type: 'banner',
        content: '',
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
        spent: 0
      });
    }
    setShowModal(false);
  };

  const handleEditContent = (item: PromotionalContent) => {
    setEditingContent(item);
    setShowModal(true);
  };

  const handleDeleteContent = (id: string) => {
    setContent(content.filter(item => item.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setContent(content.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'active' ? 'inactive' : 'active';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner': return <Image className="h-4 w-4" />;
      case 'text-ad': return <FileText className="h-4 w-4" />;
      case 'email': return <Globe className="h-4 w-4" />;
      case 'popup': return <Target className="h-4 w-4" />;
      case 'notification': return <Megaphone className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'banner': return 'bg-blue-100 text-blue-800';
      case 'text-ad': return 'bg-green-100 text-green-800';
      case 'email': return 'bg-purple-100 text-purple-800';
      case 'popup': return 'bg-orange-100 text-orange-800';
      case 'notification': return 'bg-red-100 text-red-800';
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
                <Megaphone className="h-8 w-8 text-purple-600" />
                Promotional Content Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage banners, text ads, emails, and promotional content
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Content
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
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
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
                { id: 'content', name: 'Content', icon: Megaphone },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'scheduling', name: 'Scheduling', icon: Calendar }
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

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Promotional Content</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
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
                  {content.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{item.content}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                          <span className="ml-1 capitalize">{item.type.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Impressions: {item.impressions.toLocaleString()}</div>
                          <div>Clicks: {item.clicks.toLocaleString()}</div>
                          <div>CTR: {item.ctr}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Budget: {primaryCurrency} {item.budget}</div>
                          <div>Spent: {primaryCurrency} {item.spent}</div>
                          <div className="text-xs text-gray-500">
                            {((item.spent / item.budget) * 100).toFixed(1)}% used
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditContent(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item.id)}
                            className={`${item.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {item.status === 'active' ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteContent(item.id)}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Megaphone className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="font-medium">{stats.topPerformer}</span>
                    </div>
                    <span className="font-semibold text-purple-600">
                      {stats.topCtr}% CTR
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Matrix Completion Promotion</span>
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
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(stats.totalSpent / stats.totalBudget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduling Tab */}
        {activeTab === 'scheduling' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Content Scheduling</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Scheduled Content</h4>
                <div className="space-y-3">
                  {content.filter(item => item.status === 'scheduled').map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600">
                          {item.startDate} to {item.endDate}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                          <span className="ml-1 capitalize">{item.type.replace('-', ' ')}</span>
                        </span>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Calendar View</h4>
                <ContentCalendar content={content} />
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
                  {editingContent ? 'Edit Content' : 'Add New Content'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingContent?.title || newContent.title}
                      onChange={(e) => editingContent 
                        ? setEditingContent({...editingContent, title: e.target.value})
                        : setNewContent({...newContent, title: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={editingContent?.type || newContent.type}
                      onChange={(e) => editingContent 
                        ? setEditingContent({...editingContent, type: e.target.value as any})
                        : setNewContent({...newContent, type: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="banner">Banner</option>
                      <option value="text-ad">Text Ad</option>
                      <option value="email">Email</option>
                      <option value="popup">Popup</option>
                      <option value="notification">Notification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={editingContent?.content || newContent.content}
                      onChange={(e) => editingContent 
                        ? setEditingContent({...editingContent, content: e.target.value})
                        : setNewContent({...newContent, content: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingContent?.status || newContent.status}
                      onChange={(e) => editingContent 
                        ? setEditingContent({...editingContent, status: e.target.value as any})
                        : setNewContent({...newContent, status: e.target.value as any})
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={editingContent?.priority || newContent.priority}
                      onChange={(e) => editingContent 
                        ? setEditingContent({...editingContent, priority: e.target.value as any})
                        : setNewContent({...newContent, priority: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={editingContent?.startDate || newContent.startDate}
                      onChange={(e) => editingContent 
                        ? setEditingContent({...editingContent, startDate: e.target.value})
                        : setNewContent({...newContent, startDate: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={editingContent?.endDate || newContent.endDate}
                      onChange={(e) => editingContent 
                        ? setEditingContent({...editingContent, endDate: e.target.value})
                        : setNewContent({...newContent, endDate: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                    <input
                      type="number"
                      value={editingContent?.budget || newContent.budget}
                      onChange={(e) => editingContent 
                        ? setEditingContent({...editingContent, budget: parseInt(e.target.value) || 0})
                        : setNewContent({...newContent, budget: parseInt(e.target.value) || 0})
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
                      setEditingContent(null);
                      setNewContent({
                        title: '',
                        type: 'banner',
                        content: '',
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
                        spent: 0
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContent}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {editingContent ? 'Update' : 'Create'}
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

export default PromotionalContentManager; 
