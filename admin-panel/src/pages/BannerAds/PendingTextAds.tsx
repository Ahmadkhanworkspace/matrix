import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Clock, FileText, CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';

interface TextAd {
  id: string;
  title: string;
  content: string;
  linkUrl: string;
  type: string;
  status: string;
  createdAt: string;
  submittedBy?: string;
}

const PendingTextAds: React.FC = () => {
  const [ads, setAds] = useState<TextAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingTextAds();
  }, []);

  const loadPendingTextAds = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getBanners({
        status: 'pending',
        type: 'text-ad',
        limit: 100
      });
      if (response.success) {
        setAds(response.data?.banners || response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load pending text ads');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await adminApiService.approveBanner(id);
      if (response.success) {
        toast.success('Text ad approved successfully');
        loadPendingTextAds();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve text ad');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this text ad?')) return;
    
    try {
      const response = await adminApiService.rejectBanner(id);
      if (response.success) {
        toast.success('Text ad rejected');
        loadPendingTextAds();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject text ad');
    }
  };

  const filteredAds = ads.filter(ad =>
    ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Text Ads</h1>
          <p className="text-gray-600">Review and approve pending text ad submissions</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pending text ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-600" />
            Pending Review ({filteredAds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="space-y-4">
              {filteredAds.map((ad) => (
                <div
                  key={ad.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                        <Badge variant="outline">{ad.type}</Badge>
                        {ad.submittedBy && (
                          <span className="text-xs text-gray-500">
                            Submitted by: {ad.submittedBy}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{ad.content}</p>
                      {ad.linkUrl && (
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {ad.linkUrl}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(ad.id)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(ad.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending text ads to review</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingTextAds;