import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Database, Download, RefreshCw, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';

interface Backup {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  size?: string;
  fileName?: string;
}

const DatabaseBackup: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getBackupHistory();
      if (response.success) {
        setBackups(response.data?.backups || response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const response = await adminApiService.createBackup({ type: 'full' });
      if (response.success) {
        toast.success('Backup created successfully');
        loadBackups();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = (backupId: string) => {
    // This would trigger a download of the backup file
    toast.info('Backup download initiated');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Backup</h1>
          <p className="text-gray-600">Create and manage database backups</p>
        </div>
        <Button onClick={handleCreateBackup} disabled={creating}>
          <Plus className="h-4 w-4 mr-2" />
          {creating ? 'Creating Backup...' : 'Create Backup'}
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Backup Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Full database backups include all tables and data</p>
            <p>• Backups are automatically compressed to save space</p>
            <p>• Recommended: Create backups before major updates</p>
            <p>• Backup files are stored securely and can be restored if needed</p>
            <p>• Automatic backups can be scheduled in system settings</p>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Backup History ({backups.length})
            </span>
            <Button variant="outline" size="sm" onClick={loadBackups}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : backups.length > 0 ? (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Database className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {backup.type} Backup
                        </h3>
                        <Badge className={getStatusColor(backup.status)}>
                          <span className="flex items-center">
                            {getStatusIcon(backup.status)}
                            <span className="ml-1">{backup.status}</span>
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(backup.createdAt).toLocaleString()}
                        </span>
                        {backup.size && (
                          <span>Size: {backup.size}</span>
                        )}
                        {backup.fileName && (
                          <span>File: {backup.fileName}</span>
                        )}
                      </div>
                    </div>
                    {backup.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(backup.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No backups found</p>
              <p className="text-sm text-gray-400 mt-2">Create your first backup to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseBackup;