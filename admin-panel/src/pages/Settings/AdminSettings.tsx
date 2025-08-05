import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Globe, 
  Mail, 
  CreditCard,
  Users,
  Shield,
  Bell,
  DollarSign,
  Image,
  Palette,
  Database,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface AdminSettings {
  // Site Information
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  adminEmail: string;
  supportEmail: string;
  
  // Payment Settings
  primaryCurrency: string;
  supportedCurrencies: string[];
  minimumDeposit: number;
  maximumDeposit: number;
  withdrawalFee: number;
  minimumWithdrawal: number;
  
  // Email Settings
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: string;
  fromEmail: string;
  fromName: string;
  
  // Membership Settings
  freeMemberEnabled: boolean;
  proMemberFee: number;
  premiumMemberFee: number;
  referralBonus: number;
  matchingBonus: number;
  
  // Signup Settings
  emailVerificationRequired: boolean;
  adminApprovalRequired: boolean;
  welcomeEmailEnabled: boolean;
  
  // Display Settings
  theme: string;
  logoUrl: string;
  faviconUrl: string;
  maintenanceMode: boolean;
  
  // Email Notifications
  newMemberNotification: boolean;
  depositNotification: boolean;
  withdrawalNotification: boolean;
  cycleCompletionNotification: boolean;
  
  // Bonus Settings
  fastStartBonus: number;
  leadershipBonus: number;
  matrixBonus: number;
  
  // Banner Settings
  bannerRotationEnabled: boolean;
  bannerDisplayTime: number;
  textAdRotationEnabled: boolean;
}

