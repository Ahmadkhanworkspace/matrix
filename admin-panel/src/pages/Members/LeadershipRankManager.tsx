import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Users, Network, TrendingUp, BarChart3, Plus, Edit, Trash2, Download, Filter, Search, Eye, Settings, Crown, Target, Zap, DollarSign } from 'lucide-react';

interface LeadershipRank {
  id: string;
  name: string;
  level: number;
  requirements: RankRequirement[];
  benefits: RankBenefit[];
  qualificationPeriod: number; // in days
  isActive: boolean;
  color: string;
  icon: string;
  description: string;
}

interface RankRequirement {
  id: string;
  type: 'personal_sales' | 'team_sales' | 'direct_referrals' | 'team_size' | 'matrix_completion' | 'cycle_completion';
  value: number;
  description: string;
  isQualified: boolean;
}

interface RankBenefit {
  id: string;
  type: 'commission_bonus' | 'matching_bonus' | 'leadership_bonus' | 'override_commission' | 'residual_income' | 'special_rewards';
  value: number;
  description: string;
}

interface MemberRank {
  id: string;
  memberId: string;
  memberName: string;
  currentRank: string;
  rankLevel: number;
  qualificationDate: string;
  lastPromotionDate: string;
  nextRank: string;
  progressToNextRank: number;
  requirementsMet: number;
  totalRequirements: number;
  personalSales: number;
  teamSales: number;
  directReferrals: number;
  teamSize: number;
  matrixCompletions: number;
  cycleCompletions: number;
  totalEarnings: number;
  rankEarnings: number;
  isQualifiedForPromotion: boolean;
  promotionEligibleDate?: string;
}

const LeadershipRankManager: React.FC = () => {
  const [ranks, setRanks] = useState<LeadershipRank[]>([]);
  const [memberRanks, setMemberRanks] = useState<MemberRank[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRank, setSelectedRank] = useState<LeadershipRank | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberRank | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadRanks();
    loadMemberRanks();
  }, []);

  const loadRanks = async () => {
    setLoading(true);
    try {
      // API call to load leadership ranks
      // const response = await rankService.getLeadershipRanks();
      // setRanks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load leadership ranks:', error);
      setLoading(false);
    }
  };

  const loadMemberRanks = async () => {
    setLoading(true);
    try {
      // API call to load member ranks
      // const response = await rankService.getMemberRanks();
      // setMemberRanks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load member ranks:', error);
      setLoading(false);
    }
  };

  const createRank = async (rankData: Partial<LeadershipRank>) => {
    try {
      // API call to create rank
      // const response = await rankService.createRank(rankData);
      // await loadRanks();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create rank:', error);
    }
  };

  const promoteMember = async (memberId: string, newRank: string) => {
    try {
      // API call to promote member
      // await rankService.promoteMember(memberId, newRank);
      // await loadMemberRanks();
    } catch (error) {
      console.error('Failed to promote member:', error);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'diamond': return 'text-purple-600';
      case 'platinum': return 'text-blue-600';
      case 'gold': return 'text-yellow-600';
      case 'silver': return 'text-gray-600';
      case 'bronze': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankIcon = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'diamond': return Crown;
      case 'platinum': return Star;
      case 'gold': return Award;
      case 'silver': return Trophy;
      case 'bronze': return Target;
      default: return Trophy;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leadership Rank Manager</h1>
          <p className="text-gray-600">Manage leadership ranks and member promotions</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Create Rank
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white">
              <Crown className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ranks</p>
              <p className="text-2xl font-bold text-gray-900">{ranks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ranked Members</p>
              <p className="text-2xl font-bold text-gray-900">{memberRanks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promotion Eligible</p>
              <p className="text-2xl font-bold text-gray-900">
                {memberRanks.filter(member => member.isQualifiedForPromotion).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rank Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${memberRanks.reduce((sum, member) => sum + member.rankEarnings, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Ranks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Leadership Ranks</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ranks.map((rank) => {
              const Icon = getRankIcon(rank.name);
              return (
                <div key={rank.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${rank.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="ml-3 font-medium text-gray-900">{rank.name}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      rank.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rank.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{rank.description}</p>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Level:</span>
                      <span className="text-sm font-medium">{rank.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Requirements:</span>
                      <span className="text-sm font-medium">{rank.requirements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Benefits:</span>
                      <span className="text-sm font-medium">{rank.benefits.length}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button 
                      onClick={() => setSelectedRank(rank)}
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button className="text-sm text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Ranks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Member Ranks</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search members..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Ranks</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
                <option value="diamond">Diamond</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="eligible">Promotion Eligible</option>
                <option value="not_eligible">Not Eligible</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress to Next
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requirements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memberRanks.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.memberName}</div>
                      <div className="text-sm text-gray-500">ID: {member.memberId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getRankColor(member.currentRank)}`}>
                        {member.currentRank}
                      </span>
                      {member.isQualifiedForPromotion && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Eligible
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(member.progressToNextRank)}`}
                          style={{ width: `${member.progressToNextRank}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getProgressColor(member.progressToNextRank)}`}>
                        {member.progressToNextRank}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Next: {member.nextRank}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.requirementsMet}/{member.totalRequirements}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Personal: ${member.personalSales.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Team: ${member.teamSales.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${member.totalEarnings.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Rank: ${member.rankEarnings.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedMember(member)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {member.isQualifiedForPromotion && (
                        <button 
                          onClick={() => promoteMember(member.memberId, member.nextRank)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Promote
                        </button>
                      )}
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

export default LeadershipRankManager; 
