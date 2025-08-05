import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Mail } from 'lucide-react';

const EmailValidation: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Validation Service</h1>
          <p className="text-gray-600">Validate email addresses and manage lists</p>
        </div>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          Validate Emails
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Validation Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">Email validation functionality will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailValidation; 
