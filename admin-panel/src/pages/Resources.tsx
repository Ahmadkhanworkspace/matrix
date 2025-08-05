import React from 'react';
import { BookOpen, ExternalLink, Download, FileText, Video, Globe, Users, Target } from 'lucide-react';

const Resources = () => {
  const resources = [
    {
      category: 'Documentation',
      icon: BookOpen,
      color: 'bg-blue-500',
      items: [
        {
          title: 'Admin Panel User Guide',
          description: 'Complete guide to using the admin panel',
          type: 'PDF',
          size: '2.5 MB',
          url: '#'
        },
        {
          title: 'Matrix MLM System Manual',
          description: 'Detailed system configuration guide',
          type: 'PDF',
          size: '4.1 MB',
          url: '#'
        },
        {
          title: 'API Documentation',
          description: 'Technical API reference guide',
          type: 'PDF',
          size: '1.8 MB',
          url: '#'
        }
      ]
    },
    {
      category: 'Video Tutorials',
      icon: Video,
      color: 'bg-green-500',
      items: [
        {
          title: 'Getting Started Series',
          description: 'Step-by-step video tutorials',
          type: 'MP4',
          size: '45 MB',
          url: '#'
        },
        {
          title: 'Advanced Features',
          description: 'Advanced admin panel features',
          type: 'MP4',
          size: '32 MB',
          url: '#'
        },
        {
          title: 'Troubleshooting Guide',
          description: 'Common issues and solutions',
          type: 'MP4',
          size: '28 MB',
          url: '#'
        }
      ]
    },
    {
      category: 'Templates',
      icon: FileText,
      color: 'bg-purple-500',
      items: [
        {
          title: 'Email Templates',
          description: 'Pre-built email templates',
          type: 'ZIP',
          size: '1.2 MB',
          url: '#'
        },
        {
          title: 'Banner Templates',
          description: 'Promotional banner designs',
          type: 'ZIP',
          size: '8.5 MB',
          url: '#'
        },
        {
          title: 'Landing Page Templates',
          description: 'Professional landing pages',
          type: 'ZIP',
          size: '15.2 MB',
          url: '#'
        }
      ]
    },
    {
      category: 'External Resources',
      icon: Globe,
      color: 'bg-orange-500',
      items: [
        {
          title: 'MLM Best Practices',
          description: 'Industry best practices guide',
          type: 'Link',
          size: 'External',
          url: '#'
        },
        {
          title: 'Marketing Strategies',
          description: 'Effective marketing techniques',
          type: 'Link',
          size: 'External',
          url: '#'
        },
        {
          title: 'Legal Compliance',
          description: 'Legal requirements and compliance',
          type: 'Link',
          size: 'External',
          url: '#'
        }
      ]
    }
  ];

  const quickStats = [
    {
      title: 'Total Resources',
      value: '12',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Video Tutorials',
      value: '3',
      icon: Video,
      color: 'bg-green-500'
    },
    {
      title: 'Templates',
      value: '3',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'External Links',
      value: '3',
      icon: Globe,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommended Resources</h1>
          <p className="text-gray-600">Essential resources to help you manage your Matrix MLM system</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <BookOpen className="h-4 w-4" />
          <span>You are Here:</span>
          <span className="font-medium">Recommended Resources</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center mr-3`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resources by Category */}
      <div className="space-y-6">
        {resources.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.category} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center mr-3`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{category.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{item.size}</span>
                      <div className="flex space-x-2">
                        {item.type === 'Link' ? (
                          <a
                            href={item.url}
                            className="flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit
                          </a>
                        ) : (
                          <button className="flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Help */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Community Forum</h4>
              <p className="text-sm text-gray-500">Connect with other users</p>
            </div>
          </div>
          <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Target className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Live Support</h4>
              <p className="text-sm text-gray-500">Get real-time assistance</p>
            </div>
          </div>
          <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Knowledge Base</h4>
              <p className="text-sm text-gray-500">Search for answers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources; 
