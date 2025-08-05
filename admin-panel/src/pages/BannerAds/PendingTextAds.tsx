import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Clock } from 'lucide-react';

const PendingTextAds: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Text Ads</h1>
          <p className="text-gray-600">Review pending text advertisements</p>
        </div>
        <Button>
          <Clock className="h-4 w-4 mr-2" />
          Review Pending
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Text Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">Pending text ads management will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingTextAds; 
