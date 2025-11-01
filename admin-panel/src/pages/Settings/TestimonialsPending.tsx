import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Clock, CheckCircle, XCircle, Eye, Search, Star } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';

interface Testimonial {
  id: string;
  username: string;
  name: string;
  content: string;
  rating: number;
  status: string;
  submittedAt: string;
}

const TestimonialsPending: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingTestimonials();
  }, []);

  const loadPendingTestimonials = async () => {
    try {
      setLoading(true);
      // This would call a backend endpoint for testimonials
      // For now, using mock structure
      setTestimonials([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load pending testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      // This would call approve endpoint
      toast.success('Testimonial approved successfully');
      loadPendingTestimonials();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve testimonial');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this testimonial?')) return;
    
    try {
      // This would call reject endpoint
      toast.success('Testimonial rejected');
      loadPendingTestimonials();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject testimonial');
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Testimonials</h1>
          <p className="text-gray-600">Review and approve user testimonials</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-600" />
            Pending Review ({filteredTestimonials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredTestimonials.length > 0 ? (
            <div className="space-y-4">
              {filteredTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                        <Badge variant="outline">@{testimonial.username}</Badge>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{testimonial.content}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(testimonial.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(testimonial.id)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(testimonial.id)}
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
              <p className="text-gray-500">No pending testimonials to review</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialsPending;