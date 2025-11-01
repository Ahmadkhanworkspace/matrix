import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Play, Video, Book, Download, Clock, Users, Star } from 'lucide-react';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  views: number;
  rating: number;
  thumbnail: string;
  url: string;
}

const TrainingVideo: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [videos] = useState<VideoTutorial[]>([
    {
      id: '1',
      title: 'Admin Panel Overview',
      description: 'Complete walkthrough of all admin panel features and navigation',
      duration: '15:30',
      category: 'getting-started',
      level: 'beginner',
      views: 1234,
      rating: 4.8,
      thumbnail: '/videos/admin-overview.jpg',
      url: '#'
    },
    {
      id: '2',
      title: 'Matrix Configuration',
      description: 'How to configure matrix levels, bonuses, and payout structures',
      duration: '22:15',
      category: 'configuration',
      level: 'intermediate',
      views: 856,
      rating: 4.9,
      thumbnail: '/videos/matrix-config.jpg',
      url: '#'
    },
    {
      id: '3',
      title: 'Payment Gateway Setup',
      description: 'Setting up CoinPayments and NOWPayments for deposits and withdrawals',
      duration: '18:45',
      category: 'configuration',
      level: 'intermediate',
      views: 642,
      rating: 4.7,
      thumbnail: '/videos/payment-setup.jpg',
      url: '#'
    },
    {
      id: '4',
      title: 'Cron Job Management',
      description: 'Understanding cron jobs, monitoring status, and manual execution',
      duration: '12:20',
      category: 'advanced',
      level: 'advanced',
      views: 423,
      rating: 4.6,
      thumbnail: '/videos/cron-jobs.jpg',
      url: '#'
    },
    {
      id: '5',
      title: 'User Management Best Practices',
      description: 'Tips for managing users, referrals, and member verification',
      duration: '16:10',
      category: 'user-management',
      level: 'beginner',
      views: 789,
      rating: 4.8,
      thumbnail: '/videos/user-management.jpg',
      url: '#'
    },
    {
      id: '6',
      title: 'Analytics and Reporting',
      description: 'Using analytics dashboard and generating reports',
      duration: '14:30',
      category: 'analytics',
      level: 'intermediate',
      views: 567,
      rating: 4.5,
      thumbnail: '/videos/analytics.jpg',
      url: '#'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'configuration', name: 'Configuration' },
    { id: 'user-management', name: 'User Management' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const filteredVideos = selectedCategory === 'all'
    ? videos
    : videos.filter(v => v.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Videos</h1>
          <p className="text-gray-600">Watch video tutorials to learn how to use the admin panel</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
              <Video className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">
                  {videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold">
                  {(videos.reduce((sum, v) => sum + v.rating, 0) / videos.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold">
                  {videos.reduce((sum, v) => {
                    const [min, sec] = v.duration.split(':').map(Number);
                    return sum + min * 60 + sec;
                  }, 0) / 60}hr
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-200 relative rounded-t-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-16 w-16 text-white opacity-80" />
              </div>
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-black bg-opacity-70 text-white">
                  {video.duration}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className={getLevelColor(video.level)}>
                  {video.level}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                  {video.rating}
                </div>
              </div>
              <CardTitle className="text-lg">{video.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {video.views.toLocaleString()} views
                </span>
                <span className="flex items-center">
                  <Book className="h-3 w-3 mr-1" />
                  {video.category}
                </span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Watch
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book className="h-5 w-5 mr-2" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-blue-500 font-bold mr-3">1.</span>
              <div>
                <h4 className="font-semibold mb-1">Watch Admin Panel Overview</h4>
                <p className="text-sm text-gray-600">Start with the overview video to understand the admin panel structure</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 font-bold mr-3">2.</span>
              <div>
                <h4 className="font-semibold mb-1">Configure Matrix Settings</h4>
                <p className="text-sm text-gray-600">Set up your matrix levels and bonus structures</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 font-bold mr-3">3.</span>
              <div>
                <h4 className="font-semibold mb-1">Setup Payment Gateways</h4>
                <p className="text-sm text-gray-600">Configure payment gateways for deposits and withdrawals</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-500 font-bold mr-3">4.</span>
              <div>
                <h4 className="font-semibold mb-1">Start Managing Users</h4>
                <p className="text-sm text-gray-600">Begin adding and managing user accounts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingVideo;