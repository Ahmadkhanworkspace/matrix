import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ToggleLeft,
  ToggleRight,
  Settings
} from 'lucide-react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const PaymentGateways: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: gateways, isLoading, error } = useQuery(
    'payment-gateways',
    adminService.getPaymentGateways
  );

  const toggleGatewayMutation = useMutation(
    (gatewayId: string) => adminService.togglePaymentGatewayStatus(gatewayId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payment-gateways');
        toast.success('Gateway status updated successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to update gateway status');
      },
    }
  );

  const deleteGatewayMutation = useMutation(
    (gatewayId: string) => adminService.deletePaymentGateway(gatewayId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payment-gateways');
        toast.success('Gateway deleted successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to delete gateway');
      },
    }
  );

  const handleToggle = (gatewayId: string) => {
    toggleGatewayMutation.mutate(gatewayId);
  };

  const handleDelete = (gatewayId: string) => {
    if (window.confirm('Are you sure you want to delete this payment gateway?')) {
      deleteGatewayMutation.mutate(gatewayId);
    }
  };

  const handleEdit = (gateway: any) => {
    setEditingGateway(gateway);
    setShowModal(true);
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
        <p className="text-gray-500">Failed to load payment gateways</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
          <p className="text-gray-600">Manage payment gateway integrations</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Gateway
        </button>
      </div>

      {/* Gateways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateways?.map((gateway: any) => (
          <div key={gateway.id} className="bg-white rounded-lg shadow p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <CreditCard size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{gateway.name}</h3>
                  <p className="text-sm text-gray-500">{gateway.gateway}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggle(gateway.id)}
                  className={`p-2 rounded-lg ${
                    gateway.isActive 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={gateway.isActive ? 'Disable Gateway' : 'Enable Gateway'}
                >
                  {gateway.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                <button
                  onClick={() => handleEdit(gateway)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  title="Edit Gateway"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(gateway.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Delete Gateway"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`font-medium ${
                  gateway.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {gateway.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Test Mode:</span>
                <span className={`font-medium ${
                  gateway.isTestMode ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {gateway.isTestMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Min Amount:</span>
                <span className="font-medium">${gateway.minAmount}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max Amount:</span>
                <span className="font-medium">${gateway.maxAmount}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fee:</span>
                <span className="font-medium">
                  {gateway.feePercentage}% + ${gateway.fixedFee}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-2">Supported Currencies:</div>
                <div className="flex flex-wrap gap-1">
                  {gateway.supportedCurrencies.map((currency: string) => (
                    <span
                      key={currency}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {currency}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {gateways?.length === 0 && (
        <div className="text-center py-12">
          <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Gateways</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first payment gateway.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            Add Payment Gateway
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingGateway ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
              </h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gateway Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter gateway name"
                    defaultValue={editingGateway?.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gateway Type
                  </label>
                  <select className="input">
                    <option value="">Select gateway type</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="coinpayments">CoinPayments</option>
                    <option value="nowpayments">NOWPayments</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="mercadopago">MercadoPago</option>
                    <option value="flutterwave">Flutterwave</option>
                    <option value="paystack">Paystack</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="0.00"
                      defaultValue={editingGateway?.minAmount}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="0.00"
                      defaultValue={editingGateway?.maxAmount}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Percentage
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                      defaultValue={editingGateway?.feePercentage}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fixed Fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                      defaultValue={editingGateway?.fixedFee}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      defaultChecked={editingGateway?.isActive}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      defaultChecked={editingGateway?.isTestMode}
                    />
                    <span className="ml-2 text-sm text-gray-700">Test Mode</span>
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
                    {editingGateway ? 'Update Gateway' : 'Add Gateway'}
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

export default PaymentGateways; 
