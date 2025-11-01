import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Book, Video, HelpCircle, ExternalLink } from 'lucide-react';

const Instructions: React.FC = () => {
  const sections = [
    {
      title: 'Getting Started',
      icon: <HelpCircle className="h-6 w-6" />,
      items: [
        'Complete system setup and configuration',
        'Configure payment gateways (CoinPayments, NOWPayments)',
        'Set up matrix levels and bonus structures',
        'Configure email templates and notifications'
      ]
    },
    {
      title: 'User Management',
      icon: <FileText className="h-6 w-6" />,
      items: [
        'Add and manage user accounts',
        'Verify user email addresses',
        'Process KYC verifications',
        'Manage user sponsors and referrals'
      ]
    },
    {
      title: 'Matrix Management',
      icon: <Book className="h-6 w-6" />,
      items: [
        'Monitor matrix positions and placements',
        'View matrix cycles and completions',
        'Manage spillover and placement rules',
        'Track bonus distributions'
      ]
    },
    {
      title: 'Financial Management',
      icon: <FileText className="h-6 w-6" />,
      items: [
        'Process deposits and withdrawals',
        'Manage payment gateway settings',
        'Monitor transaction logs',
        'View financial reports and analytics'
      ]
    },
    {
      title: 'Cron Jobs',
      icon: <FileText className="h-6 w-6" />,
      items: [
        'Cron jobs run automatically every few minutes',
        'Process up to 24 matrix entries per run',
        'Monitor cron status in Reset Cron Tasks page',
        'Manually run cron if needed for testing'
      ]
    },
    {
      title: 'Troubleshooting',
      icon: <HelpCircle className="h-6 w-6" />,
      items: [
        'Check cron job status if entries are not processing',
        'Verify payment gateway configuration',
        'Review system logs for errors',
        'Ensure database connection is active'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Instructions</h1>
        <p className="text-gray-600">Complete guide to using the Matrix MLM Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2 text-blue-600">{section.icon}</span>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start text-sm text-gray-700">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2" />
            Video Tutorials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Admin Panel Overview</h4>
                <p className="text-sm text-gray-600">Complete walkthrough of admin panel features</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Matrix Configuration</h4>
                <p className="text-sm text-gray-600">How to configure matrix levels and bonuses</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div>
                <h4 className="font-semibold">Payment Gateway Setup</h4>
                <p className="text-sm text-gray-600">Setting up CoinPayments and NOWPayments</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/dashboard" className="text-blue-600 hover:underline text-sm">Dashboard</a>
            <a href="/admin/members" className="text-blue-600 hover:underline text-sm">Members</a>
            <a href="/admin/matrix" className="text-blue-600 hover:underline text-sm">Matrix</a>
            <a href="/admin/financial" className="text-blue-600 hover:underline text-sm">Financial</a>
            <a href="/admin/tools/reset-cron-tasks" className="text-blue-600 hover:underline text-sm">Cron Tasks</a>
            <a href="/admin/settings" className="text-blue-600 hover:underline text-sm">Settings</a>
            <a href="/admin/payment-gateways" className="text-blue-600 hover:underline text-sm">Payment Gateways</a>
            <a href="/admin/currencies" className="text-blue-600 hover:underline text-sm">Currencies</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Instructions;