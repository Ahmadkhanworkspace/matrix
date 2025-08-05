import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, LineChart, BarChart, TrendingUp, Target, Users, DollarSign, Activity, Filter, Download, Eye, Settings, X } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

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

interface VisualizationConfig {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  description: string;
  data: ChartData;
  isActive: boolean;
  refreshInterval: number;
}

const DataVisualization: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('charts');
  const [selectedChart, setSelectedChart] = useState<string>('');
  const [timeRange, setTimeRange] = useState('30d');
  const [visualizations, setVisualizations] = useState<VisualizationConfig[]>([
    {
      id: '1',
      name: 'Member Growth Trend',
      type: 'line',
      description: 'Monthly member growth over time',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'New Members',
          data: [120, 150, 180, 220, 280, 320, 380, 420, 450, 480, 520, 550],
          borderColor: '#3B82F6',
          fill: false
        }]
      },
      isActive: true,
      refreshInterval: 300000
    },
    {
      id: '2',
      name: 'Earnings Distribution',
      type: 'pie',
      description: 'Distribution of earnings by member type',
      data: {
        labels: ['Pro Members', 'Leadership', 'Active Members', 'New Members'],
        datasets: [{
          label: 'Earnings',
          data: [45, 25, 20, 10],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
        }]
      },
      isActive: true,
      refreshInterval: 600000
    },
    {
      id: '3',
      name: 'Matrix Completion by Level',
      type: 'bar',
      description: 'Matrix completion rates by level',
      data: {
        labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8'],
        datasets: [{
          label: 'Completions',
          data: [8500, 6200, 4200, 2800, 1800, 950, 480, 120],
          backgroundColor: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#1E293B', '#0F172A', '#020617', '#000000']
        }]
      },
      isActive: true,
      refreshInterval: 900000
    },
    {
      id: '4',
      name: 'Bonus Performance',
      type: 'doughnut',
      description: 'Bonus distribution by type',
      data: {
        labels: ['Matrix Bonus', 'Referral Bonus', 'Matching Bonus', 'Cycle Bonus', 'Leadership Bonus'],
        datasets: [{
          label: 'Bonus Amount',
          data: [45, 25, 15, 10, 5],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        }]
      },
      isActive: true,
      refreshInterval: 600000
    },
    {
      id: '5',
      name: 'System Performance',
      type: 'area',
      description: 'System performance metrics over time',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [{
          label: 'CPU Usage',
          data: [25, 30, 45, 60, 55, 40, 35],
          borderColor: '#3B82F6',
          fill: true
        }]
      },
      isActive: true,
      refreshInterval: 300000
    },
    {
      id: '6',
      name: 'Revenue Trend',
      type: 'line',
      description: 'Monthly revenue growth',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue',
          data: [180000, 210000, 240000, 280000, 320000, 360000, 400000, 440000, 480000, 520000, 560000, 600000],
          borderColor: '#10B981',
          fill: false
        }]
      },
      isActive: true,
      refreshInterval: 600000
    }
  ]);

  const [chartTypes] = useState([
    { id: 'line', name: 'Line Chart', icon: LineChart },
    { id: 'bar', name: 'Bar Chart', icon: BarChart },
    { id: 'pie', name: 'Pie Chart', icon: PieChart },
    { id: 'doughnut', name: 'Doughnut Chart', icon: PieChart },
    { id: 'area', name: 'Area Chart', icon: TrendingUp }
  ]);

  const [filters, setFilters] = useState({
    dateRange: '30d',
    memberType: 'all',
    currency: primaryCurrency,
    includeInactive: false
  });

  const handleToggleChart = (id: string) => {
    setVisualizations(visualizations.map(chart => 
      chart.id === id ? { ...chart, isActive: !chart.isActive } : chart
    ));
  };

  const handleRefreshChart = (id: string) => {
    // Simulate chart refresh
    console.log(`Refreshing chart: ${id}`);
  };

  const handleExportChart = (id: string) => {
    // Simulate chart export
    console.log(`Exporting chart: ${id}`);
  };

  const handleViewChart = (id: string) => {
    setSelectedChart(id);
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart className="h-4 w-4" />;
      case 'pie': return <PieChart className="h-4 w-4" />;
      case 'doughnut': return <PieChart className="h-4 w-4" />;
      case 'area': return <TrendingUp className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getChartColor = (type: string) => {
    switch (type) {
      case 'line': return 'text-blue-600';
      case 'bar': return 'text-green-600';
      case 'pie': return 'text-purple-600';
      case 'doughnut': return 'text-orange-600';
      case 'area': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                Data Visualization
              </h1>
              <p className="text-gray-600 mt-2">
                Interactive charts, graphs, and visual analytics for MLM data insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Settings className="h-4 w-4" />
                Chart Settings
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Type</label>
                <select
                  value={filters.memberType}
                  onChange={(e) => setFilters({...filters, memberType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Members</option>
                  <option value="new">New Members</option>
                  <option value="pro">Pro Members</option>
                  <option value="leadership">Leadership</option>
                </select>
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={filters.currency}
                  onChange={(e) => setFilters({...filters, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={primaryCurrency}>{primaryCurrency}</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeInactive"
                  checked={filters.includeInactive}
                  onChange={(e) => setFilters({...filters, includeInactive: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="includeInactive" className="ml-2 block text-sm text-gray-900">
                  Include Inactive
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'charts', name: 'Charts', icon: BarChart3 },
                { id: 'dashboards', name: 'Dashboards', icon: Target },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
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

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {visualizations.map((chart) => (
                <div key={chart.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getChartColor(chart.type).replace('text-', 'bg-').replace('-600', '-100')}`}>
                          {getChartIcon(chart.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{chart.name}</h3>
                          <p className="text-sm text-gray-600">{chart.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewChart(chart.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRefreshChart(chart.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Activity className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExportChart(chart.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleChart(chart.id)}
                          className={`${chart.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {chart.isActive ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                      <div className="text-center">
                        {getChartIcon(chart.type)}
                        <p className="text-gray-500 mt-2">{chart.name}</p>
                        <p className="text-xs text-gray-400">Chart visualization</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span>Refresh: {Math.round(chart.refreshInterval / 60000)}m</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        chart.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {chart.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboards Tab */}
        {activeTab === 'dashboards' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Analytics Dashboard</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Total Members</p>
                      <p className="text-2xl font-bold text-gray-900">12,500</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                      <p className="text-2xl font-bold text-gray-900">12.5%</p>
                    </div>
                  </div>
                  <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Member growth chart</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Dashboard</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">{primaryCurrency} 2.5M</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Avg Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">{primaryCurrency} 200</p>
                    </div>
                  </div>
                  <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Earnings chart</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Matrix Performance Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">45.2%</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Avg Level</p>
                  <p className="text-2xl font-bold text-gray-900">3.8</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Target className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Cycles Completed</p>
                  <p className="text-2xl font-bold text-gray-900">1,250</p>
                </div>
              </div>
              <div className="mt-6 h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Matrix performance chart</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Active Charts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visualizations.filter(v => v.isActive).length}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Data Points</p>
                  <p className="text-2xl font-bold text-gray-900">45,280</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Avg Refresh</p>
                  <p className="text-2xl font-bold text-gray-900">5m</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Views Today</p>
                  <p className="text-2xl font-bold text-gray-900">1,250</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Performance</h3>
                <div className="space-y-3">
                  {visualizations.slice(0, 5).map((chart) => (
                    <div key={chart.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getChartIcon(chart.type)}
                        <span className="ml-2 font-medium">{chart.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.floor(Math.random() * 1000)} views
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Member Database</span>
                    <span className="text-sm text-blue-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Financial Records</span>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Matrix System</span>
                    <span className="text-sm text-purple-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Bonus System</span>
                    <span className="text-sm text-orange-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Detail Modal */}
        {selectedChart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {visualizations.find(v => v.id === selectedChart)?.name}
                  </h3>
                  <button
                    onClick={() => setSelectedChart('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    {getChartIcon(visualizations.find(v => v.id === selectedChart)?.type || 'line')}
                    <p className="text-gray-500 mt-2">Full chart visualization</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handleExportChart(selectedChart)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Export Chart
                  </button>
                  <button
                    onClick={() => setSelectedChart('')}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualization; 
