import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Image, Plus } from 'lucide-react';

const PromotionalBanners: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotional Banners</h1>
          <p className="text-gray-600">Manage promotional banners and advertisements</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Promotional Banners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">Promotional banner management will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionalBanners; 
