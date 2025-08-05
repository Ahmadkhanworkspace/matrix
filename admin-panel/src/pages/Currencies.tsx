import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const Currencies: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: currencies, isLoading, error } = useQuery(
    'currencies',
    adminService.getCurrencies
  );

  const toggleCurrencyMutation = useMutation(
    (currencyId: string) => adminService.toggleCurrencyStatus(currencyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currencies');
        toast.success('Currency status updated successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to update currency status');
      },
    }
  );

  const setDefaultCurrencyMutation = useMutation(
    (currencyId: string) => adminService.setDefaultCurrency(currencyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currencies');
        toast.success('Default currency updated successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to update default currency');
      },
    }
  );

  const deleteCurrencyMutation = useMutation(
    (currencyId: string) => adminService.deleteCurrency(currencyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currencies');
        toast.success('Currency deleted successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to delete currency');
      },
    }
  );

  const updateExchangeRatesMutation = useMutation(
    () => adminService.updateExchangeRates({}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currencies');
        toast.success('Exchange rates updated successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to update exchange rates');
      },
    }
  );

  const handleToggle = (currencyId: string) => {
    toggleCurrencyMutation.mutate(currencyId);
  };

  const handleSetDefault = (currencyId: string) => {
    setDefaultCurrencyMutation.mutate(currencyId);
  };

  const handleDelete = (currencyId: string) => {
    if (window.confirm('Are you sure you want to delete this currency?')) {
      deleteCurrencyMutation.mutate(currencyId);
    }
  };

  const handleEdit = (currency: any) => {
    setEditingCurrency(currency);
    setShowModal(true);
  };

  const handleUpdateRates = () => {
    updateExchangeRatesMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load currencies</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Currencies</h1>
          <p className="text-gray-600">Manage system currencies and exchange rates</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleUpdateRates}
            className="btn btn-secondary flex items-center"
            disabled={updateExchangeRatesMutation.isLoading}
          >
            <RefreshCw size={16} className="mr-2" />
            Update Rates
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Currency
          </button>
        </div>
      </div>

      {/* Currencies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Currency</th>
                <th>Code</th>
                <th>Symbol</th>
                <th>Exchange Rate</th>
                <th>Status</th>
                <th>Default</th>
                <th>Withdrawal Limits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currencies?.map((currency: any) => (
                <tr key={currency.id}>
                  <td>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <DollarSign size={16} className="text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{currency.name}</div>
                        <div className="text-sm text-gray-500">{currency.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-900 font-mono">{currency.code}</td>
                  <td className="text-gray-900">{currency.symbol}</td>
                  <td className="text-gray-900">
                    {currency.exchangeRate.toFixed(4)}
                  </td>
                  <td>
                    <span className={`badge ${
                      currency.isActive ? 'badge-success' : 'badge-danger'
                    }`}>
                      {currency.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {currency.isDefault ? (
                      <Star size={16} className="text-yellow-500" />
                    ) : (
                      <button
                        onClick={() => handleSetDefault(currency.id)}
                        className="text-gray-400 hover:text-yellow-500"
                        title="Set as Default"
                      >
                        <Star size={16} />
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="text-sm">
                      <div>Min: {currency.minWithdrawal}</div>
                      <div>Max: {currency.maxWithdrawal}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggle(currency.id)}
                        className={`p-1 rounded ${
                          currency.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={currency.isActive ? 'Disable Currency' : 'Enable Currency'}
                      >
                        {currency.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => handleEdit(currency)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Currency"
                      >
                        <Edit size={16} />
                      </button>
                      {!currency.isDefault && (
                        <button
                          onClick={() => handleDelete(currency.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Currency"
                        >
                          <Trash2 size={16} />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingCurrency ? 'Edit Currency' : 'Add Currency'}
              </h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., US Dollar"
                      defaultValue={editingCurrency?.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency Code
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., USD"
                      defaultValue={editingCurrency?.code}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Symbol
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., $"
                      defaultValue={editingCurrency?.symbol}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Decimal Places
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="8"
                      className="input"
                      placeholder="2"
                      defaultValue={editingCurrency?.decimalPlaces}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Withdrawal
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                      defaultValue={editingCurrency?.minWithdrawal}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Withdrawal
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                      defaultValue={editingCurrency?.maxWithdrawal}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Withdrawal Fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                      defaultValue={editingCurrency?.withdrawalFee}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Type
                    </label>
                    <select className="input" defaultValue={editingCurrency?.withdrawalFeeType}>
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      defaultChecked={editingCurrency?.isActive}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      defaultChecked={editingCurrency?.isDefault}
                    />
                    <span className="ml-2 text-sm text-gray-700">Default Currency</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCurrency ? 'Update Currency' : 'Add Currency'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Currencies; 
