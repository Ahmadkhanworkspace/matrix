import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

const AddEWalletTransaction: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add E-Wallet Transaction</h1>
          <p className="text-gray-600">Add new e-wallet transactions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add E-Wallet Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">E-wallet transaction management will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEWalletTransaction; 
