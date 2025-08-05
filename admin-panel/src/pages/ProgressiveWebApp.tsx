import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Zap } from 'lucide-react';

const ProgressiveWebApp: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progressive Web App</h1>
        <p className="text-gray-600">PWA configuration and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Progressive Web App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">PWA configuration will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressiveWebApp; 
