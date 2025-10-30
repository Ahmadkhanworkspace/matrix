import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  Users,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  Filter,
  Search,
  Award,
  Target,
  TrendingUp,
  Gift,
  Crown,
  Medal,
  Star,
  Zap
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { toast } from 'react-hot-toast';

interface Contest {
  id: string;
  name: string;
  description: string;
  type: 'referral' | 'matrix' | 'earnings' | 'activity' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  prize: string;
  prizeValue: number;
  currency: string;
  participants: number;
  maxParticipants?: number;
  rules: any;
  winners: any[];
  isAutomatic: boolean;
  requiresApproval: boolean;
}

interface ContestStats {
  totalContests: number;
  activeContests: number;
  totalParticipants: number;
  totalPrizeValue: number;
  completedContests: number;
  averageParticipation: number;
}

const ContestsManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('contests');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Mock data - replace with actual API calls
  const [contests, setContests] = useState<Contest[]>([
    {
      id: '1',
      name: 'Top Referrer Challenge',
      description: 'Compete to bring in the most referrals this month',
      type: 'referral',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      prize: '1000 USD Cash Prize',
      prizeValue: 1000,
      currency: 'USD',
      participants: 245,
      maxParticipants: 500,
      rules: {},
      winners: [],
      isAutomatic: true,
      requiresApproval: false
    },
    {
      id: '2',
      name: 'Matrix Master Competition',
      description: 'Complete the most matrix cycles to win',
      type: 'matrix',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      prize: '500 USD + Premium Membership',
      prizeValue: 750,
      currency: 'USD',
      participants: 156,
      rules: {},
      winners: [],
      isAutomatic: true,
      requiresApproval: false
    }
  ]);

  const [stats] = useState<ContestStats>({
    totalContests: 2,
    activeContests: 2,
    totalParticipants: 401,
    totalPrizeValue: 1750,
    completedContests: 0,
    averageParticipation: 200
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: primaryCurrency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      active: { color: 'bg-green-100 text-green-800', icon: Play },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
      completed: { color: 'bg-blue-100 text-blue-800', icon: Trophy },
      cancelled: { color: 'bg-red-100 text-red-800', icon: Trash2 }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      referral: Users,
      matrix: Target,
      earnings: DollarSign,
      activity: TrendingUp,
      custom: Star
    };
    
    const Icon = icons[type as keyof typeof icons] || Trophy;
    return <Icon className="h-4 w-4" />;
  };

  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || contest.status === filterStatus;
    const matchesType = !filterType || contest.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contest Manager</h1>
          <p className="text-gray-600 mt-1">Create and manage contests and competitions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Contest
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Contests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeContests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Gift className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Prize Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPrizeValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contests List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Contests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContests.map((contest) => (
              <div key={contest.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTypeIcon(contest.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contest.name}</h3>
                      <p className="text-sm text-gray-600">{contest.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(contest.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Prize</p>
                    <p className="font-semibold">{contest.prize}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Participants</p>
                    <p className="font-semibold">
                      {contest.participants}
                      {contest.maxParticipants && ` / ${contest.maxParticipants}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-semibold">{new Date(contest.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date</p>
                    <p className="font-semibold">{new Date(contest.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2 text-xs">
                    {contest.isAutomatic && (
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Automatic
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Trophy className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Contest Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Contest</h3>
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Contest creation form will be implemented here</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Contest creation feature coming soon!');
                  setShowModal(false);
                }}>
                  Create Contest
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestsManager;

