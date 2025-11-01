import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RefreshCw, Play, Unlock, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { adminApiService } from '../api';
import { toast } from 'react-hot-toast';

interface CronStatus {
  active: boolean;
  lastRun: string | null;
  lastId: string | null;
  pendingEntries: number;
}

const ResetCronTasks: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cronStatus, setCronStatus] = useState<CronStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCronStatus = async () => {
    try {
      setRefreshing(true);
      const response = await adminApiService.getCronStatus();
      if (response.success) {
        setCronStatus(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch cron status');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCronStatus();
  }, []);

  const handleRunCron = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.runCronManually();
      if (response.success) {
        toast.success('Cron job started successfully');
        setTimeout(() => fetchCronStatus(), 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to run cron');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockCron = async () => {
    if (!window.confirm('Are you sure you want to unlock the cron? This should only be done if the cron is stuck.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminApiService.unlockCron();
      if (response.success) {
        toast.success('Cron lock released successfully');
        fetchCronStatus();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to unlock cron');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cron Tasks Management</h1>
          <p className="text-gray-600">Monitor and manage automated cron tasks</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCronStatus}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleRunCron}
            disabled={loading || cronStatus?.active}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Now
          </Button>
        </div>
      </div>

      {/* Cron Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Cron Job Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cronStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center mt-1">
                      {cronStatus.active ? (
                        <>
                          <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="font-semibold text-yellow-600">Running</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          <span className="font-semibold text-green-600">Idle</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Pending Entries</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{cronStatus.pendingEntries}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Last Run</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {cronStatus.lastRun ? new Date(cronStatus.lastRun).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Last Processed ID</p>
                    <p className="font-semibold text-gray-900 mt-1">{cronStatus.lastId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {cronStatus.active && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Cron is currently running</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        If it appears stuck, you can unlock it manually.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        onClick={handleUnlockCron}
                        disabled={loading}
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Unlock Cron
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">Actions</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRunCron}
                    disabled={loading || cronStatus.active}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {loading ? 'Starting...' : 'Run Cron Manually'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={fetchCronStatus}
                    disabled={refreshing}
                    className="flex-1"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Loading cron status...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Cron Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Cron jobs automatically process pending matrix entries every few minutes</p>
            <p>• Each run processes up to 24 entries from the verifier queue</p>
            <p>• Only one cron job can run at a time (locked to prevent conflicts)</p>
            <p>• If the cron appears stuck, use the unlock button to release the lock</p>
            <p>• Manual runs are useful for testing or immediate processing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetCronTasks; 
