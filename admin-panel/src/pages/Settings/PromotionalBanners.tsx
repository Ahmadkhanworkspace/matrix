import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Image, Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';

interface PromoBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
}

const PromotionalBanners: React.FC = () => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotional Banners</h1>
          <p className="text-gray-600">Manage promotional banners for marketing campaigns</p>
        </div>
        <Button onClick={() => window.location.href = '/admin/banner-ads/add'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Promotional Banners ({banners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 relative">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">
                      {banner.status}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{banner.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <span>{banner.impressions} impressions</span>
                      <span>{banner.clicks} clicks</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
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
              <p className="text-gray-500">No promotional banners created yet</p>
              <Button className="mt-4" onClick={() => window.location.href = '/admin/banner-ads/add'}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Banner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionalBanners;