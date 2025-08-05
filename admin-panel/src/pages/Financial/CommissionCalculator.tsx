import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Users, TrendingUp, Settings, Save, RefreshCw, BarChart3, Target, Award, Zap } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CommissionStructure {
  matrixBonus: number;
  referralBonus: number;
  matchingBonus: number;
  cycleBonus: number;
  fastStartBonus: number;
  leadershipBonus: number;
}

interface CalculatorResult {
  totalEarnings: number;
  breakdown: {
    matrixBonus: number;
    referralBonus: number;
    matchingBonus: number;
    cycleBonus: number;
    fastStartBonus: number;
    leadershipBonus: number;
  };
  projections: {
    monthly: number;
    yearly: number;
  };
}

const CommissionCalculator: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('calculator');
  const [commissionStructure, setCommissionStructure] = useState<CommissionStructure>({
    matrixBonus: 10,
    referralBonus: 5,
    matchingBonus: 3,
    cycleBonus: 50,
    fastStartBonus: 25,
    leadershipBonus: 15
  });
  
  const [calculatorInputs, setCalculatorInputs] = useState({
    matrixLevel: 1,
    directReferrals: 0,
    teamSize: 0,
    cyclesCompleted: 0,
    leadershipRank: 'None',
    fastStartQualified: false
  });
  
  const [results, setResults] = useState<CalculatorResult | null>(null);
  const [savedStructures, setSavedStructures] = useState<CommissionStructure[]>([]);

  const calculateCommissions = () => {
    const { matrixLevel, directReferrals, teamSize, cyclesCompleted, leadershipRank, fastStartQualified } = calculatorInputs;
    
    // Calculate matrix bonus based on level and team size
    const matrixBonusEarnings = (matrixLevel * commissionStructure.matrixBonus) * (teamSize / 10);
    
    // Calculate referral bonus
    const referralBonusEarnings = directReferrals * commissionStructure.referralBonus;
    
    // Calculate matching bonus (percentage of direct referrals' earnings)
    const matchingBonusEarnings = referralBonusEarnings * (commissionStructure.matchingBonus / 100);
    
    // Calculate cycle completion bonus
    const cycleBonusEarnings = cyclesCompleted * commissionStructure.cycleBonus;
    
    // Calculate fast start bonus
    const fastStartBonusEarnings = fastStartQualified ? commissionStructure.fastStartBonus : 0;
    
    // Calculate leadership bonus based on rank
    const leadershipMultiplier = {
      'None': 0,
      'Bronze': 1,
      'Silver': 2,
      'Gold': 3,
      'Platinum': 4,
      'Diamond': 5
    }[leadershipRank] || 0;
    const leadershipBonusEarnings = (teamSize * commissionStructure.leadershipBonus * leadershipMultiplier) / 100;
    
    const totalEarnings = matrixBonusEarnings + referralBonusEarnings + matchingBonusEarnings + 
                         cycleBonusEarnings + fastStartBonusEarnings + leadershipBonusEarnings;
    
    const result: CalculatorResult = {
      totalEarnings,
      breakdown: {
        matrixBonus: matrixBonusEarnings,
        referralBonus: referralBonusEarnings,
        matchingBonus: matchingBonusEarnings,
        cycleBonus: cycleBonusEarnings,
        fastStartBonus: fastStartBonusEarnings,
        leadershipBonus: leadershipBonusEarnings
      },
      projections: {
        monthly: totalEarnings * 4,
        yearly: totalEarnings * 48
      }
    };
    
    setResults(result);
  };

  const saveStructure = () => {
    const newStructure = { ...commissionStructure, id: Date.now() };
    setSavedStructures([...savedStructures, newStructure]);
  };

  const loadStructure = (structure: CommissionStructure) => {
    setCommissionStructure(structure);
  };

  useEffect(() => {
    calculateCommissions();
  }, [calculatorInputs, commissionStructure]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calculator className="h-8 w-8 text-blue-600" />
                Commission Calculator
              </h1>
              <p className="text-gray-600 mt-2">
                Calculate potential earnings based on matrix performance and bonus structures
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveStructure}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Structure
              </button>
              <button
                onClick={() => setCalculatorInputs({
                  matrixLevel: 1,
                  directReferrals: 0,
                  teamSize: 0,
                  cyclesCompleted: 0,
                  leadershipRank: 'None',
                  fastStartQualified: false
                })}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'calculator', name: 'Calculator', icon: Calculator },
                { id: 'structure', name: 'Bonus Structure', icon: Settings },
                { id: 'saved', name: 'Saved Structures', icon: Save }
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

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Inputs</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Matrix Level
                    </label>
                    <select
                      value={calculatorInputs.matrixLevel}
                      onChange={(e) => setCalculatorInputs({
                        ...calculatorInputs,
                        matrixLevel: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                        <option key={level} value={level}>Level {level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Direct Referrals
                    </label>
                    <input
                      type="number"
                      value={calculatorInputs.directReferrals}
                      onChange={(e) => setCalculatorInputs({
                        ...calculatorInputs,
                        directReferrals: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size
                    </label>
                    <input
                      type="number"
                      value={calculatorInputs.teamSize}
                      onChange={(e) => setCalculatorInputs({
                        ...calculatorInputs,
                        teamSize: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cycles Completed
                    </label>
                    <input
                      type="number"
                      value={calculatorInputs.cyclesCompleted}
                      onChange={(e) => setCalculatorInputs({
                        ...calculatorInputs,
                        cyclesCompleted: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leadership Rank
                    </label>
                    <select
                      value={calculatorInputs.leadershipRank}
                      onChange={(e) => setCalculatorInputs({
                        ...calculatorInputs,
                        leadershipRank: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="None">None</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Diamond">Diamond</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fastStart"
                      checked={calculatorInputs.fastStartQualified}
                      onChange={(e) => setCalculatorInputs({
                        ...calculatorInputs,
                        fastStartQualified: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="fastStart" className="ml-2 block text-sm text-gray-900">
                      Fast Start Qualified
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {results && (
                <div className="space-y-6">
                  {/* Total Earnings Card */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Total Earnings</h3>
                        <p className="text-3xl font-bold mt-2">
                          {primaryCurrency} {results.totalEarnings.toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="h-12 w-12 text-blue-200" />
                    </div>
                  </div>

                  {/* Breakdown Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(results.breakdown).map(([key, value]) => (
                      <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <p className="text-xl font-semibold text-gray-900 mt-1">
                              {primaryCurrency} {value.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {((value / results.totalEarnings) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Projections */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Projections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Monthly Projection</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {primaryCurrency} {results.projections.monthly.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Yearly Projection</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {primaryCurrency} {results.projections.yearly.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bonus Structure Tab */}
        {activeTab === 'structure' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Commission Structure Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(commissionStructure).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()} (%)
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setCommissionStructure({
                      ...commissionStructure,
                      [key]: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Structures Tab */}
        {activeTab === 'saved' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Saved Commission Structures</h3>
            
            {savedStructures.length === 0 ? (
              <div className="text-center py-8">
                <Save className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No saved structures yet. Save a structure from the Bonus Structure tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedStructures.map((structure, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Structure {index + 1}</h4>
                      <button
                        onClick={() => loadStructure(structure)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Load
                      </button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {Object.entries(structure).filter(([key]) => key !== 'id').map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span>{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionCalculator; 
