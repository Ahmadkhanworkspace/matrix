import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowRight, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  User,
  Wallet,
  History
} from 'lucide-react';

interface Transfer {
  id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  type: 'internal' | 'external' | 'bonus';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  description: string;
  fee: number;
}

const TransferFunds: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transfer' | 'history'>('transfer');
  const [transferType, setTransferType] = useState<'internal' | 'external'>('internal');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: '1',
      fromUser: 'john_doe',
      toUser: 'jane_smith',
      amount: 100,
      type: 'internal',
      status: 'completed',
      date: '2024-01-12',
      description: 'Monthly bonus sharing',
      fee: 2.50
    },
    {
      id: '2',
      fromUser: 'john_doe',
      toUser: 'mike_wilson',
      amount: 50,
      type: 'external',
      status: 'pending',
      date: '2024-01-11',
      description: 'Support transfer',
      fee: 1.25
    },
    {
      id: '3',
      fromUser: 'john_doe',
      toUser: 'sarah_jones',
      amount: 75,
      type: 'internal',
      status: 'completed',
      date: '2024-01-10',
      description: 'Matrix completion reward',
      fee: 1.88
    }
  ]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransfer: Transfer = {
        id: Date.now().toString(),
        fromUser: 'john_doe',
        toUser: recipient,
        amount: parseFloat(amount),
        type: transferType,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        description: description || 'Fund transfer',
        fee: parseFloat(amount) * 0.025
      };
      
      setTransfers([newTransfer, ...transfers]);
      setAmount('');
      setRecipient('');
      setDescription('');
      
      // Show success message
      alert('Transfer initiated successfully!');
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'internal':
        return <Badge className="bg-blue-100 text-blue-800">Internal</Badge>;
      case 'external':
        return <Badge className="bg-purple-100 text-purple-800">External</Badge>;
      case 'bonus':
        return <Badge className="bg-green-100 text-green-800">Bonus</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateFee = (amount: number) => {
    return amount * 0.025; // 2.5% fee
  };

  const calculateTotal = (amount: number) => {
    return amount + calculateFee(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
          <p className="text-gray-600">Transfer funds to other members or external accounts</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(2500.00)}</div>
            <p className="text-xs text-muted-foreground">Ready for transfer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transfers.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(225)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer Fee</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5%</div>
            <p className="text-xs text-muted-foreground">Per transfer</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'transfer' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('transfer')}
          className="flex-1"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('history')}
          className="flex-1"
        >
          <History className="h-4 w-4 mr-2" />
          Transfer History
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'transfer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle>New Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                {/* Transfer Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer Type
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={transferType === 'internal' ? 'default' : 'outline'}
                      onClick={() => setTransferType('internal')}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Internal
                    </Button>
                    <Button
                      type="button"
                      variant={transferType === 'external' ? 'default' : 'outline'}
                      onClick={() => setTransferType('external')}
                      className="flex-1"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      External
                    </Button>
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient {transferType === 'internal' ? 'Username' : 'Email/Address'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={transferType === 'internal' ? 'Enter username' : 'Enter email or address'}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Fee Calculation */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transfer Amount:</span>
                      <span>{formatCurrency(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fee (2.5%):</span>
                      <span>{formatCurrency(calculateFee(parseFloat(amount)))}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal(parseFloat(amount)))}</span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter transfer description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !amount || !recipient}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Send Transfer
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Transfer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Instant Transfers</div>
                    <div className="text-sm text-gray-600">Internal transfers are processed instantly</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">24-48 Hours</div>
                    <div className="text-sm text-gray-600">External transfers take 24-48 hours</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">2.5% Fee</div>
                    <div className="text-sm text-gray-600">Standard transfer fee applies</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Transfer Limits</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Minimum: $10.00</div>
                  <div>• Maximum: $10,000.00</div>
                  <div>• Daily Limit: $50,000.00</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transfers.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
                  <p className="text-gray-500">You haven't made any transfers yet.</p>
                </div>
              ) : (
                transfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              To: {transfer.toUser}
                            </h3>
                            {getTypeBadge(transfer.type)}
                            {getStatusBadge(transfer.status)}
                          </div>
                          <p className="text-sm text-gray-500">{transfer.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transfer.date).toLocaleDateString()} • Fee: {formatCurrency(transfer.fee)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          -{formatCurrency(transfer.amount)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {transfer.status === 'completed' ? 'Completed' : 'Processing'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransferFunds; 