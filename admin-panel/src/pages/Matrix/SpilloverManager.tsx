import React, { useState, useEffect } from 'react';
import { Network, ArrowDown, ArrowUp, Users, TrendingUp, BarChart3, Plus, Edit, Trash2, Download, Filter, Search, Eye, Settings, RefreshCw, Target, Activity, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface SpilloverEvent {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  matrixLevel: number;
  matrixName: string;
  position: number;
  spilloverDate: string;
  status: 'pending' | 'completed' | 'cancelled' | 'rejected';
  commissionEarned: number;
  bonusEarned: number;
  spilloverType: 'automatic' | 'manual' | 'forced';
  reason?: string;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
}

interface SpilloverRule {
  id: string;
  matrixLevel: number;
  matrixName: string;
  spilloverType: 'automatic' | 'manual' | 'forced';
  conditions: string[];
  commissionPercentage: number;
  bonusPercentage: number;
  isActive: boolean;
  priority: number;
  timeLimit: number; // in hours
  maxSpilloversPerDay: number;
}

const SpilloverManager: React.FC = () => {
  const [spilloverEvents, setSpilloverEvents] = useState<SpilloverEvent[]>([]);
  const [spilloverRules, setSpilloverRules] = useState<SpilloverRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SpilloverEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [matrixFilter, setMatrixFilter] = useState<string>('all');

  useEffect(() => {
    loadSpilloverEvents();
    loadSpilloverRules();
  }, []);

  const loadSpilloverEvents = async () => {
    setLoading(true);
    try {
      // API call to load spillover events
      // const response = await spilloverService.getSpilloverEvents();
      // setSpilloverEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load spillover events:', error);
      setLoading(false);
    }
  };

  const loadSpilloverRules = async () => {
    setLoading(true);
    try {
      // API call to load spillover rules
      // const response = await spilloverService.getSpilloverRules();
      // setSpilloverRules(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load spillover rules:', error);
      setLoading(false);
    }
  };

  const createSpilloverEvent = async (eventData: Partial<SpilloverEvent>) => {
    try {
      // API call to create spillover event
      // const response = await spilloverService.createSpilloverEvent(eventData);
      // await loadSpilloverEvents();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create spillover event:', error);
    }
  };

  const processSpillover = async (eventId: string, action: 'approve' | 'reject') => {
    try {
      // API call to process spillover
      // await spilloverService.processSpillover(eventId, action);
      // await loadSpilloverEvents();
    } catch (error) {
      console.error('Failed to process spillover:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'automatic': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-purple-100 text-purple-800';
      case 'forced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spillover Manager</h1>
          <p className="text-gray-600">Manage matrix spillover events and rules</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Create Spillover
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
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <ArrowDown className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spillovers</p>
              <p className="text-2xl font-bold text-gray-900">{spilloverEvents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {spilloverEvents.filter(event => event.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {spilloverEvents.filter(event => event.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${spilloverEvents.reduce((sum, event) => sum + event.commissionEarned + event.bonusEarned, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spillover Rules */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Spillover Rules</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spilloverRules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{rule.matrixName}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(rule.spilloverType)}`}>
                    {rule.spilloverType}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Level:</span>
                    <span className="text-sm font-medium">{rule.matrixLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Commission:</span>
                    <span className="text-sm font-medium">{rule.commissionPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bonus:</span>
                    <span className="text-sm font-medium">{rule.bonusPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Limit:</span>
                    <span className="text-sm font-medium">{rule.timeLimit}h</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button className="text-sm text-blue-600 hover:text-blue-900">Edit</button>
                  <button className="text-sm text-red-600 hover:text-red-900">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spillover Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Spillover Events</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="forced">Forced</option>
              </select>
              <select
                value={matrixFilter}
                onChange={(e) => setMatrixFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Matrices</option>
                <option value="starter">Starter Matrix</option>
                <option value="basic">Basic Matrix</option>
                <option value="advanced">Advanced Matrix</option>
                <option value="master">Master Matrix</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {spilloverEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.fromMemberName}</div>
                      <div className="text-sm text-gray-500">ID: {event.fromMemberId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.toMemberName}</div>
                      <div className="text-sm text-gray-500">ID: {event.toMemberId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.matrixName}</div>
                    <div className="text-xs text-gray-500">Position #{event.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(event.spilloverType)}`}>
                      {event.spilloverType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${(event.commissionEarned + event.bonusEarned).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Comm: ${event.commissionEarned.toFixed(2)} | Bonus: ${event.bonusEarned.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedEvent(event)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {event.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => processSpillover(event.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => processSpillover(event.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
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

export default SpilloverManager; 
