import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiService } from '../api/api';
import toast from 'react-hot-toast';
import {
  Award,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  Trophy
} from 'lucide-react';

interface Rank {
  id: string;
  name: string;
  level: number;
  description: string;
  icon: string;
  color: string;
  benefits: any;
  bonuses: any;
  privileges: string[];
}

interface RankProgress {
  currentRank: {
    id: string;
    name: string;
    level: number;
  } | null;
  nextRank: {
    id: string;
    name: string;
    level: number;
    requirements: any;
  } | null;
  progress: {
    requirements: Array<{
      type: string;
      name: string;
      current: number;
      target: number;
      percentage: number;
      completed: boolean;
    }>;
    overallProgress: number;
    allCompleted: boolean;
  } | null;
}

interface RankHistory {
  id: string;
  oldRank: {
    id: string;
    name: string;
    level: number;
  } | null;
  newRank: {
    id: string;
    name: string;
    level: number;
  };
  changedAt: string;
  reason: string;
}

const RankDashboard: React.FC = () => {
  const [myRank, setMyRank] = useState<Rank | null>(null);
  const [progress, setProgress] = useState<RankProgress | null>(null);
  const [history, setHistory] = useState<RankHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankData();
  }, []);

  const fetchRankData = async () => {
    try {
      setLoading(true);
      const [rankResponse, progressResponse, historyResponse] = await Promise.all([
        apiService.getMyRank(),
        apiService.getRankProgress(),
        apiService.getRankHistory()
      ]);

      if (rankResponse.success && rankResponse.data?.rank) {
        setMyRank(rankResponse.data.rank);
      }

      if (progressResponse.success) {
        setProgress(progressResponse.data);
      }

      if (historyResponse.success) {
        setHistory(historyResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching rank data:', error);
      toast.error('Failed to load rank data');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRank = async () => {
    try {
      const response = await apiService.calculateRank();
      if (response.success) {
        if (response.data.advanced) {
          toast.success(`Rank advanced to ${response.data.newRank.name}!`);
        } else {
          toast('No rank advancement available at this time');
        }
        fetchRankData();
      }
    } catch (error) {
      toast.error('Failed to calculate rank');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading rank information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rank Dashboard</h1>
          <p className="text-gray-600">Track your rank progress and achievements</p>
        </div>
        <Button onClick={handleCalculateRank}>
          <Trophy className="h-4 w-4 mr-2" />
          Check Rank Advancement
        </Button>
      </div>

      {/* Current Rank Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {myRank?.icon ? (
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl">{myRank.icon}</span>
                </div>
              ) : (
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white text-2xl font-bold"
                  style={{ backgroundColor: myRank?.color || '#3B82F6' }}
                >
                  {myRank?.name?.charAt(0) || 'R'}
                </div>
              )}
              <div>
                <CardTitle className="text-2xl">{myRank?.name || 'No Rank'}</CardTitle>
                <p className="text-gray-600">Level {myRank?.level || 0}</p>
              </div>
            </div>
            {myRank && (
              <Badge className="bg-blue-600 text-white px-4 py-2 text-lg">
                Current Rank
              </Badge>
            )}
          </div>
        </CardHeader>
        {myRank && (
          <CardContent>
            <p className="text-gray-700 mb-4">{myRank.description}</p>
            
            {myRank.benefits && Array.isArray(myRank.benefits) && myRank.benefits.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {myRank.benefits.map((benefit: any, index: number) => (
                    <li key={index}>{typeof benefit === 'string' ? benefit : benefit.description || benefit.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {myRank.privileges && myRank.privileges.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Privileges:</h4>
                <div className="flex flex-wrap gap-2">
                  {myRank.privileges.map((privilege: string, index: number) => (
                    <Badge key={index} variant="secondary">{privilege}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Progress to Next Rank */}
      {progress?.nextRank && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Progress to {progress.nextRank.name}</CardTitle>
              <Badge variant="outline">
                {progress.progress?.overallProgress.toFixed(0) || 0}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{progress.progress?.overallProgress.toFixed(1) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress.progress?.overallProgress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Requirements */}
              {progress.progress?.requirements.map((req, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {req.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="font-medium text-gray-900">{req.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {req.current.toLocaleString()} / {req.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        req.completed ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${req.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{req.percentage.toFixed(1)}% Complete</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rank History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-gray-600" />
              <CardTitle>Rank History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-600 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {entry.oldRank ? `${entry.oldRank.name} → ` : ''}{entry.newRank.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.changedAt).toLocaleDateString()} • {entry.reason}
                      </p>
                    </div>
                    <Badge variant="outline">Level {entry.newRank.level}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!myRank && !progress && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rank Yet</h3>
            <p className="text-gray-600 mb-4">Start building your team to earn your first rank!</p>
            <Button onClick={handleCalculateRank}>Calculate My Rank</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RankDashboard;

