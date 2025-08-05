import React, { useState, useEffect } from 'react';
import { Network, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, DollarSign, Users, Layers } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface MatrixConfig {
  id: string;
  name: string;
  fee: number;
  matrixtype: number; // 1 = Regular Forced Matrix, 2 = Company Forced Matrix
  levels: number; // Matrix Depth
  forcedmatrix: number; // Matrix Width
  payouttype: number; // 1 = Complete Cycle, 2 = Per Member Per Level, 3 = Completing each Level
  matrixbonus: number; // Complete Matrix Bonus
  matchingbonus: number; // Matching Bonus
  refbonus: number; // Referral Bonus
  refbonuspaid: number; // 1 = Purchase of Position, 2 = Purchase & Re-entry
  textcreditsentry: number; // Text Ad Credits on Entry
  bannercreditsentry: number; // Banner Ad Credits on Entry
  textcreditscycle: number; // Text Ad Credits on Cycling
  bannercreditscycle: number; // Banner Ad Credits on Cycling
  reentry: number; // Auto Re-entry (0 = No, 1 = Yes)
  reentrynum: number; // Number of re-entries
  welcomemail: number; // Send Welcome Email (0 = No, 1 = Yes)
  cyclemail: number; // Send Cycle Notification Email (0 = No, 1 = Yes)
  cyclemailsponsor: number; // Send Matching Bonus Email (0 = No, 1 = Yes)
  eformat1: number; // Welcome Email Format (1 = Text, 2 = HTML)
  eformat2: number; // Cycle Email Format (1 = Text, 2 = HTML)
  eformat3: number; // Matching Bonus Email Format (1 = Text, 2 = HTML)
  subject1: string;
  subject2: string;
  subject3: string;
  message1: string;
  message2: string;
  message3: string;
  bonusdownloads: string;
  // Level bonuses for Per Member Per Level (payouttype = 2)
  level1: number, level2: number, level3: number, level4: number, level5: number;
  level6: number, level7: number, level8: number, level9: number, level10: number;
  level1m: number, level2m: number, level3m: number, level4m: number, level5m: number;
  level6m: number, level7m: number, level8m: number, level9m: number, level10m: number;
  // Level bonuses for Completing each Level (payouttype = 3)
  level1c: number, level2c: number, level3c: number, level4c: number, level5c: number;
  level6c: number, level7c: number, level8c: number, level9c: number, level10c: number;
  level1cm: number, level2cm: number, level3cm: number, level4cm: number, level5cm: number;
  level6cm: number, level7cm: number, level8cm: number, level9cm: number, level10cm: number;
  // Matrix entry options (up to 5 other matrices)
  entry1: number, entry1num: number, matrixid1: number;
  entry2: number, entry2num: number, matrixid2: number;
  entry3: number, entry3num: number, matrixid3: number;
  entry4: number, entry4num: number, matrixid4: number;
  entry5: number, entry5num: number, matrixid5: number;
  createdAt: string;
  updatedAt: string;
}

