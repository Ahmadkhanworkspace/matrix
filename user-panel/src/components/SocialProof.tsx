import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { apiService } from '../api/api';
import {
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Sparkles
} from 'lucide-react';

interface SuccessStory {
  username: string;
  earnings: number;
  memberType: string;
  joinedDate: string;
}

interface RecentSignup {
  username: string;
  joinedDate: string;
}

interface SocialProofData {
  successStories: SuccessStory[];
  recentSignups: RecentSignup[];
}

const SocialProof: React.FC = () => {
  const [data, setData] = useState<SocialProofData>({ successStories: [], recentSignups: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialProof();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSocialProof, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSocialProof = async () => {
    try {
      const response = await apiService.getSocialProof();
      if (response.success) {
        setData(response.data || { successStories: [], recentSignups: [] });
      }
    } catch (error) {
      console.error('Error fetching social proof:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Stories */}
      {data.successStories && data.successStories.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Recent Success Stories</h3>
            </div>
            <div className="space-y-2">
              {data.successStories.slice(0, 3).map((story, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-semibold">
                        {story.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{story.username}</span>
                    {story.memberType === 'pro' && (
                      <Badge className="bg-purple-600 text-xs">Pro</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-semibold">
                      {parseFloat(story.earnings.toString()).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Signups */}
      {data.recentSignups && data.recentSignups.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Recent Signups</h3>
            </div>
            <div className="space-y-1">
              {data.recentSignups.slice(0, 5).map((signup, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{signup.username}</span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(signup.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {data.successStories.length > 0 ? data.successStories.length : 0}
              </div>
              <div className="text-xs text-gray-600">Success Stories</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {data.recentSignups.length > 0 ? data.recentSignups.length : 0}
              </div>
              <div className="text-xs text-gray-600">Recent Members</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProof;

