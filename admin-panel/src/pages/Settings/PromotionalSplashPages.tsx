import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Globe, Plus, Edit, Trash2, Eye, ExternalLink } from 'lucide-react';

interface SplashPage {
  id: string;
  title: string;
  url: string;
  status: 'active' | 'inactive';
  visits: number;
  createdAt: string;
}

const PromotionalSplashPages: React.FC = () => {
  const [pages, setPages] = useState<SplashPage[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotional Splash Pages</h1>
          <p className="text-gray-600">Manage promotional splash pages</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Splash Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Splash Pages ({pages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length > 0 ? (
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Globe className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{page.title}</h3>
                        <Badge className={page.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {page.status}
                        </Badge>
                      </div>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        {page.url}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{page.visits} visits</span>
                        <span>Created: {new Date(page.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
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
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No splash pages created yet</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Splash Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionalSplashPages;