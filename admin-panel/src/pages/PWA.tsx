import React from 'react';
import { Zap, Smartphone, Download, Settings, Globe, Shield } from 'lucide-react';

const PWA: React.FC = () => {
  const pwaFeatures = [
    {
      title: 'Offline Access',
      description: 'Access your MLM system even without internet connection',
      icon: Globe,
      color: 'bg-blue-500',
      status: 'Enabled'
    },
    {
      title: 'Mobile App Experience',
      description: 'Native app-like experience on mobile devices',
      icon: Smartphone,
      color: 'bg-green-500',
      status: 'Enabled'
    },
    {
      title: 'Push Notifications',
      description: 'Send real-time notifications to members',
      icon: Zap,
      color: 'bg-purple-500',
      status: 'Enabled'
    },
    {
      title: 'Secure Connection',
      description: 'HTTPS encryption for secure data transmission',
      icon: Shield,
      color: 'bg-yellow-500',
      status: 'Enabled'
    }
  ];

  const installationSteps = [
    {
      step: 1,
      title: 'Add to Home Screen',
      description: 'Users can install the PWA on their device home screen',
      icon: Download,
      color: 'bg-blue-500'
    },
    {
      step: 2,
      title: 'Automatic Updates',
      description: 'PWA updates automatically when new versions are available',
      icon: Settings,
      color: 'bg-green-500'
    },
    {
      step: 3,
      title: 'Offline Functionality',
      description: 'Core features work without internet connection',
      icon: Globe,
      color: 'bg-purple-500'
    },
    {
      step: 4,
      title: 'Cross-Platform',
      description: 'Works on all devices and browsers',
      icon: Smartphone,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progressive Web App</h1>
          <p className="text-gray-600">Transform your MLM system into a powerful mobile app</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Settings className="h-4 w-4 mr-2 inline" />
            Configure PWA
          </button>
        </div>
      </div>

      {/* PWA Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-blue-600" />
            PWA Status
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pwaFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-full ${feature.color} text-white`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.status}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Installation Guide */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Installation Guide</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {installationSteps.map((step) => (
              <div key={step.step} className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${step.color} text-white`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full mr-2">
                      Step {step.step}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PWA Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">PWA Configuration</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">App Name</h3>
                <p className="text-sm text-gray-600">Matrix MLM System</p>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Edit
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">App Icon</h3>
                <p className="text-sm text-gray-600">192x192px PNG icon</p>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Upload
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Theme Color</h3>
                <p className="text-sm text-gray-600">#3B82F6 (Blue)</p>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Start URL</h3>
                <p className="text-sm text-gray-600">/dashboard</p>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Download className="h-5 w-5 mr-3 text-blue-600" />
                <span className="font-medium">Generate Manifest</span>
              </div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-3 text-green-600" />
                <span className="font-medium">Service Worker</span>
              </div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 mr-3 text-purple-600" />
                <span className="font-medium">Test PWA</span>
              </div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-3 text-yellow-600" />
                <span className="font-medium">Push Notifications</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWA; 
