import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiService } from '../api/api';
import toast from 'react-hot-toast';
import {
  Trophy,
  Star,
  Target,
  TrendingUp,
  Gift,
  Award,
  Zap,
  Flame,
  Medal,
  Coins,
  ShoppingBag,
  Users,
  DollarSign
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirementType: string;
  requirementValue: number;
}

interface UserAchievement {
  id: string;
  achievement: Achievement;
  progress: number;
  isEarned: boolean;
  earnedAt: string | null;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  requirements: any;
  reward: any;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: string;
  quantity: number;
  remaining: number;
}

const Gamification: React.FC = () => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [points, setPoints] = useState({ totalPoints: 0, history: [] });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'achievements') {
        const [allAchievements, userAchievementsRes] = await Promise.all([
          apiService.getAchievements(),
          apiService.getUserAchievements()
        ]);
        if (allAchievements.success) setAchievements(allAchievements.data || []);
        if (userAchievementsRes.success) setUserAchievements(userAchievementsRes.data || []);
      } else if (activeTab === 'points') {
        const pointsRes = await apiService.getPoints();
        if (pointsRes.success) setPoints(pointsRes.data || { totalPoints: 0, history: [] });
      } else if (activeTab === 'challenges') {
        const challengesRes = await apiService.getChallenges();
        if (challengesRes.success) setChallenges(challengesRes.data || []);
      } else if (activeTab === 'leaderboard') {
        const leaderboardRes = await apiService.getLeaderboard('referrals');
        if (leaderboardRes.success) setLeaderboard(leaderboardRes.data || []);
      } else if (activeTab === 'rewards') {
        const rewardsRes = await apiService.getRewards();
        if (rewardsRes.success) setRewards(rewardsRes.data || []);
      }

      // Fetch streak
      const streakRes = await apiService.getLoginStreak();
      if (streakRes.success) setStreak(streakRes.data || { currentStreak: 0, longestStreak: 0 });
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAchievement = async (achievementId: string) => {
    try {
      const response = await apiService.claimAchievement(achievementId);
      if (response.success) {
        toast.success(`Achievement claimed! ${response.data.pointsAwarded} points awarded`);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to claim achievement');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await apiService.joinChallenge(challengeId);
      if (response.success) {
        toast.success('Challenge joined successfully!');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    try {
      const response = await apiService.redeemReward(rewardId);
      if (response.success) {
        toast.success('Reward redeemed successfully!');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to redeem reward');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header with Points and Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Coins className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{points.totalPoints.toLocaleString()}</div>
            <p className="text-sm opacity-90">Available for redemption</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
            <Flame className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak.currentStreak} days</div>
            <p className="text-sm opacity-90">Best: {streak.longestStreak} days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userAchievements.filter(ua => ua.isEarned).length} / {achievements.length}
            </div>
            <p className="text-sm opacity-90">Earned achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : achievements.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No achievements available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => {
                    const userAchievement = userAchievements.find(ua => ua.achievement.id === achievement.id);
                    const progress = userAchievement ? userAchievement.progress : 0;
                    const percentage = (progress / achievement.requirementValue) * 100;

                    return (
                      <Card key={achievement.id} className="relative">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-2xl">{achievement.icon || '🏆'}</span>
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{achievement.name}</CardTitle>
                              <p className="text-sm text-gray-600">{achievement.category}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-700 mb-4">{achievement.description}</p>
                          
                          {!userAchievement?.isEarned && (
                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{progress.toFixed(0)} / {achievement.requirementValue}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{achievement.points} points</Badge>
                            {userAchievement?.isEarned ? (
                              <Badge className="bg-green-600 text-white">Earned</Badge>
                            ) : percentage >= 100 ? (
                              <Button size="sm" onClick={() => handleClaimAchievement(achievement.id)}>
                                Claim
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-500">{percentage.toFixed(0)}% Complete</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points Tab */}
        <TabsContent value="points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
            </CardHeader>
            <CardContent>
              {points.history.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No points history</p>
              ) : (
                <div className="space-y-2">
                  {points.history.map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{entry.description || entry.source}</p>
                        <p className="text-sm text-gray-600">{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge className={entry.points > 0 ? 'bg-green-600' : 'bg-red-600'}>
                        {entry.points > 0 ? '+' : ''}{entry.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              {challenges.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No active challenges</p>
              ) : (
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <Card key={challenge.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{challenge.name}</CardTitle>
                          <Badge variant="outline">{challenge.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{challenge.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Ends: {new Date(challenge.endDate).toLocaleDateString()}
                          </div>
                          <Button onClick={() => handleJoinChallenge(challenge.id)}>
                            Join Challenge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No leaderboard data</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId || index}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        index === 0 ? 'bg-yellow-50 border-yellow-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{entry.username}</p>
                          <p className="text-sm text-gray-600">{entry.score} referrals</p>
                        </div>
                      </div>
                      {index < 3 && (
                        <Medal className={`h-6 w-6 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rewards Shop</CardTitle>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No rewards available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.map((reward) => (
                    <Card key={reward.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{reward.name}</span>
                          <Badge>{reward.cost} points</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-4">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            {reward.remaining === -1 ? 'Unlimited' : `${reward.remaining} left`}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleRedeemReward(reward.id)}
                            disabled={points.totalPoints < reward.cost || (reward.remaining !== undefined && reward.remaining !== null && reward.remaining === 0)}
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Redeem
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Gamification;

