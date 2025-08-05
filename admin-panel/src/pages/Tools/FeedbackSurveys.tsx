import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MessageSquare } from 'lucide-react';

const FeedbackSurveys: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback & Exit Surveys</h1>
          <p className="text-gray-600">Manage feedback and exit surveys</p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Create Survey
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Feedback & Exit Surveys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">Feedback and survey functionality will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackSurveys; 
