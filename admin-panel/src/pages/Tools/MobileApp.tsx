import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Smartphone, Download, Settings, QrCode, Info } from 'lucide-react';

const MobileApp: React.FC = () => {
  const [appConfig] = useState({
    version: '1.0.0',
    platform: 'iOS & Android',
    status: 'active',
    downloads: 0
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mobile App</h1>
          <p className="text-gray-600">Manage mobile app configuration and downloads</p>
        </div>
      </div>

      {/* App Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">App Version</p>
                <p className="text-2xl font-bold">{appConfig.version}</p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="text-2xl font-bold">{appConfig.platform}</p>
              </div>
              <Smartphone className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold">
                  <Badge className="bg-green-100 text-green-800">{appConfig.status}</Badge>
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            App Download Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">iOS App</h3>
                <Badge variant="outline">Apple App Store</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Download the iOS version from the App Store
              </p>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download for iOS
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Android App</h3>
                <Badge variant="outline">Google Play Store</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Download the Android version from Google Play
              </p>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download for Android
              </Button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <QrCode className="h-12 w-12 text-gray-400" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">QR Code Download</h3>
                <p className="text-sm text-gray-600">
                  Scan QR code with your mobile device to download the app
                </p>
              </div>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            App Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Name
              </label>
              <Input defaultValue="Matrix MLM" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Description
              </label>
              <textarea
                defaultValue="Matrix MLM Mobile Application"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  iOS Bundle ID
                </label>
                <Input defaultValue="com.matrixmlm.ios" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Android Package Name
                </label>
                <Input defaultValue="com.matrixmlm.android" />
              </div>
            </div>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Mobile App Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Mobile app provides full access to Matrix MLM features on iOS and Android</p>
            <p>• Users can view their matrix positions, earnings, and referrals</p>
            <p>• Push notifications keep users informed about bonuses and updates</p>
            <p>• Secure authentication and biometric login support</p>
            <p>• Real-time updates for matrix placements and cycle completions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileApp;