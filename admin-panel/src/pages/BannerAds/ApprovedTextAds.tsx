import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { CheckCircle, FileText, Eye, Edit, Trash2, Search } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface TextAd {
  id: string;
  title: string;
  content: string;
  linkUrl: string;
  type: string;
  status: string;
  position: string;
  impressions: number;
  clicks: number;
  ctr: number;
  createdAt: string;
}

const ApprovedTextAds: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<TextAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTextAds();
  }, []);

  const loadTextAds = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getBanners({
        status: 'active',
        type: 'text-ad',
        limit: 100
      });
      if (response.success) {
        setAds(response.data?.banners || response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load approved text ads');
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = ads.filter(ad =>
    ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this text ad?')) return;
    
    try {
      const response = await adminApiService.deleteBanner(id);
      if (response.success) {
        toast.success('Text ad deleted successfully');
        loadTextAds();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete text ad');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approved Text Ads</h1>
          <p className="text-gray-600">View and manage approved text advertisements</p>
        </div>
        <Button onClick={() => navigate('/admin/banner-ads/add-text-ad')}>
          <FileText className="h-4 w-4 mr-2" />
          Add New Text Ad
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search text ads..."
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
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Approved Text Ads ({filteredAds.length})
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
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        <Badge variant="outline">{ad.type}</Badge>
                        <Badge variant="outline">{ad.position}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ad.content}</p>
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
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>Impressions: {ad.impressions?.toLocaleString() || 0}</span>
                        <span>Clicks: {ad.clicks || 0}</span>
                        <span>CTR: {ad.ctr?.toFixed(2) || 0}%</span>
                        <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ad.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No approved text ads found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovedTextAds;