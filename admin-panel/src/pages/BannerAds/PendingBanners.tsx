import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Clock, Image, CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';

interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  type: string;
  status: string;
  createdAt: string;
  submittedBy?: string;
}

const PendingBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingBanners();
  }, []);

  const loadPendingBanners = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getBanners({
        status: 'pending',
        limit: 100
      });
      if (response.success) {
        setBanners(response.data?.banners || response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load pending banners');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await adminApiService.approveBanner(id);
      if (response.success) {
        toast.success('Banner approved successfully');
        loadPendingBanners();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve banner');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this banner?')) return;
    
    try {
      const response = await adminApiService.rejectBanner(id);
      if (response.success) {
        toast.success('Banner rejected');
        loadPendingBanners();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject banner');
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.altText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Banners</h1>
          <p className="text-gray-600">Review and approve pending banner submissions</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pending banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Banners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-600" />
            Pending Review ({filteredBanners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredBanners.length > 0 ? (
            <div className="space-y-4">
              {filteredBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="w-32 h-20 bg-gray-100 rounded flex-shrink-0 relative overflow-hidden">
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
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{banner.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{banner.altText}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{banner.type}</Badge>
                            {banner.submittedBy && (
                              <span className="text-xs text-gray-500">
                                Submitted by: {banner.submittedBy}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(banner.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {banner.linkUrl && (
                            <a
                              href={banner.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {banner.linkUrl}
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(banner.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(banner.id)}
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending banners to review</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingBanners;