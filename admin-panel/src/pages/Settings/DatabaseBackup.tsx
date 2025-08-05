import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Database, Download } from 'lucide-react';

const DatabaseBackup: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Database Backup</h1>
          <p className="text-gray-600">Create and manage database backups</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Generate Backup
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">Database backup functionality will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseBackup; 
