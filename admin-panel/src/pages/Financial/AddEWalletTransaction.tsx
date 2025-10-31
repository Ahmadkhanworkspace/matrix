import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, ArrowLeft, User, DollarSign, FileText } from 'lucide-react';
import { adminApiService } from '../../api/adminApi';
import { useCurrency } from '../../contexts/CurrencyContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddEWalletTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { primaryCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    type: 'ADMIN_ADJUSTMENT',
    amount: '',
    currency: primaryCurrency,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.userId || !form.amount || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(form.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      await adminApiService.createEWalletTransaction({
        userId: form.userId,
        type: form.type,
        amount: parseFloat(form.amount),
        currency: form.currency,
        description: form.description
      });

      toast.success('E-Wallet transaction created successfully');
      
      // Reset form
      setForm({
        userId: '',
        type: 'ADMIN_ADJUSTMENT',
        amount: '',
        currency: primaryCurrency,
        description: ''
      });

      // Optionally navigate to transactions list
      setTimeout(() => {
        navigate('/admin/financial/ewallet-transactions');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating eWallet transaction:', error);
      toast.error(error?.message || 'Failed to create eWallet transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add E-Wallet Transaction</h1>
          <p className="text-gray-600 mt-1">Create a new internal wallet transaction or adjustment</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/financial/ewallet-transactions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                User ID *
              </label>
              <Input
                placeholder="Enter user ID (e.g., user_123 or email)"
                value={form.userId}
                onChange={(e) => setForm(prev => ({ ...prev, userId: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the user ID or email address</p>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Transaction Type *
              </label>
              <Select value={form.type} onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN_ADJUSTMENT">Admin Adjustment</SelectItem>
                  <SelectItem value="REFERRAL_BONUS">Referral Bonus</SelectItem>
                  <SelectItem value="MATRIX_BONUS">Matrix Bonus</SelectItem>
                  <SelectItem value="MATCHING_BONUS">Matching Bonus</SelectItem>
                  <SelectItem value="CYCLE_BONUS">Cycle Bonus</SelectItem>
                  <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <Select value={form.currency} onValueChange={(value) => setForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="BTC">BTC - Bitcoin</SelectItem>
                    <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                    <SelectItem value="USDT">USDT - Tether</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Description *
              </label>
              <Input
                placeholder="Enter transaction description (e.g., Manual adjustment for user support)"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Provide a clear description of why this transaction is being created</p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Admin adjustments will immediately update the user's balance</li>
                <li>Bonus transactions are automatically calculated by the system</li>
                <li>All transactions are logged and cannot be deleted</li>
                <li>Double-check user ID and amount before submitting</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/financial/ewallet-transactions')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Plus className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddEWalletTransaction;