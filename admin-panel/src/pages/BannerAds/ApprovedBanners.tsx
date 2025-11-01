import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { CheckCircle, Image, Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  type: string;
  status: string;
  position: string;
  priority: string;
  impressions: number;
  clicks: number;
  ctr: number;
  createdAt: string;
}

const ApprovedBanners: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getBanners({
        status: 'active',
        limit: 100
      });
      if (response.success) {
        setBanners(response.data?.banners || response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load approved banners');
    } finally {
      setLoading(false);
    }
  };

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         banner.altText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || banner.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const response = await adminApiService.deleteBanner(id);
      if (response.success) {
        toast.success('Banner deleted successfully');
        loadBanners();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approved Banners</h1>
          <p className="text-gray-600">View and manage approved promotional banners</p>
        </div>
        <Button onClick={() => navigate('/admin/banner-ads/add')}>
          <Image className="h-4 w-4 mr-2" />
          Add New Banner
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="banner">Banner</option>
              <option value="popup">Popup</option>
              <option value="sidebar">Sidebar</option>
              <option value="notification">Notification</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Approved Banners ({filteredBanners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredBanners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 relative">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.altText}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{banner.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{banner.altText}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{banner.type}</Badge>
                      <Badge variant="outline">{banner.position}</Badge>
                      <Badge variant="outline">{banner.priority}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                      <div>
                        <p className="font-semibold">{banner.impressions?.toLocaleString() || 0}</p>
                        <p>Impressions</p>
                      </div>
                      <div>
                        <p className="font-semibold">{banner.clicks || 0}</p>
                        <p>Clicks</p>
                      </div>
                      <div>
                        <p className="font-semibold">{banner.ctr?.toFixed(2) || 0}%</p>
                        <p>CTR</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
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
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No approved banners found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovedBanners;