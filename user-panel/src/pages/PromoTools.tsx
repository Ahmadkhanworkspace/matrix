import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Share2, 
  Link, 
  Download, 
  Copy,
  CheckCircle,
  Eye,
  BarChart3,
  Users,
  MessageCircle,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Globe
} from 'lucide-react';

interface PromoTool {
  id: string;
  name: string;
  type: 'banner' | 'video' | 'text' | 'social';
  category: string;
  description: string;
  url: string;
  downloads: number;
  views: number;
  clicks: number;
  conversions: number;
}

interface ReferralLink {
  id: string;
  name: string;
  url: string;
  clicks: number;
  signups: number;
  earnings: number;
  status: 'active' | 'inactive';
}

const PromoTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'materials' | 'links' | 'analytics'>('materials');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [promoTools, setPromoTools] = useState<PromoTool[]>([
    {
      id: '1',
      name: 'Matrix MLM Banner 1',
      type: 'banner',
      category: 'Banners',
      description: 'Professional banner for social media',
      url: '/promo/banner1.jpg',
      downloads: 45,
      views: 1200,
      clicks: 89,
      conversions: 12
    },
    {
      id: '2',
      name: 'How Matrix Works Video',
      type: 'video',
      category: 'Videos',
      description: 'Explainer video about matrix system',
      url: '/promo/video1.mp4',
      downloads: 23,
      views: 850,
      clicks: 67,
      conversions: 8
    },
    {
      id: '3',
      name: 'Matrix Benefits Text',
      type: 'text',
      category: 'Text',
      description: 'Copy for social media posts',
      url: '/promo/text1.txt',
      downloads: 78,
      views: 2100,
      clicks: 156,
      conversions: 23
    },
    {
      id: '4',
      name: 'Social Media Post 1',
      type: 'social',
      category: 'Social',
      description: 'Ready-to-use social media post',
      url: '/promo/social1.jpg',
      downloads: 34,
      views: 950,
      clicks: 78,
      conversions: 15
    }
  ]);

  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([
    {
      id: '1',
      name: 'Main Referral Link',
      url: 'https://matrixmlm.com/ref/john_doe',
      clicks: 156,
      signups: 23,
      earnings: 1150,
      status: 'active'
    },
    {
      id: '2',
      name: 'Facebook Campaign',
      url: 'https://matrixmlm.com/ref/john_doe/fb',
      clicks: 89,
      signups: 12,
      earnings: 600,
      status: 'active'
    },
    {
      id: '3',
      name: 'Instagram Campaign',
      url: 'https://matrixmlm.com/ref/john_doe/ig',
      clicks: 67,
      signups: 8,
      earnings: 400,
      status: 'active'
    }
  ]);

  const categories = ['all', 'Banners', 'Videos', 'Text', 'Social'];

  const filteredTools = promoTools.filter(tool => 
    selectedCategory === 'all' || tool.category === selectedCategory
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Show toast notification
    alert('Copied to clipboard!');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner':
        return <Globe className="h-4 w-4" />;
      case 'video':
        return <Youtube className="h-4 w-4" />;
      case 'text':
        return <MessageCircle className="h-4 w-4" />;
      case 'social':
        return <Share2 className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge className="bg-green-100 text-green-800">Active</Badge> :
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotional Tools</h1>
          <p className="text-gray-600">Marketing materials and referral tools</p>
        </div>
        <Button>
          <Share2 className="h-4 w-4 mr-2" />
          Create New Campaign
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoTools.reduce((sum, tool) => sum + tool.downloads, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Marketing materials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralLinks.reduce((sum, link) => sum + link.clicks, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Referral links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralLinks.reduce((sum, link) => sum + link.signups, 0)}
            </div>
            <p className="text-xs text-muted-foreground">New members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(referralLinks.reduce((sum, link) => sum + link.earnings, 0))}
            </div>
            <p className="text-xs text-muted-foreground">From referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'materials' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('materials')}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Marketing Materials
        </Button>
        <Button
          variant={activeTab === 'links' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('links')}
          className="flex-1"
        >
          <Link className="h-4 w-4 mr-2" />
          Referral Links
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('analytics')}
          className="flex-1"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Marketing Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    {getTypeIcon(tool.type)}
                  </div>
                  <Badge variant="secondary">{tool.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{tool.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{tool.downloads}</div>
                      <div className="text-gray-500">Downloads</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{tool.views}</div>
                      <div className="text-gray-500">Views</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{tool.clicks}</div>
                      <div className="text-gray-500">Clicks</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{tool.conversions}</div>
                      <div className="text-gray-500">Conversions</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(tool.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referralLinks.map((link) => (
                  <div
                    key={link.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{link.name}</h3>
                          {getStatusBadge(link.status)}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={link.url}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                          />
                          <Button size="sm" onClick={() => copyToClipboard(link.url)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-gray-900">{link.clicks}</div>
                            <div className="text-gray-500">Clicks</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{link.signups}</div>
                            <div className="text-gray-500">Signups</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{formatCurrency(link.earnings)}</div>
                            <div className="text-gray-500">Earnings</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Media Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Share on Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex items-center justify-center">
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Performance chart will be displayed here</p>
                  <p className="text-sm">Click-through rates and conversions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promoTools
                  .sort((a, b) => b.conversions - a.conversions)
                  .slice(0, 5)
                  .map((tool, index) => (
                    <div key={tool.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{tool.name}</div>
                          <div className="text-sm text-gray-500">{tool.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{tool.conversions}</div>
                        <div className="text-sm text-gray-500">conversions</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PromoTools; 