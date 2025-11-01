import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Smartphone, Settings, Download, CheckCircle, Info } from 'lucide-react';

const ProgressiveWebApp: React.FC = () => {
  const [pwaConfig, setPwaConfig] = useState({
    enabled: true,
    name: 'Matrix MLM',
    shortName: 'Matrix',
    themeColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    display: 'standalone',
    orientation: 'portrait'
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progressive Web App (PWA)</h1>
          <p className="text-gray-600">Configure Progressive Web App settings</p>
        </div>
        <Badge className={pwaConfig.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {pwaConfig.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      {/* PWA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            PWA Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">PWA Installation</p>
                <p className="text-sm text-gray-600">Users can install the app on their devices</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Offline Support</p>
                <p className="text-sm text-gray-600">App works offline with cached content</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Send push notifications to installed apps</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            PWA Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Name
              </label>
              <input
                type="text"
                value={pwaConfig.name}
                onChange={(e) => setPwaConfig({ ...pwaConfig, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Name
              </label>
              <input
                type="text"
                value={pwaConfig.shortName}
                onChange={(e) => setPwaConfig({ ...pwaConfig, shortName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={pwaConfig.themeColor}
                  onChange={(e) => setPwaConfig({ ...pwaConfig, themeColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={pwaConfig.themeColor}
                  onChange={(e) => setPwaConfig({ ...pwaConfig, themeColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={pwaConfig.backgroundColor}
                  onChange={(e) => setPwaConfig({ ...pwaConfig, backgroundColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={pwaConfig.backgroundColor}
                  onChange={(e) => setPwaConfig({ ...pwaConfig, backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <select
                value={pwaConfig.display}
                onChange={(e) => setPwaConfig({ ...pwaConfig, display: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="standalone">Standalone</option>
                <option value="fullscreen">Fullscreen</option>
                <option value="minimal-ui">Minimal UI</option>
                <option value="browser">Browser</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientation
              </label>
              <select
                value={pwaConfig.orientation}
                onChange={(e) => setPwaConfig({ ...pwaConfig, orientation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="any">Any</option>
              </select>
            </div>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Installation Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">For iOS (Safari):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Open the website in Safari</li>
                <li>Tap the Share button</li>
                <li>Select "Add to Home Screen"</li>
                <li>Confirm the installation</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Android (Chrome):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Open the website in Chrome</li>
                <li>Tap the menu (three dots)</li>
                <li>Select "Add to Home Screen"</li>
                <li>Confirm the installation</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            PWA Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Installable on iOS and Android devices</p>
            <p>• Works offline with service worker caching</p>
            <p>• Fast loading with app shell architecture</p>
            <p>• Native app-like experience</p>
            <p>• Push notifications support</p>
            <p>• Home screen icon and splash screen</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressiveWebApp;