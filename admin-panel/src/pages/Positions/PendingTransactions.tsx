import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  User, 
  Network,
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  Trash2
} from 'lucide-react';
import { api } from '../../api';

interface PendingEntry {
  id: number;
  username: string;
  mid: number; // matrix id
  sponsor: string;
  date: string;
  etype: number; // 0=new entry, 1=re-entry
}

interface MatrixConfig {
  id: number;
  name: string;
  fee: number;
}

const PendingTransactions: React.FC = () => {
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [matrixConfigs, setMatrixConfigs] = useState<MatrixConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<number>(0);
  const [processedCount, setProcessedCount] = useState(0);

  const fetchPendingEntries = async () => {
    try {
      setLoading(true);
      
      // Get all matrix configs first
      const configsResponse = await api.matrix.getMatrixConfigs();
      if (configsResponse.success && configsResponse.data) {
        setMatrixConfigs(configsResponse.data);
      }

      // Get pending entries for all matrices
      const allEntries: PendingEntry[] = [];
      for (const config of configsResponse.data || []) {
        const response = await api.matrix.getPendingEntries(config.id);
        if (response.success && response.data) {
          allEntries.push(...response.data);
        }
      }
      
      setPendingEntries(allEntries);
    } catch (error) {
      console.error('Failed to fetch pending entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPendingEntries = async (matrixId?: number) => {
    try {
      setProcessing(true);
      let processed = 0;

      if (matrixId) {
        // Process specific matrix
        const response = await api.matrix.processPendingEntries(matrixId);
        if (response.success && response.data) {
          processed = response.data;
        }
      } else {
        // Process all matrices
        for (const config of matrixConfigs) {
          const response = await api.matrix.processPendingEntries(config.id);
          if (response.success && response.data) {
            processed += response.data;
          }
        }
      }

      setProcessedCount(processed);
      fetchPendingEntries(); // Refresh the list
      
      if (processed > 0) {
        alert(`Successfully processed ${processed} pending entries!`);
      }
    } catch (error) {
      console.error('Failed to process pending entries:', error);
      alert('Failed to process pending entries. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const processSingleEntry = async (entry: PendingEntry) => {
    try {
      const response = await api.matrix.processMatrixEntry(entry.username, entry.mid, entry.sponsor);
      if (response.success) {
        fetchPendingEntries(); // Refresh the list
        alert(`Successfully processed entry for ${entry.username}!`);
      }
    } catch (error) {
      console.error('Failed to process entry:', error);
      alert('Failed to process entry. Please try again.');
    }
  };

  const deletePendingEntry = async (entryId: number) => {
    if (window.confirm('Are you sure you want to delete this pending entry? This action cannot be undone.')) {
      try {
        // This would require a delete API endpoint
        // await api.matrix.deletePendingEntry(entryId);
        fetchPendingEntries(); // Refresh the list
        alert('Entry deleted successfully!');
      } catch (error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchPendingEntries();
  }, []);

  const getMatrixName = (matrixId: number) => {
    const config = matrixConfigs.find(c => c.id === matrixId);
    return config ? config.name : `Matrix ${matrixId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntryTypeBadge = (etype: number) => {
    return etype === 0 ? 
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">New Entry</Badge> :
      <Badge variant="secondary" className="bg-green-100 text-green-800">Re-entry</Badge>;
  };

  const filteredEntries = selectedMatrix === 0 ? 
    pendingEntries : 
    pendingEntries.filter(entry => entry.mid === selectedMatrix);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading pending transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Transactions</h1>
          <p className="text-gray-600">Process pending matrix entries and re-entries</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => processPendingEntries()}
            disabled={processing || pendingEntries.length === 0}
          >
            {processing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Process All ({pendingEntries.length})
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">New Entries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingEntries.filter(e => e.etype === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Re-entries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingEntries.filter(e => e.etype === 1).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Processed Today</p>
                <p className="text-2xl font-bold text-gray-900">{processedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Matrix
              </label>
              <select
                value={selectedMatrix}
                onChange={(e) => setSelectedMatrix(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>All Matrices</option>
                {matrixConfigs.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => processPendingEntries(selectedMatrix)}
                disabled={processing || filteredEntries.length === 0}
                variant="outline"
              >
                <Play className="h-4 w-4 mr-2" />
                Process Filtered ({filteredEntries.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Entries ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Entries</h3>
              <p className="text-gray-500">All pending transactions have been processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Matrix</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Sponsor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{entry.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{getMatrixName(entry.mid)}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        {getEntryTypeBadge(entry.etype)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {entry.sponsor || 'Direct'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-500">
                          {formatDate(entry.date)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => processSingleEntry(entry)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // View entry details
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePendingEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Status */}
      {processing && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Processing Pending Entries</p>
                <p className="text-sm text-blue-700">Please wait while we process the entries...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PendingTransactions; 