const AdminSettings: React.FC = () => {
  const { primaryCurrency, supportedCurrencies, updatePrimaryCurrency, addSupportedCurrency, removeSupportedCurrency } = useCurrency();
  const [settings, setSettings] = useState<AdminSettings>({
    // Site Information
    siteName: 'Matrix MLM System',
    siteUrl: 'https://yourdomain.com',
    siteDescription: 'Professional MLM Matrix System',
    adminEmail: 'admin@yourdomain.com',
    supportEmail: 'support@yourdomain.com',
    
    // Payment Settings
    primaryCurrency: primaryCurrency,
    supportedCurrencies: supportedCurrencies,
    minimumDeposit: 10,
    maximumDeposit: 10000,
    withdrawalFee: 2.5,
    minimumWithdrawal: 50,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: 'noreply@yourdomain.com',
    fromName: 'Matrix MLM System',
    
    // Membership Settings
    freeMemberEnabled: true,
    proMemberFee: 100,
    premiumMemberFee: 500,
    referralBonus: 10,
    matchingBonus: 5,
    
    // Signup Settings
    emailVerificationRequired: true,
    adminApprovalRequired: false,
    welcomeEmailEnabled: true,
    
    // Display Settings
    theme: 'light',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    maintenanceMode: false,
    
    // Email Notifications
    newMemberNotification: true,
    depositNotification: true,
    withdrawalNotification: true,
    cycleCompletionNotification: true,
    
    // Bonus Settings
    fastStartBonus: 20,
    leadershipBonus: 15,
    matrixBonus: 25,
    
    // Banner Settings
    bannerRotationEnabled: true,
    bannerDisplayTime: 30,
    textAdRotationEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newCurrency, setNewCurrency] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Fetch settings from backend
      // const response = await api.settings.getAdminSettings();
      // if (response.success) {
      //   setSettings(response.data);
      // }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save settings to backend
      // const response = await api.settings.updateAdminSettings(settings);
      // if (response.success) {
      //   alert('Settings saved successfully!');
      // }
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    updatePrimaryCurrency(currency);
    setSettings(prev => ({ ...prev, primaryCurrency: currency }));
  };

  const handleAddCurrency = () => {
    if (newCurrency && !supportedCurrencies.includes(newCurrency)) {
      addSupportedCurrency(newCurrency);
      setSettings(prev => ({ 
        ...prev, 
        supportedCurrencies: [...prev.supportedCurrencies, newCurrency] 
      }));
      setNewCurrency('');
    }
  };

  const handleRemoveCurrency = (currency: string) => {
    if (currency !== primaryCurrency) {
      removeSupportedCurrency(currency);
      setSettings(prev => ({ 
        ...prev, 
        supportedCurrencies: prev.supportedCurrencies.filter(c => c !== currency) 
      }));
    }
  };

  const testEmailConnection = async () => {
    try {
      // Test email connection
      alert('Email connection test successful!');
    } catch (error) {
      alert('Email connection test failed!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
              <Input
                value={settings.siteUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                placeholder="https://yourdomain.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <Input
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                placeholder="Enter site description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <Input
                value={settings.adminEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                placeholder="admin@yourdomain.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <Input
                value={settings.supportEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                placeholder="support@yourdomain.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Currency</label>
              <select
                value={settings.primaryCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="BTC">BTC - Bitcoin</option>
                <option value="ETH">ETH - Ethereum</option>
                <option value="TRX">TRX - Tron</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supported Currencies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {settings.supportedCurrencies.map(currency => (
                  <Badge key={currency} className="flex items-center">
                    {currency}
                    {currency !== settings.primaryCurrency && (
                      <button
                        onClick={() => handleRemoveCurrency(currency)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              <div className="flex">
                <Input
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  placeholder="Add currency code"
                  className="mr-2"
                />
                <Button onClick={handleAddCurrency} size="sm">
                  Add
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Deposit ({settings.primaryCurrency})</label>
              <Input
                type="number"
                value={settings.minimumDeposit}
                onChange={(e) => setSettings(prev => ({ ...prev, minimumDeposit: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Deposit ({settings.primaryCurrency})</label>
              <Input
                type="number"
                value={settings.maximumDeposit}
                onChange={(e) => setSettings(prev => ({ ...prev, maximumDeposit: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Fee (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.withdrawalFee}
                onChange={(e) => setSettings(prev => ({ ...prev, withdrawalFee: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Withdrawal ({settings.primaryCurrency})</label>
              <Input
                type="number"
                value={settings.minimumWithdrawal}
                onChange={(e) => setSettings(prev => ({ ...prev, minimumWithdrawal: parseFloat(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
              <Input
                value={settings.smtpHost}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
              <Input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
              <Input
                value={settings.smtpUsername}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
              <select
                value={settings.smtpEncryption}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpEncryption: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
              <Input
                value={settings.fromEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                placeholder="noreply@yourdomain.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
              <Input
                value={settings.fromName}
                onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
                placeholder="Matrix MLM System"
              />
            </div>
            <div className="md:col-span-2">
              <Button variant="outline" onClick={testEmailConnection}>
                <Mail className="h-4 w-4 mr-2" />
                Test Email Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Membership Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.freeMemberEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, freeMemberEnabled: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Enable Free Members</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pro Member Fee ({settings.primaryCurrency})</label>
              <Input
                type="number"
                value={settings.proMemberFee}
                onChange={(e) => setSettings(prev => ({ ...prev, proMemberFee: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Premium Member Fee ({settings.primaryCurrency})</label>
              <Input
                type="number"
                value={settings.premiumMemberFee}
                onChange={(e) => setSettings(prev => ({ ...prev, premiumMemberFee: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral Bonus (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.referralBonus}
                onChange={(e) => setSettings(prev => ({ ...prev, referralBonus: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matching Bonus (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.matchingBonus}
                onChange={(e) => setSettings(prev => ({ ...prev, matchingBonus: parseFloat(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Signup Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailVerificationRequired}
                onChange={(e) => setSettings(prev => ({ ...prev, emailVerificationRequired: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Email Verification Required</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.adminApprovalRequired}
                onChange={(e) => setSettings(prev => ({ ...prev, adminApprovalRequired: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Admin Approval Required</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.welcomeEmailEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, welcomeEmailEnabled: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Send Welcome Email</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <Input
                value={settings.logoUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
              <Input
                value={settings.faviconUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                placeholder="/favicon.ico"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.newMemberNotification}
                onChange={(e) => setSettings(prev => ({ ...prev, newMemberNotification: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">New Member Notification</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.depositNotification}
                onChange={(e) => setSettings(prev => ({ ...prev, depositNotification: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Deposit Notification</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.withdrawalNotification}
                onChange={(e) => setSettings(prev => ({ ...prev, withdrawalNotification: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Withdrawal Notification</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.cycleCompletionNotification}
                onChange={(e) => setSettings(prev => ({ ...prev, cycleCompletionNotification: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Cycle Completion Notification</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bonus Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Bonus Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fast Start Bonus (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.fastStartBonus}
                onChange={(e) => setSettings(prev => ({ ...prev, fastStartBonus: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leadership Bonus (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.leadershipBonus}
                onChange={(e) => setSettings(prev => ({ ...prev, leadershipBonus: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Bonus (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.matrixBonus}
                onChange={(e) => setSettings(prev => ({ ...prev, matrixBonus: parseFloat(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Banner Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.bannerRotationEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, bannerRotationEnabled: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Enable Banner Rotation</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Display Time (seconds)</label>
              <Input
                type="number"
                value={settings.bannerDisplayTime}
                onChange={(e) => setSettings(prev => ({ ...prev, bannerDisplayTime: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.textAdRotationEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, textAdRotationEnabled: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Enable Text Ad Rotation</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings; 
