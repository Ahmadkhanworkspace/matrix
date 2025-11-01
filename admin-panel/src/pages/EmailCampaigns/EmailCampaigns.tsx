import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { adminApiService } from '../../api/adminApi';
import toast from 'react-hot-toast';
import {
  Mail,
  Plus,
  Send,
  BarChart3,
  Edit,
  Trash2,
  Play,
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  emailVariantCount: number;
  createdAt: string;
}

const EmailCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'drip',
    subject: '',
    templateId: '',
    segments: null,
    scheduledAt: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getEmailCampaigns();
      if (response.success) {
        setCampaigns(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminApiService.createEmailCampaign(formData);
      if (response.success) {
        toast.success('Campaign created successfully');
        setShowForm(false);
        resetForm();
        fetchCampaigns();
      }
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleSend = async (campaignId: string) => {
    if (!window.confirm('Are you sure you want to send this campaign?')) return;

    try {
      const response = await adminApiService.sendEmailCampaign(campaignId);
      if (response.success) {
        toast.success(`Campaign sent to ${response.data.sentCount} recipients`);
        fetchCampaigns();
      }
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'drip',
      subject: '',
      templateId: '',
      segments: null,
      scheduledAt: ''
    });
    setSelectedCampaign(null);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      draft: { color: 'bg-gray-600', icon: Clock },
      scheduled: { color: 'bg-blue-600', icon: Clock },
      sending: { color: 'bg-yellow-600', icon: Play },
      completed: { color: 'bg-green-600', icon: CheckCircle },
      paused: { color: 'bg-orange-600', icon: Clock }
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return (
      <Badge className={badge.color + ' text-white'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600">Create and manage email marketing campaigns</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.recipientCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Campaign Type *</Label>
                  <select
                    id="type"
                    className="w-full border rounded-md p-2"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="drip">Drip Campaign</option>
                    <option value="broadcast">Broadcast</option>
                    <option value="trigger">Trigger-based</option>
                    <option value="ab-test">A/B Test</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter email subject line"
                />
              </div>
              <div>
                <Label htmlFor="scheduledAt">Schedule Send (Optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Create Campaign</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No campaigns created yet</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                        <Badge variant="outline">{campaign.type}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Recipients:</span> {campaign.recipientCount}
                        </div>
                        <div>
                          <span className="font-medium">Variants:</span> {campaign.emailVariantCount}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                        {campaign.sentAt && (
                          <div>
                            <span className="font-medium">Sent:</span>{' '}
                            {new Date(campaign.sentAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/email-campaigns/${campaign.id}/stats`;
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Stats
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSend(campaign.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => {}}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCampaigns;

