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
  Zap,
  X
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
  const [contestType, setContestType] = useState('');
  const [contestStatus, setContestStatus] = useState('draft');

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
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-10">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create New Contest</h3>
                <Button variant="outline" size="sm" onClick={() => {
                  setShowModal(false);
                  setContestType('');
                  setContestStatus('draft');
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {/* Basic Information */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contest Name *
                      </label>
                      <Input
                        id="contest-name"
                        placeholder="e.g., Top Referrer Challenge"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        id="contest-description"
                        placeholder="Describe the contest rules and objectives..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contest Type *
                        </label>
                        <Select value={contestType} onValueChange={setContestType}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="referral">Referral Contest</SelectItem>
                            <SelectItem value="matrix">Matrix Contest</SelectItem>
                            <SelectItem value="earnings">Earnings Contest</SelectItem>
                            <SelectItem value="activity">Activity Contest</SelectItem>
                            <SelectItem value="custom">Custom Contest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Initial Status
                        </label>
                        <Select value={contestStatus} onValueChange={setContestStatus}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates & Duration */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Dates & Duration</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <Input
                        type="datetime-local"
                        id="start-date"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <Input
                        type="datetime-local"
                        id="end-date"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Prize Information */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Prize Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prize Description *
                      </label>
                      <Input
                        id="prize-description"
                        placeholder="e.g., 1000 USD Cash Prize"
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prize Value *
                        </label>
                        <Input
                          type="number"
                          id="prize-value"
                          placeholder="0.00"
                          step="0.01"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <Select defaultValue={primaryCurrency}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="TRX">TRX</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Participation Settings */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Participation Settings</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Participants (optional)
                        </label>
                        <Input
                          type="number"
                          id="max-participants"
                          placeholder="Unlimited"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          id="is-automatic"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">Automatic Winner Selection</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          id="requires-approval"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Requires Approval</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Rules & Criteria */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Rules & Criteria</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Winning Criteria
                      </label>
                      <textarea
                        id="winning-criteria"
                        placeholder="Describe how winners will be determined..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Rules (optional)
                      </label>
                      <textarea
                        id="additional-rules"
                        placeholder="Any additional rules or terms..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setShowModal(false);
                  setContestType('');
                  setContestStatus('draft');
                }}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  const name = (document.getElementById('contest-name') as HTMLInputElement)?.value;
                  const description = (document.getElementById('contest-description') as HTMLTextAreaElement)?.value;
                  
                  if (!name || !description) {
                    toast.error('Please fill in required fields');
                    return;
                  }

                  if (!contestType) {
                    toast.error('Please select a contest type');
                    return;
                  }

                  const newContest: Contest = {
                    id: Date.now().toString(),
                    name: name,
                    description: description,
                    type: contestType as 'referral' | 'matrix' | 'earnings' | 'activity' | 'custom',
                    status: contestStatus as 'draft' | 'active' | 'paused' | 'completed' | 'cancelled',
                    startDate: (document.getElementById('start-date') as HTMLInputElement)?.value || new Date().toISOString(),
                    endDate: (document.getElementById('end-date') as HTMLInputElement)?.value || new Date().toISOString(),
                    prize: (document.getElementById('prize-description') as HTMLInputElement)?.value || 'TBD',
                    prizeValue: parseFloat((document.getElementById('prize-value') as HTMLInputElement)?.value || '0'),
                    currency: primaryCurrency,
                    participants: 0,
                    maxParticipants: parseInt((document.getElementById('max-participants') as HTMLInputElement)?.value || '0') || undefined,
                    rules: {},
                    winners: [],
                    isAutomatic: (document.getElementById('is-automatic') as HTMLInputElement)?.checked || false,
                    requiresApproval: (document.getElementById('requires-approval') as HTMLInputElement)?.checked || false
                  };

                  setContests([...contests, newContest]);
                  toast.success('Contest created successfully!');
                  setShowModal(false);
                  setContestType('');
                  setContestStatus('draft');
                }}>
                  <Trophy className="h-4 w-4 mr-2" />
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

