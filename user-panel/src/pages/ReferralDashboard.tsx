import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { apiService } from '../api/api';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import toast from 'react-hot-toast';
import { Link as RouterLink } from 'react-router-dom';
import {
  Link,
  Copy,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Eye,
  Plus,
  Filter,
  Download,
  Trophy
} from 'lucide-react';

interface ReferralLink {
  id: string;
  name: string;
  linkCode: string;
  url: string;
  clicks: number;
  signups: number;
  conversions: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  totalSignups: number;
  totalReferrals: number;
  activeReferrals: number;
  totalConversions: number;
  totalEarnings: number;
  conversionRate: number;
  funnel: {
    visitors: number;
    signups: number;
    active: number;
  };
}

const ReferralDashboard: React.FC = () => {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLinks: 0,
    totalClicks: 0,
    totalSignups: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    totalConversions: 0,
    totalEarnings: 0,
    conversionRate: 0,
    funnel: { visitors: 0, signups: 0, active: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLink, setNewLink] = useState({
    name: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [linksResponse, dashboardResponse] = await Promise.all([
        apiService.getReferralLinks(),
        apiService.getReferralDashboard()
      ]);

      if (linksResponse.success) {
        setLinks(linksResponse.data || []);
      }

      if (dashboardResponse.success) {
        setStats(dashboardResponse.data || stats);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createReferralLink(newLink);
      if (response.success) {
        toast.success('Referral link created successfully!');
        setShowCreateForm(false);
        setNewLink({ name: '', utmSource: '', utmMedium: '', utmCampaign: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to create referral link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    try {
      if (amount === null || amount === undefined) return '0.00 USD';
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return '0.00 USD';
      return formatCurrencyUtil(numAmount, 'USD');
    } catch {
      return '0.00 USD';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Dashboard</h1>
          <p className="text-gray-600">Track and manage your referral links</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Link
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Link className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLinks}</div>
            <p className="text-xs text-gray-600">Active referral links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-gray-600">All-time clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-gray-600">{stats.activeReferrals} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-gray-600">From referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Visitors</span>
                  <span className="text-sm text-gray-600">{stats.funnel.visitors}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Signups</span>
                  <span className="text-sm text-gray-600">{stats.funnel.signups}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${stats.funnel.visitors > 0 ? (stats.funnel.signups / stats.funnel.visitors) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active Users</span>
                  <span className="text-sm text-gray-600">{stats.funnel.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${stats.funnel.signups > 0 ? (stats.funnel.active / stats.funnel.signups) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Conversion Rate: <span className="font-semibold text-gray-900">{stats.conversionRate.toFixed(2)}%</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Link Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Referral Link</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <Label htmlFor="name">Link Name *</Label>
                <Input
                  id="name"
                  value={newLink.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLink({ ...newLink, name: e.target.value })}
                  placeholder="e.g., Facebook Campaign"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="utmSource">UTM Source</Label>
                  <Input
                    id="utmSource"
                    value={newLink.utmSource}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLink({ ...newLink, utmSource: e.target.value })}
                    placeholder="e.g., facebook"
                  />
                </div>
                <div>
                  <Label htmlFor="utmMedium">UTM Medium</Label>
                  <Input
                    id="utmMedium"
                    value={newLink.utmMedium}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLink({ ...newLink, utmMedium: e.target.value })}
                    placeholder="e.g., social"
                  />
                </div>
                <div>
                  <Label htmlFor="utmCampaign">UTM Campaign</Label>
                  <Input
                    id="utmCampaign"
                    value={newLink.utmCampaign}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLink({ ...newLink, utmCampaign: e.target.value })}
                    placeholder="e.g., summer2024"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Create Link</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Referral Links List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Referral Links</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No referral links yet. Create your first link above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{link.name}</h3>
                        {link.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{link.url}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(link.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-600">Clicks</p>
                          <p className="text-sm font-semibold">{link.clicks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Signups</p>
                          <p className="text-sm font-semibold">{link.signups}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Conversions</p>
                          <p className="text-sm font-semibold">{link.conversions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Earnings</p>
                          <p className="text-sm font-semibold">{formatCurrency(link.totalEarnings)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <RouterLink to={`/referrals/links/${link.id}/stats`}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Stats
                        </RouterLink>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.url)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/referrals/leaderboard'}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Leaderboard</h3>
                <p className="text-sm text-gray-600">View top referrers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/referrals/downline-tree'}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Downline Tree</h3>
                <p className="text-sm text-gray-600">Visualize your network</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/referrals/commission-breakdown'}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Commission Report</h3>
                <p className="text-sm text-gray-600">View detailed breakdown</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralDashboard;

