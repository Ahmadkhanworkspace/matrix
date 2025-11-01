import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { apiService } from '../api/api';
import toast from 'react-hot-toast';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Users,
  PieChart,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface CommissionEntry {
  id: string;
  referralId: string;
  referralUsername: string;
  commissionType: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

interface CommissionSummary {
  totalCommissions: number;
  totalReferrals: number;
  averageCommission: number;
  byType: { [key: string]: number };
  byPeriod: Array<{
    period: string;
    total: number;
    count: number;
  }>;
}

const CommissionBreakdown: React.FC = () => {
  const [commissions, setCommissions] = useState<CommissionEntry[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchCommissionData();
  }, [startDate, endDate]);

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCommissionBreakdown(startDate, endDate);
      if (response.success) {
        setCommissions(response.data.commissions || []);
        setSummary(response.data.summary || null);
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
      toast.error('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  const getCommissionTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      referral: 'bg-blue-600',
      level: 'bg-green-600',
      matching: 'bg-purple-600',
      cycle: 'bg-orange-600',
      bonus: 'bg-yellow-600'
    };
    return colors[type] || 'bg-gray-600';
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Breakdown</h1>
          <p className="text-gray-600">Detailed commission report by referral</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchCommissionData}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalCommissions, 'USD')}
              </div>
              <p className="text-xs text-gray-600 mt-1">{summary.totalReferrals} referrals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Commission</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.averageCommission, 'USD')}
              </div>
              <p className="text-xs text-gray-600 mt-1">Per referral</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalReferrals}</div>
              <p className="text-xs text-gray-600 mt-1">In selected period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Types</CardTitle>
              <PieChart className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(summary.byType).length}</div>
              <p className="text-xs text-gray-600 mt-1">Different types</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Commission by Type */}
      {summary && summary.byType && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.byType).map(([type, amount]) => {
                  const percentage = summary.totalCommissions > 0
                    ? (amount / summary.totalCommissions) * 100
                    : 0;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getCommissionTypeColor(type)}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Badge>
                          <span className="font-medium">
                            {formatCurrency(amount as number, 'USD')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCommissionTypeColor(type)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Commission by Period */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.byPeriod.map((period) => {
                  const maxTotal = Math.max(...summary.byPeriod.map(p => p.total));
                  const width = maxTotal > 0 ? (period.total / maxTotal) * 100 : 0;
                  return (
                    <div key={period.period}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{period.period}</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(period.total, 'USD')} ({period.count} transactions)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Commission List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commission Details</CardTitle>
            <Badge variant="outline">{commissions.length} entries</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading commission data...</p>
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No commission data for selected period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Referral</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {commission.referralUsername || 'Unknown'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getCommissionTypeColor(commission.commissionType)}>
                          {commission.commissionType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {commission.description}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right text-green-600">
                        {formatCurrency(commission.amount, 'USD')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {commission.status === 'paid' ? (
                          <Badge className="bg-green-600">Paid</Badge>
                        ) : commission.status === 'pending' ? (
                          <Badge className="bg-yellow-600">Pending</Badge>
                        ) : (
                          <Badge variant="secondary">Failed</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionBreakdown;

