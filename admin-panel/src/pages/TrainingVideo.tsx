import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Play } from 'lucide-react';

const TrainingVideo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Training Video</h1>
        <p className="text-gray-600">System training videos and tutorials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="h-5 w-5 mr-2" />
            Training Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">Training videos will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingVideo; 
