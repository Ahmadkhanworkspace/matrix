import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, User, Mail, Phone, Calendar, Eye, Edit, X } from 'lucide-react';
import { adminApiService } from '../../api';
import { toast } from 'react-hot-toast';

interface SearchResult {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  memberType: string;
  joinDate: string;
  lastLogin?: string;
  totalEarnings: number;
  totalReferrals: number;
}

const SearchMembers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'email' | 'all'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    memberType: 'all',
    minEarnings: '',
    maxEarnings: '',
    joinDateFrom: '',
    joinDateTo: ''
  });

  const handleSearch = async () => {
    if (!searchTerm.trim() && !showAdvanced) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 50,
      };

      if (searchTerm.trim()) {
        if (searchType === 'username') {
          params.search = searchTerm;
        } else if (searchType === 'email') {
          params.search = searchTerm;
        } else {
          params.search = searchTerm;
        }
      }

      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.memberType !== 'all') {
        params.membership = filters.memberType;
      }

      const response = await adminApiService.getUsers(params);
      if (response.success) {
        setResults(response.data?.users || response.data || []);
        if (response.data?.users?.length === 0) {
          toast.info('No members found');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSearchType('all');
    setResults([]);
    setFilters({
      status: 'all',
      memberType: 'all',
      minEarnings: '',
      maxEarnings: '',
      joinDateFrom: '',
      joinDateTo: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Members</h1>
          <p className="text-gray-600">Find members by username, email, or other criteria</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by username, email, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
              </div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Fields</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
              </select>
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Type</label>
                <select
                  value={filters.memberType}
                  onChange={(e) => setFilters({ ...filters, memberType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="FREE">Free</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Earnings</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minEarnings}
                    onChange={(e) => setFilters({ ...filters, minEarnings: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Earnings</label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.maxEarnings}
                    onChange={(e) => setFilters({ ...filters, maxEarnings: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-4">
              <div className="mb-3 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Found {results.length} member{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-2">
                {results.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{member.username}</h3>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                          <Badge variant="outline">{member.memberType}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {member.phone}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(member.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Earnings</p>
                        <p className="font-semibold">{member.totalEarnings?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {member.totalReferrals || 0} referrals
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No members found matching your search criteria</p>
            </div>
          )}

          {!loading && !searchTerm && results.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Enter search terms to find members</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchMembers;