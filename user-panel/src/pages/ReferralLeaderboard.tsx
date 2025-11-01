import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiService } from '../api/api';
import toast from 'react-hot-toast';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
}

const ReferralLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState('all-time');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('referrals');

  useEffect(() => {
    fetchLeaderboard();
  }, [period, category]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReferralLeaderboard(period);
      if (response.success) {
        setLeaderboard(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-8 w-8 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="h-8 w-8 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="h-8 w-8 text-orange-600" />;
    }
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
        rank <= 10 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {rank}
      </div>
    );
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    if (rank <= 10) return 'bg-blue-50 border-blue-200';
    return 'bg-white';
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Leaderboard</h1>
          <p className="text-gray-600">Top performers in referrals</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all-time">All Time</option>
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
                <option value="daily">Today</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="referrals">Referrals</option>
                <option value="earnings">Earnings</option>
                <option value="conversions">Conversions</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leaderboard data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId || index}
                  className={`border rounded-lg p-4 transition-all ${
                    entry.rank <= 3 ? 'shadow-lg' : ''
                  } ${getRankBadgeColor(entry.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {entry.username || 'Anonymous'}
                          </h3>
                          {entry.rank <= 3 && (
                            <Badge className="bg-white/80 text-gray-900">
                              #{entry.rank}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {entry.score.toLocaleString()} {category === 'referrals' ? 'referrals' : category === 'earnings' ? 'earned' : 'conversions'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.rank === 1 && (
                        <Badge className="bg-yellow-500 text-white px-3 py-1">
                          🏆 Champion
                        </Badge>
                      )}
                      {entry.rank === 2 && (
                        <Badge className="bg-gray-400 text-white px-3 py-1">
                          🥈 Runner-up
                        </Badge>
                      )}
                      {entry.rank === 3 && (
                        <Badge className="bg-orange-500 text-white px-3 py-1">
                          🥉 Third Place
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboard.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboard[0]?.score.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboard.length > 0
                  ? Math.round(leaderboard.reduce((sum, e) => sum + e.score, 0) / leaderboard.length).toLocaleString()
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReferralLeaderboard;

