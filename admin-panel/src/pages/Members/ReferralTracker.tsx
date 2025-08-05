import React, { useState, useEffect } from 'react';
import { Users, Network, TrendingUp, Award, UserPlus, UserCheck, UserX, Activity, Clock, CheckCircle, XCircle, Plus, Download, RefreshCw, Search, Filter, Eye, Edit, Trash2, BarChart3, Target, Star } from 'lucide-react';

interface Referral {
  id: string;
  sponsorId: string;
  sponsorName: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  joinDate: string;
  status: 'active' | 'pending' | 'inactive';
  level: number;
  commissionEarned: number;
  bonusEarned: number;
  matrixPositions: number;
  completedCycles: number;
  lastActivity: string;
  uplinePath: string[];
  directReferrals: number;
  totalReferrals: number;
  rank: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalCommission: number;
  totalBonus: number;
  averageLevel: number;
  topPerformer: string;
  conversionRate: number;
}

const ReferralTracker: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
    totalCommission: 0,
    totalBonus: 0,
    averageLevel: 0,
    topPerformer: '',
    conversionRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);

  // Mock data for demonstration
  const mockReferrals: Referral[] = [
    {
      id: '1',
      sponsorId: 'S001',
      sponsorName: 'John Sponsor',
      memberId: 'M001',
      memberName: 'Alice Johnson',
      memberEmail: 'alice@example.com',
      joinDate: '2024-01-15',
      status: 'active',
      level: 1,
      commissionEarned: 150.00,
      bonusEarned: 75.00,
      matrixPositions: 3,
      completedCycles: 2,
      lastActivity: '2024-01-20',
      uplinePath: ['S001', 'S002'],
      directReferrals: 2,
      totalReferrals: 5,
      rank: 'Silver'
    },
    {
      id: '2',
      sponsorId: 'S001',
      sponsorName: 'John Sponsor',
      memberId: 'M002',
      memberName: 'Bob Smith',
      memberEmail: 'bob@example.com',
      joinDate: '2024-01-16',
      status: 'pending',
      level: 1,
      commissionEarned: 0.00,
      bonusEarned: 0.00,
      matrixPositions: 1,
      completedCycles: 0,
      lastActivity: '2024-01-16',
      uplinePath: ['S001'],
      directReferrals: 0,
      totalReferrals: 0,
      rank: 'Bronze'
    }
  ];

  useEffect(() => {
    loadReferrals();
    calculateStats();
  }, [currentPage, searchTerm, statusFilter, levelFilter]);

  const loadReferrals = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReferrals(mockReferrals);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  };

  const calculateStats = () => {
    const totalReferrals = mockReferrals.length;
    const activeReferrals = mockReferrals.filter(r => r.status === 'active').length;
    const pendingReferrals = mockReferrals.filter(r => r.status === 'pending').length;
    const totalCommission = mockReferrals.reduce((sum, r) => sum + r.commissionEarned, 0);
    const totalBonus = mockReferrals.reduce((sum, r) => sum + r.bonusEarned, 0);
    const averageLevel = mockReferrals.reduce((sum, r) => sum + r.level, 0) / totalReferrals;
    const topPerformer = mockReferrals.reduce((top, current) => 
      current.totalReferrals > top.totalReferrals ? current : top
    ).memberName;
    const conversionRate = (activeReferrals / totalReferrals) * 100;

    setStats({
      totalReferrals,
      activeReferrals,
      pendingReferrals,
      totalCommission,
      totalBonus,
      averageLevel,
      topPerformer,
      conversionRate
    });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'level') {
      setLevelFilter(value);
    }
    setCurrentPage(1);
  };

  const handleSelectReferral = (referralId: string) => {
    setSelectedReferrals(prev => 
      prev.includes(referralId) 
        ? prev.filter(id => id !== referralId)
        : [...prev, referralId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReferrals.length === referrals.length) {
      setSelectedReferrals([]);
    } else {
      setSelectedReferrals(referrals.map(referral => referral.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Diamond': return 'text-purple-600';
      case 'Platinum': return 'text-blue-600';
      case 'Gold': return 'text-yellow-600';
      case 'Silver': return 'text-gray-600';
      case 'Bronze': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Tracker</h1>
          <p className="text-gray-600">Track and manage referral relationships and commissions</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-2 inline" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeReferrals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalCommission.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white">
              <Award className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Top Performers</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Top Referrer</h3>
              <p className="text-sm text-gray-600">{stats.topPerformer}</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Average Level</h3>
              <p className="text-sm text-gray-600">{stats.averageLevel.toFixed(1)}</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Total Bonus</h3>
              <p className="text-sm text-gray-600">${stats.totalBonus.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Referral List</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search referrals..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={levelFilter}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedReferrals.length === referrals.length && referrals.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sponsor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedReferrals.includes(referral.id)}
                      onChange={() => handleSelectReferral(referral.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{referral.memberName}</div>
                      <div className="text-sm text-gray-500">{referral.memberEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{referral.sponsorName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Level {referral.level}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{referral.totalReferrals}</div>
                    <div className="text-xs text-gray-500">Direct: {referral.directReferrals}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${referral.commissionEarned.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Bonus: ${referral.bonusEarned.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getRankColor(referral.rank)}`}>
                      {referral.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-green-600 hover:text-green-900">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferralTracker; 
