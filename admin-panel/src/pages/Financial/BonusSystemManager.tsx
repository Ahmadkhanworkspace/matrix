import React, { useState, useEffect } from 'react';
import { Award, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, DollarSign, Users, Target, Zap, Crown } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BonusRule {
  id: string;
  name: string;
  type: 'matrix' | 'referral' | 'matching' | 'cycle' | 'faststart' | 'leadership';
  description: string;
  percentage: number;
  conditions: string[];
  isActive: boolean;
  minRequirement: number;
  maxPayout: number;
  currency: string;
}

interface BonusStats {
  totalPayouts: number;
  activeRules: number;
  totalMembers: number;
  averageBonus: number;
  topEarner: string;
  topEarning: number;
}

const BonusSystemManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('rules');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<BonusRule | null>(null);
  const [rules, setRules] = useState<BonusRule[]>([
    {
      id: '1',
      name: 'Matrix Level 1 Bonus',
      type: 'matrix',
      description: 'Standard bonus for completing Matrix Level 1',
      percentage: 10,
      conditions: ['Complete Matrix Level 1', 'Have minimum 3 direct referrals'],
      isActive: true,
      minRequirement: 3,
      maxPayout: 1000,
      currency: primaryCurrency
    },
    {
      id: '2',
      name: 'Direct Referral Bonus',
      type: 'referral',
      description: 'Bonus for each direct referral',
      percentage: 5,
      conditions: ['Direct referral must be active', 'Referral must complete registration'],
      isActive: true,
      minRequirement: 1,
      maxPayout: 500,
      currency: primaryCurrency
    },
    {
      id: '3',
      name: 'Matching Bonus',
      type: 'matching',
      description: 'Percentage of direct referrals earnings',
      percentage: 3,
      conditions: ['Direct referral must earn bonus', 'Minimum team size of 5'],
      isActive: true,
      minRequirement: 5,
      maxPayout: 2000,
      currency: primaryCurrency
    },
    {
      id: '4',
      name: 'Cycle Completion Bonus',
      type: 'cycle',
      description: 'Bonus for completing matrix cycles',
      percentage: 50,
      conditions: ['Complete full matrix cycle', 'All positions filled'],
      isActive: true,
      minRequirement: 1,
      maxPayout: 5000,
      currency: primaryCurrency
    },
    {
      id: '5',
      name: 'Fast Start Bonus',
      type: 'faststart',
      description: 'Immediate bonus for quick matrix completion',
      percentage: 25,
      conditions: ['Complete matrix within 30 days', 'Minimum 10 direct referrals'],
      isActive: true,
      minRequirement: 10,
      maxPayout: 2500,
      currency: primaryCurrency
    },
    {
      id: '6',
      name: 'Leadership Rank Bonus',
      type: 'leadership',
      description: 'Bonus based on leadership rank',
      percentage: 15,
      conditions: ['Achieve leadership rank', 'Maintain minimum team size'],
      isActive: true,
      minRequirement: 20,
      maxPayout: 10000,
      currency: primaryCurrency
    }
  ]);

  const [stats, setStats] = useState<BonusStats>({
    totalPayouts: 125000,
    activeRules: 6,
    totalMembers: 2500,
    averageBonus: 50,
    topEarner: 'John Smith',
    topEarning: 2500
  });

  const [newRule, setNewRule] = useState<Partial<BonusRule>>({
    name: '',
    type: 'matrix',
    description: '',
    percentage: 0,
    conditions: [''],
    isActive: true,
    minRequirement: 0,
    maxPayout: 0,
    currency: primaryCurrency
  });

  const handleSaveRule = () => {
    if (editingRule) {
      setRules(rules.map(rule => rule.id === editingRule.id ? { ...editingRule } : rule));
      setEditingRule(null);
    } else {
      const rule: BonusRule = {
        ...newRule as BonusRule,
        id: Date.now().toString()
      };
      setRules([...rules, rule]);
      setNewRule({
        name: '',
        type: 'matrix',
        description: '',
        percentage: 0,
        conditions: [''],
        isActive: true,
        minRequirement: 0,
        maxPayout: 0,
        currency: primaryCurrency
      });
    }
    setShowModal(false);
  };

  const handleEditRule = (rule: BonusRule) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'matrix': return <Target className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      case 'matching': return <BarChart3 className="h-4 w-4" />;
      case 'cycle': return <Award className="h-4 w-4" />;
      case 'faststart': return <Zap className="h-4 w-4" />;
      case 'leadership': return <Crown className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'matrix': return 'bg-blue-100 text-blue-800';
      case 'referral': return 'bg-green-100 text-green-800';
      case 'matching': return 'bg-purple-100 text-purple-800';
      case 'cycle': return 'bg-orange-100 text-orange-800';
      case 'faststart': return 'bg-yellow-100 text-yellow-800';
      case 'leadership': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                <Award className="h-8 w-8 text-blue-600" />
                Bonus System Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and configure all bonus rules and payout structures
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Bonus Rule
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
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
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Bonus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {primaryCurrency} {stats.averageBonus}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'rules', name: 'Bonus Rules', icon: Award },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'settings', name: 'Settings', icon: Settings }
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

        {/* Bonus Rules Tab */}
        {activeTab === 'rules' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Bonus Rules</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Requirement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Payout
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(rule.type)}`}>
                          {getTypeIcon(rule.type)}
                          <span className="ml-1 capitalize">{rule.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.minRequirement}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {primaryCurrency} {rule.maxPayout}
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earners</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="font-medium">{stats.topEarner}</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {primaryCurrency} {stats.topEarning}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Sarah Johnson</span>
                    <span className="font-semibold">{primaryCurrency} 2,100</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Mike Davis</span>
                    <span className="font-semibold">{primaryCurrency} 1,850</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bonus Distribution</h3>
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getTypeIcon(rule.type)}
                        <span className="ml-2 text-sm">{rule.name}</span>
                      </div>
                      <span className="text-sm font-medium">{rule.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Bonus System Settings</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Global Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Currency
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="TRX">TRX</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Payout Threshold
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Notification Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bonusNotifications"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="bonusNotifications" className="ml-2 block text-sm text-gray-900">
                      Enable bonus notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="payoutNotifications"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="payoutNotifications" className="ml-2 block text-sm text-gray-900">
                      Enable payout notifications
                    </label>
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
                  {editingRule ? 'Edit Bonus Rule' : 'Add New Bonus Rule'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={editingRule?.type || newRule.type}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, type: e.target.value as any})
                        : setNewRule({...newRule, type: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="matrix">Matrix Bonus</option>
                      <option value="referral">Referral Bonus</option>
                      <option value="matching">Matching Bonus</option>
                      <option value="cycle">Cycle Bonus</option>
                      <option value="faststart">Fast Start Bonus</option>
                      <option value="leadership">Leadership Bonus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Percentage (%)</label>
                    <input
                      type="number"
                      value={editingRule?.percentage || newRule.percentage}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, percentage: parseFloat(e.target.value) || 0})
                        : setNewRule({...newRule, percentage: parseFloat(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Requirement</label>
                    <input
                      type="number"
                      value={editingRule?.minRequirement || newRule.minRequirement}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, minRequirement: parseInt(e.target.value) || 0})
                        : setNewRule({...newRule, minRequirement: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Payout</label>
                    <input
                      type="number"
                      value={editingRule?.maxPayout || newRule.maxPayout}
                      onChange={(e) => editingRule 
                        ? setEditingRule({...editingRule, maxPayout: parseInt(e.target.value) || 0})
                        : setNewRule({...newRule, maxPayout: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
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
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingRule(null);
                      setNewRule({
                        name: '',
                        type: 'matrix',
                        description: '',
                        percentage: 0,
                        conditions: [''],
                        isActive: true,
                        minRequirement: 0,
                        maxPayout: 0,
                        currency: primaryCurrency
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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

export default BonusSystemManager; 
