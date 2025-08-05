import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Target, Activity, Globe, PieChart, LineChart, BarChart, Calendar, Settings } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface AnalyticsData {
  memberStats: {
    totalMembers: number;
    newMembers: number;
    activeMembers: number;
    proMembers: number;
    leadershipMembers: number;
    inactiveMembers: number;
    growthRate: number;
  };
  financialStats: {
    totalEarnings: number;
    totalPayouts: number;
    pendingPayouts: number;
    averageEarnings: number;
    topEarner: string;
    topEarnings: number;
    monthlyGrowth: number;
  };
  matrixStats: {
    totalPositions: number;
    filledPositions: number;
    completionRate: number;
    averageLevel: number;
    cyclesCompleted: number;
    spilloverCount: number;
  };
  bonusStats: {
    totalBonuses: number;
    averageBonus: number;
    topBonusType: string;
    bonusDistribution: { [key: string]: number };
  };
  systemStats: {
    uptime: number;
    activeSessions: number;
    averageResponseTime: number;
    errorRate: number;
    lastBackup: string;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

const AnalyticsDashboard: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    memberStats: {
      totalMembers: 12500,
      newMembers: 450,
      activeMembers: 8900,
      proMembers: 3200,
      leadershipMembers: 850,
      inactiveMembers: 3600,
      growthRate: 12.5
    },
    financialStats: {
      totalEarnings: 2500000,
      totalPayouts: 1800000,
      pendingPayouts: 450000,
      averageEarnings: 200,
      topEarner: 'John Smith',
      topEarnings: 25000,
      monthlyGrowth: 8.3
    },
    matrixStats: {
      totalPositions: 100800,
      filledPositions: 45600,
      completionRate: 45.2,
      averageLevel: 3.8,
      cyclesCompleted: 1250,
      spilloverCount: 890
    },
    bonusStats: {
      totalBonuses: 15600,
      averageBonus: 160,
      topBonusType: 'Matrix Completion',
      bonusDistribution: {
        'Matrix Bonus': 45,
        'Referral Bonus': 25,
        'Matching Bonus': 15,
        'Cycle Bonus': 10,
        'Leadership Bonus': 5
      }
    },
    systemStats: {
      uptime: 99.8,
      activeSessions: 1250,
      averageResponseTime: 0.8,
      errorRate: 0.02,
      lastBackup: '2024-01-19 02:00:00'
    }
  });

  const [memberGrowthChart, setMemberGrowthChart] = useState<ChartData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'New Members',
      data: [120, 150, 180, 220, 280, 320, 380, 420, 450, 480, 520, 550],
      borderColor: '#3B82F6',
      fill: false
    }]
  });

  const [earningsChart, setEarningsChart] = useState<ChartData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Total Earnings',
      data: [180000, 210000, 240000, 280000, 320000, 360000, 400000, 440000, 480000, 520000, 560000, 600000],
      borderColor: '#10B981',
      fill: false
    }]
  });

  const [matrixCompletionChart, setMatrixCompletionChart] = useState<ChartData>({
    labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8'],
    datasets: [{
      label: 'Completions',
      data: [8500, 6200, 4200, 2800, 1800, 950, 480, 120],
      backgroundColor: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#1E293B', '#0F172A', '#020617', '#000000']
    }]
  });

  const [bonusDistributionChart, setBonusDistributionChart] = useState<ChartData>({
    labels: ['Matrix Bonus', 'Referral Bonus', 'Matching Bonus', 'Cycle Bonus', 'Leadership Bonus'],
    datasets: [{
      label: 'Bonus Distribution',
      data: [45, 25, 15, 10, 5],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    }]
  });

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time insights into MLM performance, member statistics, and system health
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Settings className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'members', name: 'Members', icon: Users },
                { id: 'financial', name: 'Financial', icon: DollarSign },
                { id: 'matrix', name: 'Matrix', icon: Target },
                { id: 'system', name: 'System', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.memberStats.totalMembers.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-1">
                      {getGrowthIcon(analyticsData.memberStats.growthRate)}
                      <span className={`text-sm font-medium ml-1 ${getGrowthColor(analyticsData.memberStats.growthRate)}`}>
                        {analyticsData.memberStats.growthRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {primaryCurrency} {analyticsData.financialStats.totalEarnings.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-1">
                      {getGrowthIcon(analyticsData.financialStats.monthlyGrowth)}
                      <span className={`text-sm font-medium ml-1 ${getGrowthColor(analyticsData.financialStats.monthlyGrowth)}`}>
                        {analyticsData.financialStats.monthlyGrowth}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Matrix Completion</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.matrixStats.completionRate}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analyticsData.matrixStats.filledPositions.toLocaleString()} / {analyticsData.matrixStats.totalPositions.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.systemStats.uptime}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analyticsData.systemStats.activeSessions} active sessions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Member growth chart</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Earnings trend chart</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium">{analyticsData.financialStats.topEarner}</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {primaryCurrency} {analyticsData.financialStats.topEarnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Sarah Johnson</span>
                    <span className="font-semibold">{primaryCurrency} 18,500</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Mike Davis</span>
                    <span className="font-semibold">{primaryCurrency} 15,200</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bonus Distribution</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Bonus distribution chart</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold">{analyticsData.systemStats.averageResponseTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="font-semibold">{analyticsData.systemStats.errorRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="font-semibold text-sm">{analyticsData.systemStats.lastBackup}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analyticsData.systemStats.uptime}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.memberStats.totalMembers.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.memberStats.activeMembers.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Pro Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.memberStats.proMembers.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Leadership</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.memberStats.leadershipMembers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth Chart</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Member growth visualization</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {primaryCurrency} {analyticsData.financialStats.totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {primaryCurrency} {analyticsData.financialStats.totalPayouts.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {primaryCurrency} {analyticsData.financialStats.pendingPayouts.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Avg Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {primaryCurrency} {analyticsData.financialStats.averageEarnings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Earnings trend visualization</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Matrix Tab */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Total Positions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.matrixStats.totalPositions.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Filled Positions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.matrixStats.filledPositions.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.matrixStats.completionRate}%
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Avg Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.matrixStats.averageLevel}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Matrix Completion by Level</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Matrix completion visualization</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.systemStats.uptime}%
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.systemStats.activeSessions.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.systemStats.averageResponseTime}s
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.systemStats.errorRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                    <span className="text-sm text-gray-600">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                    <span className="text-sm text-gray-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Network</span>
                    <span className="text-sm text-gray-600">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 
