import React, { useState, useEffect } from 'react';
import { Zap, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, DollarSign, Users, Target, Clock, Award } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface FastStartRule {
  id: string;
  name: string;
  description: string;
  bonusAmount: number;
  timeLimit: number; // in days
  requirements: string[];
  isActive: boolean;
  currency: string;
  minDirectReferrals: number;
  minTeamSize: number;
  matrixLevelRequired: number;
}

interface FastStartStats {
  totalPayouts: number;
  activeRules: number;
  qualifiedMembers: number;
  averageBonus: number;
  topPerformer: string;
  topBonus: number;
  successRate: number;
}

const FastStartBonusManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('rules');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<FastStartRule | null>(null);
  const [rules, setRules] = useState<FastStartRule[]>([
    {
      id: '1',
      name: '30-Day Matrix Completion',
      description: 'Complete matrix within 30 days of joining',
      bonusAmount: 250,
      timeLimit: 30,
      requirements: ['Complete Matrix Level 1', 'Have minimum 5 direct referrals'],
      isActive: true,
      currency: primaryCurrency,
      minDirectReferrals: 5,
      minTeamSize: 10,
      matrixLevelRequired: 1
    },
    {
      id: '2',
      name: '7-Day Quick Start',
      description: 'Achieve fast start within 7 days',
      bonusAmount: 500,
      timeLimit: 7,
      requirements: ['Complete Matrix Level 2', 'Have minimum 10 direct referrals'],
      isActive: true,
      currency: primaryCurrency,
      minDirectReferrals: 10,
      minTeamSize: 25,
      matrixLevelRequired: 2
    },
    {
      id: '3',
      name: 'First Week Performance',
      description: 'Outstanding performance in first week',
      bonusAmount: 100,
      timeLimit: 7,
      requirements: ['Complete registration', 'Have minimum 3 direct referrals'],
      isActive: true,
      currency: primaryCurrency,
      minDirectReferrals: 3,
      minTeamSize: 5,
      matrixLevelRequired: 1
    },
    {
      id: '4',
      name: 'Matrix Level 3 Rush',
      description: 'Complete Matrix Level 3 within 60 days',
      bonusAmount: 750,
      timeLimit: 60,
      requirements: ['Complete Matrix Level 3', 'Have minimum 15 direct referrals'],
      isActive: true,
      currency: primaryCurrency,
      minDirectReferrals: 15,
      minTeamSize: 50,
      matrixLevelRequired: 3
    }
  ]);

  const [stats, setStats] = useState<FastStartStats>({
    totalPayouts: 45000,
    activeRules: 4,
    qualifiedMembers: 180,
    averageBonus: 250,
    topPerformer: 'Alex Johnson',
    topBonus: 1500,
    successRate: 75
  });

  const [newRule, setNewRule] = useState<Partial<FastStartRule>>({
    name: '',
    description: '',
    bonusAmount: 0,
    timeLimit: 30,
    requirements: [''],
    isActive: true,
    currency: primaryCurrency,
    minDirectReferrals: 0,
    minTeamSize: 0,
    matrixLevelRequired: 1
  });

  const [recentQualifiers, setRecentQualifiers] = useState([
    {
      id: '1',
      name: 'Sarah Wilson',
      rule: '30-Day Matrix Completion',
      bonus: 250,
      qualifiedDate: '2024-01-15',
      status: 'Paid'
    },
    {
      id: '2',
      name: 'Mike Chen',
      rule: '7-Day Quick Start',
      bonus: 500,
      qualifiedDate: '2024-01-14',
      status: 'Pending'
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      rule: 'First Week Performance',
      bonus: 100,
      qualifiedDate: '2024-01-13',
      status: 'Paid'
    }
  ]);

  const handleSaveRule = () => {
    if (editingRule) {
      setRules(rules.map(rule => rule.id === editingRule.id ? { ...editingRule } : rule));
      setEditingRule(null);
    } else {
      const rule: FastStartRule = {
        ...newRule as FastStartRule,
        id: Date.now().toString()
      };
      setRules([...rules, rule]);
      setNewRule({
        name: '',
        description: '',
        bonusAmount: 0,
        timeLimit: 30,
        requirements: [''],
        isActive: true,
        currency: primaryCurrency,
        minDirectReferrals: 0,
        minTeamSize: 0,
        matrixLevelRequired: 1
      });
    }
    setShowModal(false);
  };

  const handleEditRule = (rule: FastStartRule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-600" />
                Fast Start Bonus Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage immediate bonuses for quick matrix completion and early performance
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Fast Start Rule
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {primaryCurrency} {stats.totalPayouts.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Qualified Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.qualifiedMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'rules', name: 'Fast Start Rules', icon: Zap },
                { id: 'qualifiers', name: 'Recent Qualifiers', icon: Award },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
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

        {/* Fast Start Rules Tab */}
        {activeTab === 'rules' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Fast Start Rules</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonus Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requirements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                          <div className="text-sm text-gray-500">{rule.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{rule.timeLimit} days</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {primaryCurrency} {rule.bonusAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Min Referrals: {rule.minDirectReferrals}</div>
                          <div>Min Team: {rule.minTeamSize}</div>
                          <div>Matrix Level: {rule.matrixLevelRequired}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditRule(rule)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className={`${rule.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {rule.isActive ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Qualifiers Tab */}
        {activeTab === 'qualifiers' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Qualifiers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonus Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualified Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentQualifiers.map((qualifier) => (
                    <tr key={qualifier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{qualifier.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{qualifier.rule}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {primaryCurrency} {qualifier.bonus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qualifier.qualifiedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          qualifier.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {qualifier.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="font-medium">{stats.topPerformer}</span>
                    </div>
                    <span className="font-semibold text-yellow-600">
                      {primaryCurrency} {stats.topBonus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Emma Davis</span>
                    <span className="font-semibold">{primaryCurrency} 1,200</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Carlos Rodriguez</span>
                    <span className="font-semibold">{primaryCurrency} 950</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Bonus</span>
                    <span className="font-semibold">{primaryCurrency} {stats.averageBonus}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold">{stats.successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Qualified Members</span>
                    <span className="font-semibold">{stats.qualifiedMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Payouts</span>
                    <span className="font-semibold">{primaryCurrency} {stats.totalPayouts.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingRule ? 'Edit Fast Start Rule' : 'Add New Fast Start Rule'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                    <input
                      type="text"
                      value={editingRule?.name || newRule.name}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, name: e.target.value})
                        : setNewRule({...newRule, name: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editingRule?.description || newRule.description}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, description: e.target.value})
                        : setNewRule({...newRule, description: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bonus Amount</label>
                    <input
                      type="number"
                      value={editingRule?.bonusAmount || newRule.bonusAmount}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, bonusAmount: parseInt(e.target.value) || 0})
                        : setNewRule({...newRule, bonusAmount: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (days)</label>
                    <input
                      type="number"
                      value={editingRule?.timeLimit || newRule.timeLimit}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, timeLimit: parseInt(e.target.value) || 0})
                        : setNewRule({...newRule, timeLimit: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Direct Referrals</label>
                    <input
                      type="number"
                      value={editingRule?.minDirectReferrals || newRule.minDirectReferrals}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, minDirectReferrals: parseInt(e.target.value) || 0})
                        : setNewRule({...newRule, minDirectReferrals: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Team Size</label>
                    <input
                      type="number"
                      value={editingRule?.minTeamSize || newRule.minTeamSize}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, minTeamSize: parseInt(e.target.value) || 0})
                        : setNewRule({...newRule, minTeamSize: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Matrix Level Required</label>
                    <input
                      type="number"
                      value={editingRule?.matrixLevelRequired || newRule.matrixLevelRequired}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, matrixLevelRequired: parseInt(e.target.value) || 1})
                        : setNewRule({...newRule, matrixLevelRequired: parseInt(e.target.value) || 1})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="8"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingRule(null);
                      setNewRule({
                        name: '',
                        description: '',
                        bonusAmount: 0,
                        timeLimit: 30,
                        requirements: [''],
                        isActive: true,
                        currency: primaryCurrency,
                        minDirectReferrals: 0,
                        minTeamSize: 0,
                        matrixLevelRequired: 1
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRule}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    {editingRule ? 'Update' : 'Create'}
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

export default FastStartBonusManager; 