const MatrixSettings: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [matrices, setMatrices] = useState<MatrixConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState<MatrixConfig | null>(null);
  const [selectedMatrix, setSelectedMatrix] = useState<MatrixConfig | null>(null);
  const [newMatrix, setNewMatrix] = useState<Partial<MatrixConfig>>({
    name: '',
    fee: 0,
    matrixtype: 1, // 1 = Regular Forced Matrix, 2 = Company Forced Matrix
    levels: 3, // Matrix Depth
    forcedmatrix: 3, // Matrix Width
    payouttype: 1, // 1 = Complete Cycle, 2 = Per Member Per Level, 3 = Completing each Level
    matrixbonus: 0, // Complete Matrix Bonus
    matchingbonus: 0, // Matching Bonus
    refbonus: 0, // Referral Bonus
    refbonuspaid: 1, // 1 = Purchase of Position, 2 = Purchase & Re-entry
    textcreditsentry: 0, // Text Ad Credits on Entry
    bannercreditsentry: 0, // Banner Ad Credits on Entry
    textcreditscycle: 0, // Text Ad Credits on Cycling
    bannercreditscycle: 0, // Banner Ad Credits on Cycling
    reentry: 0, // Auto Re-entry (0 = No, 1 = Yes)
    reentrynum: 1, // Number of re-entries
    welcomemail: 1, // Send Welcome Email (0 = No, 1 = Yes)
    cyclemail: 1, // Send Cycle Notification Email (0 = No, 1 = Yes)
    cyclemailsponsor: 1, // Send Matching Bonus Email (0 = No, 1 = Yes)
    eformat1: 1, // Welcome Email Format (1 = Text, 2 = HTML)
    eformat2: 1, // Cycle Email Format (1 = Text, 2 = HTML)
    eformat3: 1, // Matching Bonus Email Format (1 = Text, 2 = HTML)
    subject1: 'Welcome to {matrix} board!',
    subject2: 'Congratulation,You had completed the {matrix}!',
    subject3: 'Congratulation,You have earned the matching bonus from {matrix}!',
    message1: 'Dear member,\n\nWelcome to {matrix} board.\nYou can start promoting your account so that you can earn from this matrix!\nIf you further need any help feel free to contact us.\n\nAdministrator\n{sitename}',
    message2: 'Dear {name},\n\nCongratulations you had completed the {matrix} and earned TRX 5 and you have also got a re-entry in the matrix.\n\nAdministrator\n{sitename}\n{siteurl}',
    message3: 'Dear {name},\n\nCongratulations your referrals {refname} have completed the matrix and you earned TRX 500 as matching bonus.\n\nAdministrator\n{sitename}\n{siteurl}',
    bonusdownloads: '10,000 Banner Impressions and 10,000 Text Ad Impressions (TRX 500 Value) -- <a href=https://www.maxviralmarketing.com/specialjoin.php target=_blank>Click to Get</a>.\n\nLifetime Pro Membership to 7DayPromos.com ($19 Value) -- <a href=http://www.7daypromos.com/bonusprojoin.php target=_blank>Click to Get</a>.',
    // Level bonuses for Per Member Per Level (payouttype = 2)
    level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
    level6: 0, level7: 0, level8: 0, level9: 0, level10: 0,
    level1m: 0, level2m: 0, level3m: 0, level4m: 0, level5m: 0,
    level6m: 0, level7m: 0, level8m: 0, level9m: 0, level10m: 0,
    // Level bonuses for Completing each Level (payouttype = 3)
    level1c: 0, level2c: 0, level3c: 0, level4c: 0, level5c: 0,
    level6c: 0, level7c: 0, level8c: 0, level9c: 0, level10c: 0,
    level1cm: 0, level2cm: 0, level3cm: 0, level4cm: 0, level5cm: 0,
    level6cm: 0, level7cm: 0, level8cm: 0, level9cm: 0, level10cm: 0,
    // Matrix entry options (up to 5 other matrices)
    entry1: 0, entry1num: 0, matrixid1: 0,
    entry2: 0, entry2num: 0, matrixid2: 0,
    entry3: 0, entry3num: 0, matrixid3: 0,
    entry4: 0, entry4num: 0, matrixid4: 0,
    entry5: 0, entry5num: 0, matrixid5: 0
  });

  useEffect(() => {
    loadMatrices();
  }, []);

  const loadMatrices = async () => {
    setLoading(true);
    try {
      // API call to load matrix configurations
      // const response = await matrixService.getMatrixConfigs();
      // setMatrices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load matrix configurations:', error);
      setLoading(false);
    }
  };

  const createMatrix = async () => {
    try {
      // API call to create matrix
      // const response = await matrixService.createMatrix(newMatrix);
      // await loadMatrices();
      setShowCreateModal(false);
      setNewMatrix({
        name: '',
        fee: 0,
        matrixtype: 1,
        levels: 3,
        forcedmatrix: 3,
        payouttype: 1,
        matrixbonus: 0,
        matchingbonus: 0,
        refbonus: 0,
        refbonuspaid: 1,
        textcreditsentry: 0,
        bannercreditsentry: 0,
        textcreditscycle: 0,
        bannercreditscycle: 0,
        reentry: 0,
        reentrynum: 1,
        welcomemail: 1,
        cyclemail: 1,
        cyclemailsponsor: 1,
        eformat1: 1,
        eformat2: 1,
        eformat3: 1,
        subject1: 'Welcome to {matrix} board!',
        subject2: 'Congratulation,You had completed the {matrix}!',
        subject3: 'Congratulation,You have earned the matching bonus from {matrix}!',
        message1: 'Dear member,\n\nWelcome to {matrix} board.\nYou can start promoting your account so that you can earn from this matrix!\nIf you further need any help feel free to contact us.\n\nAdministrator\n{sitename}',
        message2: 'Dear {name},\n\nCongratulations you had completed the {matrix} and earned TRX 5 and you have also got a re-entry in the matrix.\n\nAdministrator\n{sitename}\n{siteurl}',
        message3: 'Dear {name},\n\nCongratulations your referrals {refname} have completed the matrix and you earned TRX 500 as matching bonus.\n\nAdministrator\n{sitename}\n{siteurl}',
        bonusdownloads: '10,000 Banner Impressions and 10,000 Text Ad Impressions (TRX 500 Value) -- <a href=https://www.maxviralmarketing.com/specialjoin.php target=_blank>Click to Get</a>.\n\nLifetime Pro Membership to 7DayPromos.com ($19 Value) -- <a href=http://www.7daypromos.com/bonusprojoin.php target=_blank>Click to Get</a>.',
        level1: 0, level2: 0, level3: 0, level4: 0, level5: 0,
        level6: 0, level7: 0, level8: 0, level9: 0, level10: 0,
        level1m: 0, level2m: 0, level3m: 0, level4m: 0, level5m: 0,
        level6m: 0, level7m: 0, level8m: 0, level9m: 0, level10m: 0,
        level1c: 0, level2c: 0, level3c: 0, level4c: 0, level5c: 0,
        level6c: 0, level7c: 0, level8c: 0, level9c: 0, level10c: 0,
        level1cm: 0, level2cm: 0, level3cm: 0, level4cm: 0, level5cm: 0,
        level6cm: 0, level7cm: 0, level8cm: 0, level9cm: 0, level10cm: 0,
        entry1: 0, entry1num: 0, matrixid1: 0,
        entry2: 0, entry2num: 0, matrixid2: 0,
        entry3: 0, entry3num: 0, matrixid3: 0,
        entry4: 0, entry4num: 0, matrixid4: 0,
        entry5: 0, entry5num: 0, matrixid5: 0
      });
    } catch (error) {
      console.error('Failed to create matrix:', error);
    }
  };

  const updateMatrix = async (matrixId: string, matrixData: Partial<MatrixConfig>) => {
    try {
      // API call to update matrix
      // await matrixService.updateMatrix(matrixId, matrixData);
      // await loadMatrices();
      setEditingMatrix(null);
    } catch (error) {
      console.error('Failed to update matrix:', error);
    }
  };

  const deleteMatrix = async (matrixId: string) => {
    try {
      // API call to delete matrix
      // await matrixService.deleteMatrix(matrixId);
      // await loadMatrices();
    } catch (error) {
      console.error('Failed to delete matrix:', error);
    }
  };

  const toggleMatrixStatus = async (matrixId: string, isActive: boolean) => {
    try {
      // API call to toggle matrix status
      // await matrixService.toggleMatrixStatus(matrixId, isActive);
      // await loadMatrices();
    } catch (error) {
      console.error('Failed to toggle matrix status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matrix Settings</h1>
          <p className="text-gray-600">Configure matrix structures and parameters</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Create Matrix
          </button>
        </div>
      </div>

      {/* Matrix Configurations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Matrix Configurations</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matrices.map((matrix) => (
              <div key={matrix.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-500 text-white">
                      <Network className="h-4 w-4" />
                    </div>
                    <h3 className="ml-3 font-medium text-gray-900">{matrix.name}</h3>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {matrix.matrixtype === 1 ? 'Regular Forced Matrix' : 'Company Forced Matrix'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium ml-1">{matrix.levels}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium ml-1">{matrix.forcedmatrix} x {matrix.levels}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium ml-1">{primaryCurrency} {matrix.fee}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bonus:</span>
                      <span className="font-medium ml-1">TRX {matrix.matrixbonus}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payout Type:</span>
                    <span className="font-medium">
                      {matrix.payouttype === 1 ? 'Complete Cycle' : 
                       matrix.payouttype === 2 ? 'Per Member Per Level' : 'Completing each Level'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Referral Bonus:</span>
                    <span className="font-medium">TRX {matrix.refbonus}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button 
                    onClick={() => setEditingMatrix(matrix)}
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setSelectedMatrix(matrix)}
                    className="text-sm text-green-600 hover:text-green-900"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => toggleMatrixStatus(matrix.id, true)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Disable
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <Network className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Matrices</p>
              <p className="text-2xl font-bold text-gray-900">{matrices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Matrices</p>
              <p className="text-2xl font-bold text-gray-900">
                {matrices.length}
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
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {primaryCurrency} {matrices.reduce((sum, matrix) => sum + matrix.fee, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bonuses</p>
              <p className="text-2xl font-bold text-gray-900">
                {primaryCurrency} {matrices.reduce((sum, matrix) => sum + matrix.matrixbonus, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Details Modal */}
      {selectedMatrix && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Matrix Details</h3>
              <button 
                onClick={() => setSelectedMatrix(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedMatrix.name}</div>
                    <div><span className="font-medium">Level:</span> {selectedMatrix.levels}</div>
                    <div><span className="font-medium">Size:</span> {selectedMatrix.forcedmatrix} x {selectedMatrix.levels}</div>
                    <div><span className="font-medium">Price:</span> {primaryCurrency} {selectedMatrix.fee}</div>
                    <div><span className="font-medium">Type:</span> {selectedMatrix.matrixtype === 1 ? 'Regular Forced Matrix' : 'Company Forced Matrix'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Financial Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Matrix Bonus:</span> {primaryCurrency} {selectedMatrix.matrixbonus}</div>
                    <div><span className="font-medium">Matching Bonus:</span> {primaryCurrency} {selectedMatrix.matchingbonus}</div>
                    <div><span className="font-medium">Referral Bonus:</span> {primaryCurrency} {selectedMatrix.refbonus}</div>
                    <div><span className="font-medium">Payout Type:</span> {
                      selectedMatrix.payouttype === 1 ? 'Complete Cycle' : 
                      selectedMatrix.payouttype === 2 ? 'Per Member Per Level' : 'Completing each Level'
                    }</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bonus Credits</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Text Ad Credits (Entry):</span> {selectedMatrix.textcreditsentry}</div>
                  <div><span className="font-medium">Banner Ad Credits (Entry):</span> {selectedMatrix.bannercreditsentry}</div>
                  <div><span className="font-medium">Text Ad Credits (Cycle):</span> {selectedMatrix.textcreditscycle}</div>
                  <div><span className="font-medium">Banner Ad Credits (Cycle):</span> {selectedMatrix.bannercreditscycle}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Email Settings</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Welcome Email:</span> {selectedMatrix.welcomemail === 1 ? 'Enabled' : 'Disabled'}</div>
                  <div><span className="font-medium">Cycle Notification:</span> {selectedMatrix.cyclemail === 1 ? 'Enabled' : 'Disabled'}</div>
                  <div><span className="font-medium">Matching Bonus Email:</span> {selectedMatrix.cyclemailsponsor === 1 ? 'Enabled' : 'Disabled'}</div>
                  <div><span className="font-medium">Auto Re-entry:</span> {selectedMatrix.reentry === 1 ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Matrix Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Matrix</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Name</label>
                  <input
                    type="text"
                    value={newMatrix.name}
                    onChange={(e) => setNewMatrix({...newMatrix, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter matrix name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Membership Fee ({primaryCurrency})</label>
                  <input
                    type="number"
                    value={newMatrix.fee}
                    onChange={(e) => setNewMatrix({...newMatrix, fee: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Type</label>
                  <select
                    value={newMatrix.matrixtype}
                    onChange={(e) => setNewMatrix({...newMatrix, matrixtype: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Regular Forced Matrix</option>
                    <option value={2}>Company Forced Matrix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Depth</label>
                  <input
                    type="number"
                    value={newMatrix.levels}
                    onChange={(e) => setNewMatrix({...newMatrix, levels: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Width</label>
                  <input
                    type="number"
                    value={newMatrix.forcedmatrix}
                    onChange={(e) => setNewMatrix({...newMatrix, forcedmatrix: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payout Type</label>
                  <select
                    value={newMatrix.payouttype}
                    onChange={(e) => setNewMatrix({...newMatrix, payouttype: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Payout on Complete Cycle</option>
                    <option value={2}>Payout on Per Member Per Level</option>
                    <option value={3}>Payout on Completing each Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Bonus ({primaryCurrency})</label>
                  <input
                    type="number"
                    value={newMatrix.matrixbonus}
                    onChange={(e) => setNewMatrix({...newMatrix, matrixbonus: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matching Bonus ({primaryCurrency})</label>
                  <input
                    type="number"
                    value={newMatrix.matchingbonus}
                    onChange={(e) => setNewMatrix({...newMatrix, matchingbonus: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Bonus ({primaryCurrency})</label>
                  <input
                    type="number"
                    value={newMatrix.refbonus}
                    onChange={(e) => setNewMatrix({...newMatrix, refbonus: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Bonus Paid On</label>
                  <select
                    value={newMatrix.refbonuspaid}
                    onChange={(e) => setNewMatrix({...newMatrix, refbonuspaid: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Purchase of Position</option>
                    <option value={2}>Purchase & Re-entry of Position & Entry from other positions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Ad Credits (Entry)</label>
                  <input
                    type="number"
                    value={newMatrix.textcreditsentry}
                    onChange={(e) => setNewMatrix({...newMatrix, textcreditsentry: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Ad Credits (Entry)</label>
                  <input
                    type="number"
                    value={newMatrix.bannercreditsentry}
                    onChange={(e) => setNewMatrix({...newMatrix, bannercreditsentry: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Ad Credits (Cycle)</label>
                  <input
                    type="number"
                    value={newMatrix.textcreditscycle}
                    onChange={(e) => setNewMatrix({...newMatrix, textcreditscycle: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Ad Credits (Cycle)</label>
                  <input
                    type="number"
                    value={newMatrix.bannercreditscycle}
                    onChange={(e) => setNewMatrix({...newMatrix, bannercreditscycle: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auto Re-entry</label>
                  <select
                    value={newMatrix.reentry}
                    onChange={(e) => setNewMatrix({...newMatrix, reentry: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Re-entries</label>
                  <input
                    type="number"
                    value={newMatrix.reentrynum}
                    onChange={(e) => setNewMatrix({...newMatrix, reentrynum: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Email Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send Welcome Email</label>
                    <select
                      value={newMatrix.welcomemail}
                      onChange={(e) => setNewMatrix({...newMatrix, welcomemail: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send Cycle Notification</label>
                    <select
                      value={newMatrix.cyclemail}
                      onChange={(e) => setNewMatrix({...newMatrix, cyclemail: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send Matching Bonus Email</label>
                    <select
                      value={newMatrix.cyclemailsponsor}
                      onChange={(e) => setNewMatrix({...newMatrix, cyclemailsponsor: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createMatrix}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Create Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixSettings; 
