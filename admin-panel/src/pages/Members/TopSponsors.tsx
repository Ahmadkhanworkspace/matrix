import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Star, Trophy, TrendingUp, Users, DollarSign, Award } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';

interface Sponsor {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  referralEarnings: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

const TopSponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    loadTopSponsors();
  }, [timeframe]);

  const loadTopSponsors = async () => {
    try {
      setLoading(true);
      // Get all users and calculate sponsor stats
      const response = await adminApiService.getUsers({ limit: 1000 });
      if (response.success) {
        const users = response.data?.users || response.data || [];
        
        // Calculate sponsor statistics
        const sponsorMap = new Map<string, Sponsor>();
        
        users.forEach((user: any) => {
          if (user.sponsorId) {
            // This would require backend API to get referral counts
            // For now, we'll simulate based on available data
          }
        });

        // Sort and rank sponsors (mock data structure)
        const sorted = users
          .filter((u: any) => (u.totalReferrals || 0) > 0)
          .map((u: any, index: number) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            firstName: u.firstName || u.first_name,
            lastName: u.lastName || u.last_name,
            totalReferrals: u.totalReferrals || 0,
            activeReferrals: u.activeReferrals || 0,
            totalEarnings: u.totalEarnings || 0,
            referralEarnings: u.referralEarnings || 0,
            rank: index + 1,
            trend: 'stable' as const
          }))
          .sort((a: Sponsor, b: Sponsor) => b.totalReferrals - a.totalReferrals)
          .slice(0, 100);

        setSponsors(sorted);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load top sponsors');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-500" />;
    return <Award className="h-5 w-5 text-gray-400" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Top Sponsors</h1>
          <p className="text-gray-600">View top performing sponsors by referrals</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Top 3 Leaders */}
      {sponsors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sponsors.slice(0, 3).map((sponsor, index) => (
            <Card key={sponsor.id} className={`${index === 0 ? 'border-yellow-400 border-2' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRankColor(sponsor.rank).split(' ')[0]}`}>
                    <span className="text-2xl font-bold">{sponsor.rank}</span>
                  </div>
                  {getRankIcon(sponsor.rank)}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{sponsor.username}</h3>
                <p className="text-sm text-gray-600">{sponsor.firstName} {sponsor.lastName}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Referrals</span>
                    <span className="font-semibold">{sponsor.totalReferrals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Earnings</span>
                    <span className="font-semibold">{sponsor.totalEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Sponsor Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading top sponsors...</p>
            </div>
          ) : sponsors.length > 0 ? (
            <div className="space-y-2">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getRankColor(sponsor.rank)}`}>
                      <span className="font-bold">{sponsor.rank}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{sponsor.username}</h3>
                        {sponsor.rank <= 3 && getRankIcon(sponsor.rank)}
                      </div>
                      <p className="text-sm text-gray-600">{sponsor.email}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Users className="h-4 w-4 mr-1" />
                          Referrals
                        </div>
                        <p className="text-lg font-bold">{sponsor.totalReferrals}</p>
                        <p className="text-xs text-gray-500">{sponsor.activeReferrals} active</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Earnings
                        </div>
                        <p className="text-lg font-bold">{sponsor.totalEarnings.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Ref: {sponsor.referralEarnings.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Trend
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {sponsor.trend === 'up' ? '↑' : sponsor.trend === 'down' ? '↓' : '→'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sponsor data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopSponsors;