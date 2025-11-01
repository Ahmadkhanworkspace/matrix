import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Monitor,
  Terminal,
  FileText,
  Shield,
  Power,
  Zap,
  BarChart3,
  Calendar,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { adminApiService } from '../../api/adminApi';
import { toast } from 'react-hot-toast';

interface SystemHealth {
  status: string;
  timestamp: string;
  database: {
    status: string;
    responseTime: number;
    userCount: number;
    transactionCount: number;
    activeSessionCount: number;
  };
  memory: {
    status: string;
    percentage: number;
    used: number;
    free: number;
    total: number;
  };
  disk: {
    status: string;
    percentage: number;
    used: string;
    free: string;
    total: string;
  };
  cpu: {
    status: string;
    percentage: number;
    cores: number;
    model: string;
  };
  uptime: {
    system: number;
    process: number;
    systemFormatted: string;
    processFormatted: string;
  };
}

interface SystemLog {
  id: string;
  level: string;
  message: string;
  context?: any;
  userId?: string;
  action?: string;
  resource?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface Backup {
  id: string;
  type: string;
  status: string;
  filename?: string;
  fileSize?: number;
  location?: string;
  description?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

interface SystemConfig {
  [key: string]: {
    value: string;
    description?: string;
    isPublic: boolean;
  };
}

const SystemTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('health');
  const [loading, setLoading] = useState(false);
  
  // Health monitoring state
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  
  // Logs state
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilters, setLogFilters] = useState({
    page: 1,
    limit: 50,
    level: '',
    startDate: '',
    endDate: ''
  });
  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  
  // Backups state
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [backupFilters, setBackupFilters] = useState({
    page: 1,
    limit: 20,
    type: '',
    status: ''
  });
  const [backupsPagination, setBackupsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Configuration state
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [newConfigKey, setNewConfigKey] = useState('');
  const [newConfigValue, setNewConfigValue] = useState('');
  const [newConfigDescription, setNewConfigDescription] = useState('');

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      setHealthLoading(true);
      const response = await adminApiService.getSystemHealth();
      setSystemHealth(response.data);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to fetch system health');
    } finally {
      setHealthLoading(false);
    }
  };

  // Fetch system logs
  const fetchSystemLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await adminApiService.getSystemLogs(logFilters);
      setLogs(response.data || []);
      setLogsPagination(response.pagination || logsPagination);
    } catch (error) {
      console.error('Error fetching system logs:', error);
      toast.error('Failed to fetch system logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch backups
  const fetchBackups = async () => {
    try {
      setBackupsLoading(true);
      const response = await adminApiService.getBackupHistory(backupFilters);
      setBackups(response.data || []);
      setBackupsPagination(response.pagination || backupsPagination);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Failed to fetch backups');
    } finally {
      setBackupsLoading(false);
    }
  };

  // Fetch system configuration
  const fetchSystemConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await adminApiService.getSystemConfig();
      setSystemConfig(response.data || {});
    } catch (error) {
      console.error('Error fetching system config:', error);
      toast.error('Failed to fetch system configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  // Create backup
  const createBackup = async (type: string = 'database') => {
    try {
      setLoading(true);
      await adminApiService.createBackup({ type });
      toast.success('Backup started successfully');
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  // Clear logs
  const clearLogs = async () => {
    try {
      const olderThan = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
      setLoading(true);
      const response = await adminApiService.clearLogs({ olderThan });
      toast.success(`Cleared ${response.data.deletedCount} log entries`);
      fetchSystemLogs();
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Failed to clear logs');
    } finally {
      setLoading(false);
    }
  };

  // Update configuration
  const updateConfig = async () => {
    try {
      if (!newConfigKey || !newConfigValue) {
        toast.error('Key and value are required');
        return;
      }

      setLoading(true);
      await adminApiService.updateSystemConfig({
        key: newConfigKey,
        value: newConfigValue,
        description: newConfigDescription
      });

      toast.success('Configuration updated successfully');
      setNewConfigKey('');
      setNewConfigValue('');
      setNewConfigDescription('');
      fetchSystemConfig();
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  // Restart application
  const restartApplication = async () => {
    try {
      if (!window.confirm('Are you sure you want to restart the application? This will cause temporary downtime.')) {
        return;
      }

      setLoading(true);
      await adminApiService.restartApplication();
      toast.success('Application restart initiated');
    } catch (error) {
      console.error('Error restarting application:', error);
      toast.error('Failed to restart application');
    } finally {
      setLoading(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    try {
      setLoading(true);
      await adminApiService.clearCache();
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'health') {
      fetchSystemHealth();
      // Auto-refresh health every 30 seconds
      const interval = setInterval(fetchSystemHealth, 30000);
      return () => clearInterval(interval);
    } else if (activeTab === 'logs') {
      fetchSystemLogs();
    } else if (activeTab === 'backups') {
      fetchBackups();
    } else if (activeTab === 'config') {
      fetchSystemConfig();
    }
  }, [activeTab, logFilters, backupFilters]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      healthy: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      critical: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.warning;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      info: { color: 'bg-blue-100 text-blue-800' },
      warn: { color: 'bg-yellow-100 text-yellow-800' },
      error: { color: 'bg-red-100 text-red-800' },
      debug: { color: 'bg-gray-100 text-gray-800' }
    };

    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.info;

    return (
      <Badge className={config.color}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Tools & Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor system health, manage backups, and configure settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={clearCache} variant="outline" size="sm" disabled={loading}>
            <Zap className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          <Button onClick={restartApplication} variant="outline" size="sm" disabled={loading}>
            <Power className="h-4 w-4 mr-2" />
            Restart App
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'health', label: 'System Health', icon: Activity },
          { id: 'logs', label: 'System Logs', icon: FileText },
          { id: 'backups', label: 'Backups', icon: Database },
          { id: 'config', label: 'Configuration', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* System Health Tab */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Health Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  System Health Overview
                </CardTitle>
                <Button onClick={fetchSystemHealth} variant="outline" size="sm" disabled={healthLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {systemHealth ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Database Health */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Database</span>
                      </div>
                      {getStatusBadge(systemHealth.database.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Response: {systemHealth.database.responseTime}ms</div>
                      <div>Users: {systemHealth.database.userCount}</div>
                      <div>Transactions: {systemHealth.database.transactionCount}</div>
                    </div>
                  </div>

                  {/* Memory Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MemoryStick className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium">Memory</span>
                      </div>
                      {getStatusBadge(systemHealth.memory.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Usage: {systemHealth.memory.percentage}%</div>
                      <div>Used: {systemHealth.memory.used} MB</div>
                      <div>Free: {systemHealth.memory.free} MB</div>
                    </div>
                  </div>

                  {/* CPU Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Cpu className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="font-medium">CPU</span>
                      </div>
                      {getStatusBadge(systemHealth.cpu.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Usage: {systemHealth.cpu.percentage}%</div>
                      <div>Cores: {systemHealth.cpu.cores}</div>
                    </div>
                  </div>

                  {/* Disk Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HardDrive className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium">Disk</span>
                      </div>
                      {getStatusBadge(systemHealth.disk.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Usage: {systemHealth.disk.percentage}%</div>
                      <div>Free: {systemHealth.disk.free}</div>
                      <div>Total: {systemHealth.disk.total}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading system health...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uptime Information */}
          {systemHealth && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  System Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">System Uptime</div>
                    <div className="text-2xl font-bold text-green-600">
                      {systemHealth.uptime.systemFormatted}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Process Uptime</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {systemHealth.uptime.processFormatted}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Log Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Log Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
                  <Select value={logFilters.level} onValueChange={(value) => setLogFilters(prev => ({ ...prev, level: value, page: 1 }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={logFilters.startDate}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={logFilters.endDate}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={clearLogs} variant="outline" disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Old Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>System Logs ({logsPagination.total})</span>
                <div className="text-sm text-gray-500">
                  Page {logsPagination.page} of {logsPagination.pages}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading logs...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getLevelBadge(log.level)}
                            <span className="text-sm text-gray-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                            {log.userId && (
                              <Badge variant="outline">User: {log.userId}</Badge>
                            )}
                            {log.action && (
                              <Badge variant="outline">{log.action}</Badge>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {log.message}
                          </div>
                          {log.context && (
                            <div className="text-xs text-gray-600">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(log.context, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {logs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No logs found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {logsPagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setLogFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={logsPagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {logsPagination.page} of {logsPagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setLogFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={logsPagination.page === logsPagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Backup Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Create Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button onClick={() => createBackup('database')} disabled={loading}>
                  <Database className="h-4 w-4 mr-2" />
                  Database Backup
                </Button>
                <Button onClick={() => createBackup('files')} variant="outline" disabled={loading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Files Backup
                </Button>
                <Button onClick={() => createBackup('full')} variant="outline" disabled={loading}>
                  <Server className="h-4 w-4 mr-2" />
                  Full Backup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Backup History ({backupsPagination.total})</span>
                <Button onClick={fetchBackups} variant="outline" size="sm" disabled={backupsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${backupsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading backups...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Filename</th>
                        <th className="text-left p-2">Size</th>
                        <th className="text-left p-2">Started</th>
                        <th className="text-left p-2">Completed</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <Badge variant="outline">{backup.type.toUpperCase()}</Badge>
                          </td>
                          <td className="p-2">
                            {getStatusBadge(backup.status)}
                          </td>
                          <td className="p-2">
                            <span className="text-sm font-mono">{backup.filename || '-'}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm">
                              {backup.fileSize ? formatBytes(Number(backup.fileSize)) : '-'}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm text-gray-600">
                              {new Date(backup.startedAt).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm text-gray-600">
                              {backup.completedAt ? new Date(backup.completedAt).toLocaleString() : '-'}
                            </span>
                          </td>
                          <td className="p-2">
                            {backup.status === 'completed' && backup.filename && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {backups.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No backups found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Add Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Add Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                  <Input
                    placeholder="config.key.name"
                    value={newConfigKey}
                    onChange={(e) => setNewConfigKey(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <Input
                    placeholder="Configuration value"
                    value={newConfigValue}
                    onChange={(e) => setNewConfigValue(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    placeholder="Optional description"
                    value={newConfigDescription}
                    onChange={(e) => setNewConfigDescription(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={updateConfig} disabled={loading}>
                    <Settings className="h-4 w-4 mr-2" />
                    Add/Update Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>System Configuration</span>
                <Button onClick={fetchSystemConfig} variant="outline" size="sm" disabled={configLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${configLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {configLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading configuration...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(systemConfig).map(([key, config]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{key}</span>
                            {config.isPublic && (
                              <Badge variant="outline">Public</Badge>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {config.value}
                          </div>
                          {config.description && (
                            <div className="text-sm text-gray-600">
                              {config.description}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {Object.keys(systemConfig).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No configuration found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemTools;
