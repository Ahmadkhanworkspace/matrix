import React from 'react';
import { Settings as SettingsIcon, Users, CreditCard, FileText, Shield, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  const settingsCategories = [
    {
      title: 'Admin Settings',
      description: 'Configure site information, admin credentials, and basic settings',
      icon: SettingsIcon,
      color: 'bg-blue-500',
      href: '/settings/admin'
    },
    {
      title: 'Email Settings',
      description: 'Manage email templates, SMTP configuration, and notifications',
      icon: FileText,
      color: 'bg-green-500',
      href: '/settings/email'
    },
    {
      title: 'Payment Gateways',
      description: 'Configure payment methods, currencies, and transaction settings',
      icon: CreditCard,
      color: 'bg-purple-500',
      href: '/admin/settings/payment-gateways'
    },
    {
      title: 'Member Management',
      description: 'Member settings, verification, and membership levels',
      icon: Users,
      color: 'bg-yellow-500',
      href: '/settings/members'
    },
    {
      title: 'Security Settings',
      description: 'Security configurations, access control, and system protection',
      icon: Shield,
      color: 'bg-red-500',
      href: '/settings/security'
    },
    {
      title: 'System Configuration',
      description: 'Advanced system settings, maintenance, and optimization',
      icon: Globe,
      color: 'bg-indigo-500',
      href: '/settings/system'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your Matrix MLM system settings</p>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-full ${category.color} text-white`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">{category.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{category.description}</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Configure
            </button>
          </div>
        ))}
      </div>

      {/* Quick Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Settings</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Site Maintenance Mode</h3>
                <p className="text-sm text-gray-600">Temporarily disable site access for maintenance</p>
              </div>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Configure system email notifications</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Backup System</h3>
                <p className="text-sm text-gray-600">Create database and system backups</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Backup Now
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">System Updates</h3>
                <p className="text-sm text-gray-600">Check for and install system updates</p>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Check Updates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
