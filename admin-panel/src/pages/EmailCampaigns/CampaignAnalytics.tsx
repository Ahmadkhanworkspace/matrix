import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { adminApiService } from '../../api/adminApi';
import toast from 'react-hot-toast';
import {
  Mail,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  X,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';

interface CampaignStats {
  campaign: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  stats: {
    total: number;
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
  variants: Array<{
    id: string;
    variant: string;
    sentCount: number;
    openCount: number;
    clickCount: number;
  }>;
}

interface AnalyticsData {
  dailyStats: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  variants: Array<{
    id: string;
    variant: string;
    sentCount: number;
    openCount: number;
    clickCount: number;
    openRate: number;
    clickRate: number;
  }>;
}

const CampaignAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [statsResponse, analyticsResponse] = await Promise.all([
        adminApiService.getEmailCampaignStats(id),
        adminApiService.getEmailCampaignAnalytics(id)
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-gray-600">{stats.campaign.name}</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.openRate.toFixed(2)}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.stats.opened} of {stats.stats.sent} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.clickRate.toFixed(2)}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.stats.clicked} of {stats.stats.sent} clicked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.bounceRate.toFixed(2)}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.stats.bounced} bounced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.unsubscribed}</div>
            <p className="text-xs text-gray-600 mt-1">
              Unsubscribe rate: {stats.stats.sent > 0 ? ((stats.stats.unsubscribed / stats.stats.sent) * 100).toFixed(2) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Recipients</span>
                <span className="font-semibold">{stats.stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Emails Sent</span>
                <span className="font-semibold text-green-600">{stats.stats.sent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Opened</span>
                <span className="font-semibold text-blue-600">{stats.stats.opened}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clicked</span>
                <span className="font-semibold text-purple-600">{stats.stats.clicked}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bounced</span>
                <span className="font-semibold text-red-600">{stats.stats.bounced}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unsubscribed</span>
                <span className="font-semibold text-orange-600">{stats.stats.unsubscribed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* A/B Test Variants */}
        {stats.variants && stats.variants.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>A/B Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.variants.map((variant) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Variant {variant.variant}</span>
                      <Badge variant="outline">{variant.sentCount} sent</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Open Rate:</span>
                        <span className="font-medium">
                          {variant.sentCount > 0
                            ? ((variant.openCount / variant.sentCount) * 100).toFixed(2)
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Click Rate:</span>
                        <span className="font-medium">
                          {variant.sentCount > 0
                            ? ((variant.clickCount / variant.sentCount) * 100).toFixed(2)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Daily Performance Chart */}
      {analytics && analytics.dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.dailyStats.map((day, index) => {
                const maxSent = Math.max(...analytics.dailyStats.map(d => d.sent));
                const sentWidth = maxSent > 0 ? (day.sent / maxSent) * 100 : 0;
                const openWidth = day.sent > 0 ? (day.opened / day.sent) * 100 : 0;
                const clickWidth = day.sent > 0 ? (day.clicked / day.sent) * 100 : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{new Date(day.date).toLocaleDateString()}</span>
                      <span className="text-gray-600">{day.sent} sent, {day.opened} opened, {day.clicked} clicked</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-3 relative">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${sentWidth}%` }}
                          title={`${day.sent} sent`}
                        ></div>
                      </div>
                      {day.sent > 0 && (
                        <div className="flex space-x-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${openWidth}%` }}
                            title={`${day.opened} opened`}
                          ></div>
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${clickWidth}%` }}
                            title={`${day.clicked} clicked`}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignAnalytics;

