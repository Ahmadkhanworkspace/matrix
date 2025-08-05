import React, { useState, useEffect } from 'react';
import { Mail, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Send, FileText, Users, Bell, Globe } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'bonus' | 'withdrawal' | 'matrix-completion' | 'leadership' | 'maintenance' | 'custom';
  status: 'active' | 'inactive' | 'draft';
  variables: string[];
  targetAudience: string[];
  sendCount: number;
  openRate: number;
  clickRate: number;
  currency: string;
}

interface EmailStats {
  totalTemplates: number;
  activeTemplates: number;
  totalSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  topTemplate: string;
  topOpenRate: number;
}

const EmailTemplateManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('templates');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Matrix MLM - Get Started Today!',
      content: `Dear {{member_name}},

Welcome to Matrix MLM! We're excited to have you join our community.

Your account details:
- Member ID: {{member_id}}
- Username: {{username}}
- Join Date: {{join_date}}

Get started by:
1. Completing your profile
2. Inviting your first referrals
3. Exploring the matrix structure

Start earning with our generous bonus structure!

Best regards,
Matrix MLM Team`,
      type: 'welcome',
      status: 'active',
      variables: ['member_name', 'member_id', 'username', 'join_date'],
      targetAudience: ['new-members'],
      sendCount: 1250,
      openRate: 85.5,
      clickRate: 12.3,
      currency: primaryCurrency
    },
    {
      id: '2',
      name: 'Bonus Notification',
      subject: 'Congratulations! You earned {{bonus_amount}} {{currency}}',
      content: `Dear {{member_name}},

Congratulations! You have earned a bonus of {{bonus_amount}} {{currency}}.

Bonus Details:
- Type: {{bonus_type}}
- Date: {{bonus_date}}
- Level: {{matrix_level}}

Your total earnings: {{total_earnings}} {{currency}}

Keep up the great work!

Best regards,
Matrix MLM Team`,
      type: 'bonus',
      status: 'active',
      variables: ['member_name', 'bonus_amount', 'currency', 'bonus_type', 'bonus_date', 'matrix_level', 'total_earnings'],
      targetAudience: ['all-members'],
      sendCount: 850,
      openRate: 92.1,
      clickRate: 18.7,
      currency: primaryCurrency
    },
    {
      id: '3',
      name: 'Matrix Completion',
      subject: 'Matrix Level {{level}} Completed - {{bonus_amount}} {{currency}} Bonus!',
      content: `Dear {{member_name}},

Fantastic news! You have successfully completed Matrix Level {{level}}.

Completion Details:
- Level: {{level}}
- Completion Date: {{completion_date}}
- Bonus Earned: {{bonus_amount}} {{currency}}
- Next Level: {{next_level}}

You're making excellent progress! Continue to build your network.

Best regards,
Matrix MLM Team`,
      type: 'matrix-completion',
      status: 'active',
      variables: ['member_name', 'level', 'completion_date', 'bonus_amount', 'currency', 'next_level'],
      targetAudience: ['active-members'],
      sendCount: 320,
      openRate: 88.9,
      clickRate: 15.2,
      currency: primaryCurrency
    },
    {
      id: '4',
      name: 'Withdrawal Confirmation',
      subject: 'Withdrawal Request Confirmed - {{amount}} {{currency}}',
      content: `Dear {{member_name}},

Your withdrawal request has been confirmed.

Withdrawal Details:
- Amount: {{amount}} {{currency}}
- Request Date: {{request_date}}
- Confirmation Date: {{confirmation_date}}
- Transaction ID: {{transaction_id}}

The funds will be transferred to your registered wallet within 24-48 hours.

Best regards,
Matrix MLM Team`,
      type: 'withdrawal',
      status: 'active',
      variables: ['member_name', 'amount', 'currency', 'request_date', 'confirmation_date', 'transaction_id'],
      targetAudience: ['all-members'],
      sendCount: 180,
      openRate: 95.2,
      clickRate: 8.5,
      currency: primaryCurrency
    }
  ]);

  const [stats, setStats] = useState<EmailStats>({
    totalTemplates: 4,
    activeTemplates: 4,
    totalSent: 2600,
    averageOpenRate: 90.4,
    averageClickRate: 13.7,
    topTemplate: 'Bonus Notification',
    topOpenRate: 92.1
  });

  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    content: '',
    type: 'custom',
    status: 'draft',
    variables: [],
    targetAudience: [],
    sendCount: 0,
    openRate: 0,
    clickRate: 0,
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

  const variableOptions = [
    'member_name',
    'member_id',
    'username',
    'join_date',
    'bonus_amount',
    'currency',
    'bonus_type',
    'bonus_date',
    'matrix_level',
    'total_earnings',
    'level',
    'completion_date',
    'next_level',
    'amount',
    'request_date',
    'confirmation_date',
    'transaction_id'
  ];

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(templates.map(template => template.id === editingTemplate.id ? { ...editingTemplate } : template));
      setEditingTemplate(null);
    } else {
      const template: EmailTemplate = {
        ...newTemplate as EmailTemplate,
        id: Date.now().toString()
      };
      setTemplates([...templates, template]);
      setNewTemplate({
        name: '',
        subject: '',
        content: '',
        type: 'custom',
        status: 'draft',
        variables: [],
        targetAudience: [],
        sendCount: 0,
        openRate: 0,
        clickRate: 0,
        currency: primaryCurrency
      });
    }
    setShowModal(false);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTemplates(templates.map(template => {
      if (template.id === id) {
        const newStatus = template.status === 'active' ? 'inactive' : 'active';
        return { ...template, status: newStatus };
      }
      return template;
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Users className="h-4 w-4" />;
      case 'bonus': return <BarChart3 className="h-4 w-4" />;
      case 'withdrawal': return <Send className="h-4 w-4" />;
      case 'matrix-completion': return <Globe className="h-4 w-4" />;
      case 'leadership': return <Bell className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'custom': return <FileText className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-blue-100 text-blue-800';
      case 'bonus': return 'bg-green-100 text-green-800';
      case 'withdrawal': return 'bg-purple-100 text-purple-800';
      case 'matrix-completion': return 'bg-orange-100 text-orange-800';
      case 'leadership': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      case 'custom': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
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
                <Mail className="h-8 w-8 text-blue-600" />
                Email Template Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage email templates, notifications, and automated campaigns
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Template
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageOpenRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageClickRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'templates', name: 'Templates', icon: Mail },
                { id: 'campaigns', name: 'Campaigns', icon: Send },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
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
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
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
                      Variables
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{template.subject}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                          {getTypeIcon(template.type)}
                          <span className="ml-1 capitalize">{template.type.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                          {template.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Sent: {template.sendCount.toLocaleString()}</div>
                          <div>Open Rate: {template.openRate}%</div>
                          <div>Click Rate: {template.clickRate}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {template.variables.length} variables
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(template.id)}
                            className={`${template.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {template.status === 'active' ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
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

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Campaigns</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Active Campaigns</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Welcome Series</div>
                        <div className="text-sm text-gray-600">3 emails, 1250 recipients</div>
                      </div>
                      <span className="text-green-600 text-sm">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Bonus Notifications</div>
                        <div className="text-sm text-gray-600">1 email, 850 recipients</div>
                      </div>
                      <span className="text-green-600 text-sm">Active</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Scheduled Campaigns</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Leadership Program</div>
                        <div className="text-sm text-gray-600">Scheduled for Feb 1st</div>
                      </div>
                      <span className="text-yellow-600 text-sm">Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Templates</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium">{stats.topTemplate}</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {stats.topOpenRate}% open rate
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Welcome Email</span>
                    <span className="font-semibold">85.5% open rate</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Matrix Completion</span>
                    <span className="font-semibold">88.9% open rate</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Emails Sent</span>
                    <span className="font-semibold">{stats.totalSent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Open Rate</span>
                    <span className="font-semibold">{stats.averageOpenRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Click Rate</span>
                    <span className="font-semibold">{stats.averageClickRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Templates</span>
                    <span className="font-semibold">{stats.activeTemplates}</span>
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
                  {editingTemplate ? 'Edit Template' : 'Add New Template'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={editingTemplate?.name || newTemplate.name}
                      onChange={(e) => editingTemplate 
                        ? setEditingTemplate({...editingTemplate, name: e.target.value})
                        : setNewTemplate({...newTemplate, name: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                    <input
                      type="text"
                      value={editingTemplate?.subject || newTemplate.subject}
                      onChange={(e) => editingTemplate 
                        ? setEditingTemplate({...editingTemplate, subject: e.target.value})
                        : setNewTemplate({...newTemplate, subject: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={editingTemplate?.type || newTemplate.type}
                      onChange={(e) => editingTemplate 
                        ? setEditingTemplate({...editingTemplate, type: e.target.value as any})
                        : setNewTemplate({...newTemplate, type: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="welcome">Welcome</option>
                      <option value="bonus">Bonus</option>
                      <option value="withdrawal">Withdrawal</option>
                      <option value="matrix-completion">Matrix Completion</option>
                      <option value="leadership">Leadership</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingTemplate?.status || newTemplate.status}
                      onChange={(e) => editingTemplate 
                        ? setEditingTemplate({...editingTemplate, status: e.target.value as any})
                        : setNewTemplate({...newTemplate, status: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={editingTemplate?.content || newTemplate.content}
                      onChange={(e) => editingTemplate 
                        ? setEditingTemplate({...editingTemplate, content: e.target.value})
                        : setNewTemplate({...newTemplate, content: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={6}
                      placeholder="Use {{variable_name}} for dynamic content"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplate(null);
                      setNewTemplate({
                        name: '',
                        subject: '',
                        content: '',
                        type: 'custom',
                        status: 'draft',
                        variables: [],
                        targetAudience: [],
                        sendCount: 0,
                        openRate: 0,
                        clickRate: 0,
                        currency: primaryCurrency
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingTemplate ? 'Update' : 'Create'}
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

export default EmailTemplateManager; 
