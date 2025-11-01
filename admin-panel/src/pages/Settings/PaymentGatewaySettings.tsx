import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { adminApiService } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { CreditCard, Save, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';

const PaymentGatewaySettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [gatewayStatus, setGatewayStatus] = useState<any>({});
  
  // CoinPayments
  const [coinpayments, setCoinpayments] = useState({
    privateKey: '',
    publicKey: '',
    ipnSecret: '',
    merchantId: '',
    isTestMode: true,
    enabled: false
  });

  // NOWPayments
  const [nowpayments, setNowpayments] = useState({
    apiKey: '',
    ipnSecret: '',
    isTestMode: true,
    enabled: false
  });

  // Binance Pay
  const [binance, setBinance] = useState({
    apiKey: '',
    secretKey: '',
    merchantId: '',
    ipnSecret: '',
    isTestMode: true,
    enabled: false
  });

  useEffect(() => {
    loadGatewayStatus();
  }, []);

  const loadGatewayStatus = async () => {
    setLoading(true);
    try {
      const status = await adminApiService.getPaymentGateways();
      setGatewayStatus(status);
      
      // Load saved configs if available
      try {
        const config = await adminApiService.getPaymentGatewayConfig();
        if (config.data) {
          if (config.data.coinpayments) {
            setCoinpayments(prev => ({ ...prev, ...config.data.coinpayments }));
          }
          if (config.data.nowpayments) {
            setNowpayments(prev => ({ ...prev, ...config.data.nowpayments }));
          }
          if (config.data.binance) {
            setBinance(prev => ({ ...prev, ...config.data.binance }));
          }
        }
      } catch (e) {
        console.log('No saved config found');
      }
    } catch (error) {
      console.error('Failed to load gateway status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (gateway: string, silent = false) => {
    setSaving(gateway);
    try {
      let credentials: {
        apiKey?: string;
        secretKey?: string;
        privateKey?: string;
        publicKey?: string;
        merchantId?: string;
        ipnSecret?: string;
        isTestMode?: boolean;
        enabled?: boolean;
      } | undefined;
      
      if (gateway === 'coinpayments') {
        credentials = {
          privateKey: coinpayments.privateKey,
          publicKey: coinpayments.publicKey,
          ipnSecret: coinpayments.ipnSecret,
          merchantId: coinpayments.merchantId,
          isTestMode: coinpayments.isTestMode,
          enabled: coinpayments.enabled
        };
      } else if (gateway === 'nowpayments') {
        credentials = {
          apiKey: nowpayments.apiKey,
          ipnSecret: nowpayments.ipnSecret,
          isTestMode: nowpayments.isTestMode,
          enabled: nowpayments.enabled
        };
      } else if (gateway === 'binance') {
        credentials = {
          apiKey: binance.apiKey,
          secretKey: binance.secretKey,
          merchantId: binance.merchantId,
          ipnSecret: binance.ipnSecret,
          isTestMode: binance.isTestMode,
          enabled: binance.enabled
        };
      } else {
        throw new Error(`Unsupported gateway: ${gateway}`);
      }

      if (!credentials) {
        throw new Error(`Failed to prepare credentials for ${gateway}`);
      }

      await adminApiService.savePaymentGatewayCredentials(gateway, credentials);
      
      if (!silent) {
        toast.success(`${gateway.toUpperCase()} configuration saved successfully!`);
      }
      
      // Reload status
      await loadGatewayStatus();
    } catch (error) {
      if (!silent) {
        toast.error(`Failed to save ${gateway.toUpperCase()} configuration`);
      }
      console.error(error);
    } finally {
      setSaving(null);
    }
  };

  const getIPNUrl = (gateway: string) => {
    const baseUrl = process.env.REACT_APP_API_URL || window.location.origin.replace(':3000', ':3001');
    return `${baseUrl}/api/payments/ipn/${gateway}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Gateway Settings</h1>
        <p className="text-gray-600 mt-2">Configure payment gateway credentials and IPN settings for automatic deposit approval</p>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">IPN (Instant Payment Notification) URLs:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>CoinPayments: <code className="bg-blue-100 px-1 rounded">{getIPNUrl('coinpayments')}</code></li>
                <li>NOWPayments: <code className="bg-blue-100 px-1 rounded">{getIPNUrl('nowpayments')}</code></li>
                <li>Binance Pay: <code className="bg-blue-100 px-1 rounded">{getIPNUrl('binance')}</code></li>
              </ul>
              <p className="mt-2">Copy these URLs and configure them in your payment gateway dashboard. Deposits will be automatically approved when payment is confirmed.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CoinPayments Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">CoinPayments</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Configure CoinPayments for cryptocurrency payments</p>
            </div>
            <div className="flex items-center space-x-2">
              {gatewayStatus.coinpayments?.configured ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${
                gatewayStatus.coinpayments?.enabled ? 'text-green-600' : 'text-gray-500'
              }`}>
                {gatewayStatus.coinpayments?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cp-private-key">Private Key *</Label>
              <Input
                id="cp-private-key"
                type="password"
                value={coinpayments.privateKey}
                onChange={(e) => setCoinpayments(prev => ({ ...prev, privateKey: e.target.value }))}
                placeholder="Enter private key"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cp-public-key">Public Key *</Label>
              <Input
                id="cp-public-key"
                value={coinpayments.publicKey}
                onChange={(e) => setCoinpayments(prev => ({ ...prev, publicKey: e.target.value }))}
                placeholder="Enter public key"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cp-ipn-secret">IPN Secret Key</Label>
              <Input
                id="cp-ipn-secret"
                type="password"
                value={coinpayments.ipnSecret}
                onChange={(e) => setCoinpayments(prev => ({ ...prev, ipnSecret: e.target.value }))}
                placeholder="Enter IPN secret (optional)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Used to verify IPN callbacks</p>
            </div>
            <div>
              <Label htmlFor="cp-merchant-id">Merchant ID</Label>
              <Input
                id="cp-merchant-id"
                value={coinpayments.merchantId}
                onChange={(e) => setCoinpayments(prev => ({ ...prev, merchantId: e.target.value }))}
                placeholder="Enter merchant ID (optional)"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={coinpayments.enabled}
                    onChange={(e) => {
                      setCoinpayments(prev => ({ ...prev, enabled: e.target.checked }));
                      // Auto-save when toggle changes
                      setTimeout(() => handleSave('coinpayments', true), 100);
                    }}
                    className="sr-only"
                  />
                  <div className={`w-14 h-7 rounded-full transition-colors ${
                    coinpayments.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                      coinpayments.enabled ? 'translate-x-8' : 'translate-x-1'
                    }`}></div>
                  </div>
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  coinpayments.enabled ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {coinpayments.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={coinpayments.isTestMode}
                  onChange={(e) => {
                    setCoinpayments(prev => ({ ...prev, isTestMode: e.target.checked }));
                    setTimeout(() => handleSave('coinpayments', true), 100);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Test Mode</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => handleSave('coinpayments')}
              disabled={saving === 'coinpayments' || !coinpayments.privateKey || !coinpayments.publicKey}
            >
              {saving === 'coinpayments' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save CoinPayments Config
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NOWPayments Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">NOWPayments</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Configure NOWPayments for cryptocurrency payments</p>
            </div>
            <div className="flex items-center space-x-2">
              {gatewayStatus.nowpayments?.configured ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${
                gatewayStatus.nowpayments?.enabled ? 'text-green-600' : 'text-gray-500'
              }`}>
                {gatewayStatus.nowpayments?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="np-api-key">API Key *</Label>
              <Input
                id="np-api-key"
                type="password"
                value={nowpayments.apiKey}
                onChange={(e) => setNowpayments(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter API key"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="np-ipn-secret">IPN Secret Key</Label>
              <Input
                id="np-ipn-secret"
                type="password"
                value={nowpayments.ipnSecret}
                onChange={(e) => setNowpayments(prev => ({ ...prev, ipnSecret: e.target.value }))}
                placeholder="Enter IPN secret (optional)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Used to verify IPN callbacks</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={nowpayments.enabled}
                    onChange={(e) => {
                      setNowpayments(prev => ({ ...prev, enabled: e.target.checked }));
                      setTimeout(() => handleSave('nowpayments', true), 100);
                    }}
                    className="sr-only"
                  />
                  <div className={`w-14 h-7 rounded-full transition-colors ${
                    nowpayments.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                      nowpayments.enabled ? 'translate-x-8' : 'translate-x-1'
                    }`}></div>
                  </div>
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  nowpayments.enabled ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {nowpayments.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={nowpayments.isTestMode}
                  onChange={(e) => {
                    setNowpayments(prev => ({ ...prev, isTestMode: e.target.checked }));
                    setTimeout(() => handleSave('nowpayments', true), 100);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Test Mode</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => handleSave('nowpayments')}
              disabled={saving === 'nowpayments' || !nowpayments.apiKey}
              variant={!nowpayments.apiKey ? 'outline' : 'default'}
            >
              {saving === 'nowpayments' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Binance Pay Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Binance Pay</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Configure Binance Pay for cryptocurrency payments</p>
            </div>
            <div className="flex items-center space-x-2">
              {gatewayStatus.binance?.configured ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${
                gatewayStatus.binance?.enabled ? 'text-green-600' : 'text-gray-500'
              }`}>
                {gatewayStatus.binance?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="binance-api-key">API Key *</Label>
              <Input
                id="binance-api-key"
                type="password"
                value={binance.apiKey}
                onChange={(e) => setBinance(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter API key"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="binance-secret-key">Secret Key *</Label>
              <Input
                id="binance-secret-key"
                type="password"
                value={binance.secretKey}
                onChange={(e) => setBinance(prev => ({ ...prev, secretKey: e.target.value }))}
                placeholder="Enter secret key"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="binance-merchant-id">Merchant ID</Label>
              <Input
                id="binance-merchant-id"
                value={binance.merchantId}
                onChange={(e) => setBinance(prev => ({ ...prev, merchantId: e.target.value }))}
                placeholder="Enter merchant ID (optional)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="binance-ipn-secret">IPN Secret Key</Label>
              <Input
                id="binance-ipn-secret"
                type="password"
                value={binance.ipnSecret}
                onChange={(e) => setBinance(prev => ({ ...prev, ipnSecret: e.target.value }))}
                placeholder="Enter IPN secret (optional)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Used to verify IPN callbacks</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={binance.enabled}
                    onChange={(e) => {
                      setBinance(prev => ({ ...prev, enabled: e.target.checked }));
                      setTimeout(() => handleSave('binance', true), 100);
                    }}
                    className="sr-only"
                  />
                  <div className={`w-14 h-7 rounded-full transition-colors ${
                    binance.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                      binance.enabled ? 'translate-x-8' : 'translate-x-1'
                    }`}></div>
                  </div>
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  binance.enabled ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {binance.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={binance.isTestMode}
                  onChange={(e) => {
                    setBinance(prev => ({ ...prev, isTestMode: e.target.checked }));
                    setTimeout(() => handleSave('binance', true), 100);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Test Mode</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => handleSave('binance')}
              disabled={saving === 'binance' || !binance.apiKey || !binance.secretKey}
              variant={(!binance.apiKey || !binance.secretKey) ? 'outline' : 'default'}
            >
              {saving === 'binance' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGatewaySettings;

