import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { RefreshCw, Download, AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';

interface SystemUpdate {
  version: string;
  releaseDate: string;
  changelog: string[];
  status: 'available' | 'installed' | 'pending';
  critical: boolean;
}

const SystemUpdate: React.FC = () => {
  const [currentVersion] = useState('1.0.0');
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [checking, setChecking] = useState(false);

  const checkForUpdates = async () => {
    try {
      setChecking(true);
      // This would call a backend endpoint to check for updates
      // For now, using mock data
      setTimeout(() => {
        setUpdates([
          {
            version: '1.1.0',
            releaseDate: '2024-02-01',
            changelog: [
              'Added new bonus calculation features',
              'Improved matrix placement algorithm',
              'Fixed payment gateway issues',
              'Enhanced email notification system'
            ],
            status: 'available',
            critical: false
          }
        ]);
        setChecking(false);
        toast.success('Update check completed');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to check for updates');
      setChecking(false);
    }
  };

  const handleInstallUpdate = async (version: string) => {
    if (!window.confirm(`Are you sure you want to install version ${version}? This may require system restart.`)) {
      return;
    }

    try {
      toast('Installing update...', { icon: 'ℹ️' });
      // This would call a backend endpoint to install the update
      toast.success('Update installed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to install update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Updates</h1>
          <p className="text-gray-600">Check for and install system updates</p>
        </div>
        <Button onClick={checkForUpdates} disabled={checking}>
          <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : 'Check for Updates'}
        </Button>
      </div>

      {/* Current Version */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Current System Version
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">v{currentVersion}</p>
              <p className="text-sm text-gray-600 mt-1">Production Release</p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Up to Date
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Available Updates */}
      {updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Available Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.version}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Version {update.version}
                        </h3>
                        {update.critical && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Critical
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Released: {new Date(update.releaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleInstallUpdate(update.version)}
                      disabled={update.status === 'installed'}
                    >
                      {update.status === 'installed' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Installed
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Install Update
                        </>
                      )}
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Changelog:</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {update.changelog.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Update History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-semibold">Version 1.0.0</p>
                <p className="text-sm text-gray-600">Initial release</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Installed
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Update Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Update Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Automatic Updates</p>
                <p className="text-sm text-gray-600">Automatically download and install updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Critical Updates Only</p>
                <p className="text-sm text-gray-600">Only install critical security updates automatically</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemUpdate;