import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  FileText,
  Code,
  Palette,
  Mail,
  Bell
} from 'lucide-react';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: 'welcome' | 'notification' | 'withdrawal' | 'cycle_completion' | 'custom';
  isActive: boolean;
  created_at: string;
}

interface NotificationTemplate {
  id: number;
  name: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  isActive: boolean;
  created_at: string;
}

interface SystemTemplate {
  id: number;
  name: string;
  content: string;
  type: 'page' | 'component' | 'layout';
  isActive: boolean;
  created_at: string;
}

const TemplateSettings: React.FC = () => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [systemTemplates, setSystemTemplates] = useState<SystemTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'email' | 'notification' | 'system'>('email');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showSystemForm, setShowSystemForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [newEmailTemplate, setNewEmailTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'custom' as const,
    isActive: true
  });

  const [newNotificationTemplate, setNewNotificationTemplate] = useState({
    name: '',
    title: '',
    message: '',
    type: 'info' as const,
    isActive: true
  });

  const [newSystemTemplate, setNewSystemTemplate] = useState({
    name: '',
    content: '',
    type: 'page' as const,
    isActive: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockEmailTemplates: EmailTemplate[] = [
        {
          id: 1,
          name: 'Welcome Email',
          subject: 'Welcome to Matrix MLM System',
          content: 'Dear {username},\n\nWelcome to our MLM system! Your account has been successfully created.\n\nBest regards,\nMatrix MLM Team',
          variables: ['{username}', '{email}', '{join_date}'],
          type: 'welcome',
          isActive: true,
          created_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Withdrawal Notification',
          subject: 'Withdrawal Request Processed',
          content: 'Dear {username},\n\nYour withdrawal request for {amount} has been processed.\n\nTransaction ID: {transaction_id}\n\nBest regards,\nMatrix MLM Team',
          variables: ['{username}', '{amount}', '{transaction_id}'],
          type: 'withdrawal',
          isActive: true,
          created_at: '2024-01-01'
        }
      ];

      const mockNotificationTemplates: NotificationTemplate[] = [
        {
          id: 1,
          name: 'Cycle Completion',
          title: 'Cycle Completed',
          message: 'Congratulations! Your matrix cycle has been completed. You earned {amount}.',
          type: 'success',
          isActive: true,
          created_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'New Referral',
          title: 'New Referral',
          message: 'You have a new referral: {referral_username}.',
          type: 'info',
          isActive: true,
          created_at: '2024-01-01'
        }
      ];

      const mockSystemTemplates: SystemTemplate[] = [
        {
          id: 1,
          name: 'Main Layout',
          content: '<div class="layout">{content}</div>',
          type: 'layout',
          isActive: true,
          created_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Dashboard Widget',
          content: '<div class="widget">{widget_content}</div>',
          type: 'component',
          isActive: true,
          created_at: '2024-01-01'
        }
      ];

      setEmailTemplates(mockEmailTemplates);
      setNotificationTemplates(mockNotificationTemplates);
      setSystemTemplates(mockSystemTemplates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmailTemplate = async () => {
    try {
      if (editingTemplate) {
        // Update existing template
        setEmailTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? { ...editingTemplate } : t
        ));
      } else {
        // Create new template
        const newTemplate: EmailTemplate = {
          id: Date.now(),
          ...newEmailTemplate,
          variables: extractVariables(newEmailTemplate.content),
          created_at: new Date().toISOString()
        };
        setEmailTemplates(prev => [newTemplate, ...prev]);
      }
      setShowEmailForm(false);
      setEditingTemplate(null);
      setNewEmailTemplate({ name: '', subject: '', content: '', type: 'custom', isActive: true });
    } catch (error) {
      console.error('Failed to save email template:', error);
    }
  };

  const handleSaveNotificationTemplate = async () => {
    try {
      if (editingTemplate) {
        // Update existing template
        setNotificationTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? { ...editingTemplate } : t
        ));
      } else {
        // Create new template
        const newTemplate: NotificationTemplate = {
          id: Date.now(),
          ...newNotificationTemplate,
          created_at: new Date().toISOString()
        };
        setNotificationTemplates(prev => [newTemplate, ...prev]);
      }
      setShowNotificationForm(false);
      setEditingTemplate(null);
      setNewNotificationTemplate({ name: '', title: '', message: '', type: 'info', isActive: true });
    } catch (error) {
      console.error('Failed to save notification template:', error);
    }
  };

  const handleSaveSystemTemplate = async () => {
    try {
      if (editingTemplate) {
        // Update existing template
        setSystemTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? { ...editingTemplate } : t
        ));
      } else {
        // Create new template
        const newTemplate: SystemTemplate = {
          id: Date.now(),
          ...newSystemTemplate,
          created_at: new Date().toISOString()
        };
        setSystemTemplates(prev => [newTemplate, ...prev]);
      }
      setShowSystemForm(false);
      setEditingTemplate(null);
      setNewSystemTemplate({ name: '', content: '', type: 'page', isActive: true });
    } catch (error) {
      console.error('Failed to save system template:', error);
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      variables.push(match[0]);
    }
    return Array.from(new Set(variables));
  };

  const handleEditTemplate = (template: any, type: string) => {
    setEditingTemplate(template);
    if (type === 'email') {
      setNewEmailTemplate({
        name: template.name,
        subject: template.subject,
        content: template.content,
        type: template.type,
        isActive: template.isActive
      });
      setShowEmailForm(true);
    } else if (type === 'notification') {
      setNewNotificationTemplate({
        name: template.name,
        title: template.title,
        message: template.message,
        type: template.type,
        isActive: template.isActive
      });
      setShowNotificationForm(true);
    } else if (type === 'system') {
      setNewSystemTemplate({
        name: template.name,
        content: template.content,
        type: template.type,
        isActive: template.isActive
      });
      setShowSystemForm(true);
    }
  };

  const handleDeleteTemplate = (templateId: number, type: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      if (type === 'email') {
        setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
      } else if (type === 'notification') {
        setNotificationTemplates(prev => prev.filter(t => t.id !== templateId));
      } else if (type === 'system') {
        setSystemTemplates(prev => prev.filter(t => t.id !== templateId));
      }
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      welcome: 'bg-green-100 text-green-800',
      notification: 'bg-blue-100 text-blue-800',
      withdrawal: 'bg-yellow-100 text-yellow-800',
      cycle_completion: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      page: 'bg-indigo-100 text-indigo-800',
      component: 'bg-pink-100 text-pink-800',
      layout: 'bg-orange-100 text-orange-800'
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>{type}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Settings</h1>
          <p className="text-gray-600">Manage email, notification, and system templates</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Hide Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Mail className="h-4 w-4 mr-2 inline" />
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab('notification')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notification'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bell className="h-4 w-4 mr-2 inline" />
            Notification Templates
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            System Templates
          </button>
        </nav>
      </div>

      {/* Email Templates */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
            <Button onClick={() => setShowEmailForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Email Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template, 'email')}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id, 'email')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {getTypeBadge(template.type)}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-3">
                    {template.content.substring(0, 100)}...
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {variable}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notification Templates */}
      {activeTab === 'notification' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Notification Templates</h2>
            <Button onClick={() => setShowNotificationForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Notification Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notificationTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{template.title}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template, 'notification')}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id, 'notification')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {getTypeBadge(template.type)}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {template.message.substring(0, 100)}...
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* System Templates */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">System Templates</h2>
            <Button onClick={() => setShowSystemForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New System Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{template.type}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template, 'system')}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id, 'system')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {getTypeBadge(template.type)}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 font-mono">
                    {template.content.substring(0, 100)}...
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Email Template Form Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingTemplate ? 'Edit Email Template' : 'New Email Template'}
              </h2>
              <button onClick={() => setShowEmailForm(false)}>×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <Input
                  value={newEmailTemplate.name}
                  onChange={(e) => setNewEmailTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Welcome Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <Input
                  value={newEmailTemplate.subject}
                  onChange={(e) => setNewEmailTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Welcome to Matrix MLM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                <select
                  value={newEmailTemplate.type}
                  onChange={(e) => setNewEmailTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="welcome">Welcome</option>
                  <option value="notification">Notification</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="cycle_completion">Cycle Completion</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newEmailTemplate.isActive}
                  onChange={(e) => setNewEmailTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
              <textarea
                value={newEmailTemplate.content}
                onChange={(e) => setNewEmailTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Dear {username},&#10;&#10;Welcome to our MLM system!&#10;&#10;Best regards,&#10;Matrix MLM Team"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use variables like {'{username}'}, {'{email}'}, {'{amount}'} in your content.
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEmailForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEmailTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Template Form Modal */}
      {showNotificationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingTemplate ? 'Edit Notification Template' : 'New Notification Template'}
              </h2>
              <button onClick={() => setShowNotificationForm(false)}>×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <Input
                  value={newNotificationTemplate.name}
                  onChange={(e) => setNewNotificationTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Cycle Completion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
                <Input
                  value={newNotificationTemplate.title}
                  onChange={(e) => setNewNotificationTemplate(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Cycle Completed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                <select
                  value={newNotificationTemplate.type}
                  onChange={(e) => setNewNotificationTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="info">Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newNotificationTemplate.message}
                  onChange={(e) => setNewNotificationTemplate(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your notification message here..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newNotificationTemplate.isActive}
                  onChange={(e) => setNewNotificationTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowNotificationForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNotificationTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* System Template Form Modal */}
      {showSystemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingTemplate ? 'Edit System Template' : 'New System Template'}
              </h2>
              <button onClick={() => setShowSystemForm(false)}>×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <Input
                  value={newSystemTemplate.name}
                  onChange={(e) => setNewSystemTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Main Layout"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                <select
                  value={newSystemTemplate.type}
                  onChange={(e) => setNewSystemTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="page">Page</option>
                  <option value="component">Component</option>
                  <option value="layout">Layout</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Content</label>
              <textarea
                value={newSystemTemplate.content}
                onChange={(e) => setNewSystemTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="<div class='template'>{content}</div>"
              />
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={newSystemTemplate.isActive}
                onChange={(e) => setNewSystemTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowSystemForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSystemTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSettings; 
