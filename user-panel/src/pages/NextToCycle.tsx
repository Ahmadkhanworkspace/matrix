import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { apiService } from '../api/api';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  User,
  Star,
  Target
} from 'lucide-react';

interface CycleCandidate {
  id: string;
  username: string;
  position: number;
  level: number;
  matrixId: number;
  progress: number;
  neededPositions: number;
  estimatedCompletion: string;
  status: 'pending' | 'ready' | 'completed';
  sponsor: string;
  joinDate: string;
  lastActivity: string;
}

const NextToCycle: React.FC = () => {
  const [candidates, setCandidates] = useState<CycleCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ready' | 'pending'>('all');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await apiService.getNextToCycle();
        
        if (response.success && response.data) {
          const apiCandidates: CycleCandidate[] = response.data.map((c: any) => ({
            id: c.id.toString(),
            username: c.username,
            position: c.position || 0,
            level: c.level,
            matrixId: c.matrixId || c.level,
            progress: c.progress || 0,
            neededPositions: c.neededPositions || 0,
            estimatedCompletion: c.estimatedCompletion || null,
            status: c.status || 'pending',
            sponsor: c.sponsor || '',
            joinDate: c.joinDate || new Date().toISOString(),
            lastActivity: c.lastActivity || new Date().toISOString()
          }));
          setCandidates(apiCandidates);
        } else {
          setCandidates([]);
        }
      } catch (error) {
        console.error('Error fetching next to cycle:', error);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (filter === 'all') return true;
    return candidate.status === filter;
  });

  const readyCount = candidates.filter(c => c.status === 'ready').length;
  const pendingCount = candidates.filter(c => c.status === 'pending').length;
  const completedCount = candidates.filter(c => c.status === 'completed').length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Next To Cycle</h1>
          <p className="text-gray-600">Track users approaching cycle completion</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({candidates.length})
          </Button>
          <Button
            variant={filter === 'ready' ? 'default' : 'outline'}
            onClick={() => setFilter('ready')}
          >
            Ready ({readyCount})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Cycle</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyCount}</div>
            <p className="text-xs text-muted-foreground">
              Users ready for cycle completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Completion</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Users working towards completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Cycles completed this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Cycle Candidates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-500">No users match the current filter criteria.</p>
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {candidate.username}
                          </h3>
                          {getStatusBadge(candidate.status)}
                          {candidate.progress >= 95 && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Position {candidate.position} • Level {candidate.level} • Matrix {candidate.matrixId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Sponsor: {candidate.sponsor} • Joined: {new Date(candidate.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium">Progress:</span>
                        <span className={`text-sm font-bold ${getProgressColor(candidate.progress)}`}>
                          {candidate.progress}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {candidate.neededPositions > 0 ? (
                          <span>Needs {candidate.neededPositions} more positions</span>
                        ) : (
                          <span className="text-green-600">Ready to cycle!</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Est. completion: {new Date(candidate.estimatedCompletion).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{candidate.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          candidate.progress >= 90 ? 'bg-green-500' :
                          candidate.progress >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${candidate.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {candidate.status === 'ready' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Process Cycle
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cycle Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cycle Completion Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Timeline chart will be displayed here</p>
                <p className="text-sm">Expected cycle completions over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matrix Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Distribution chart will be displayed here</p>
                <p className="text-sm">Candidates by matrix level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NextToCycle; 