import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { adminApiService } from '../../api/adminApi';
import toast from 'react-hot-toast';
import {
  Palette,
  Plus,
  Globe,
  Key,
  Settings,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  hasBrandSettings: boolean;
  createdAt: string;
}

interface BrandSettings {
  brandName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customCSS: string | null;
  customJS: string | null;
  footerText: string | null;
  isActive: boolean;
}

interface CustomDomain {
  id: string;
  domain: string;
  dnsConfigured: boolean;
  verified: boolean;
  verifiedAt: string | null;
}

const WhiteLabel: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [newTenant, setNewTenant] = useState({ name: '', subdomain: '' });
  const [settingsForm, setSettingsForm] = useState<BrandSettings>({
    brandName: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter',
    customCSS: '',
    customJS: '',
    footerText: '',
    isActive: true
  });
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchBrandSettings();
      fetchDomains();
    }
  }, [selectedTenant]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getTenants();
      if (response.success) {
        setTenants(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandSettings = async () => {
    if (!selectedTenant) return;
    try {
      const response = await adminApiService.getBrandSettings(selectedTenant.id);
      if (response.success && response.data) {
        setBrandSettings(response.data);
        setSettingsForm(response.data);
      }
    } catch (error) {
      console.error('Error fetching brand settings:', error);
    }
  };

  const fetchDomains = async () => {
    if (!selectedTenant) return;
    try {
      const response = await adminApiService.getCustomDomains(selectedTenant.id);
      if (response.success) {
        setDomains(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminApiService.createTenant(newTenant);
      if (response.success) {
        toast.success('Tenant created successfully! Save your API keys now.');
        setShowCreateForm(false);
        setNewTenant({ name: '', subdomain: '' });
        fetchTenants();
        
        // Show API key alert
        if (response.data.apiKey) {
          alert(`API Key: ${response.data.apiKey}\n\nAPI Secret: ***SECRET***\n\nPlease save these credentials now - they won't be shown again!`);
        }
      }
    } catch (error) {
      toast.error('Failed to create tenant');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      const response = await adminApiService.updateBrandSettings(selectedTenant.id, settingsForm);
      if (response.success) {
        toast.success('Brand settings updated successfully');
        setShowSettingsForm(false);
        fetchBrandSettings();
      }
    } catch (error) {
      toast.error('Failed to update brand settings');
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      const response = await adminApiService.addCustomDomain(selectedTenant.id, newDomain);
      if (response.success) {
        toast.success('Domain added successfully');
        setNewDomain('');
        fetchDomains();
      }
    } catch (error) {
      toast.error('Failed to add domain');
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await adminApiService.verifyDomain(domainId);
      if (response.success) {
        toast.success('Domain verified successfully');
        fetchDomains();
      }
    } catch (error) {
      toast.error('Failed to verify domain');
    }
  };

  const handleGenerateApiKey = async () => {
    if (!selectedTenant) return;
    
    if (!window.confirm('Generating a new API key will invalidate the old one. Continue?')) return;

    try {
      const response = await adminApiService.generateApiKey(selectedTenant.id);
      if (response.success && response.data.apiKey) {
        toast.success('New API key generated!');
        alert(`New API Key: ${response.data.apiKey}\n\nPlease save this now - it won't be shown again!`);
      }
    } catch (error) {
      toast.error('Failed to generate API key');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">White-Label Management</h1>
          <p className="text-gray-600">Manage multi-tenant brands and customization</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tenant
        </Button>
      </div>

      {/* Create Tenant Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <Label htmlFor="name">Tenant Name *</Label>
                <Input
                  id="name"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  placeholder="e.g., My MLM Brand"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subdomain">Subdomain *</Label>
                <Input
                  id="subdomain"
                  value={newTenant.subdomain}
                  onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value.toLowerCase() })}
                  placeholder="e.g., mybrand"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be accessible at: {newTenant.subdomain || 'subdomain'}.yourdomain.com
                </p>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Create Tenant</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tenants List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : tenants.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No tenants created yet</p>
            ) : (
              <div className="space-y-2">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    onClick={() => setSelectedTenant(tenant)}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTenant?.id === tenant.id ? 'bg-blue-50 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{tenant.name}</h3>
                        <p className="text-sm text-gray-600">{tenant.subdomain}</p>
                      </div>
                      {tenant.isActive ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Details */}
        {selectedTenant && (
          <div className="lg:col-span-2 space-y-6">
            {/* Brand Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Brand Settings</span>
                  </CardTitle>
                  {!showSettingsForm && (
                    <Button size="sm" onClick={() => setShowSettingsForm(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {brandSettings ? 'Edit' : 'Configure'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showSettingsForm ? (
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                          id="brandName"
                          value={settingsForm.brandName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <Input
                          id="fontFamily"
                          value={settingsForm.fontFamily}
                          onChange={(e) => setSettingsForm({ ...settingsForm, fontFamily: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settingsForm.primaryColor}
                          onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={settingsForm.secondaryColor}
                          onChange={(e) => setSettingsForm({ ...settingsForm, secondaryColor: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={settingsForm.logoUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="footerText">Footer Text</Label>
                      <Input
                        id="footerText"
                        value={settingsForm.footerText || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Save Settings</Button>
                      <Button type="button" variant="outline" onClick={() => setShowSettingsForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : brandSettings ? (
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Brand Name:</span> {brandSettings.brandName}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="font-medium">Primary Color:</span>
                        <div
                          className="w-8 h-8 rounded border inline-block ml-2"
                          style={{ backgroundColor: brandSettings.primaryColor }}
                        ></div>
                      </div>
                      <div>
                        <span className="font-medium">Font:</span> {brandSettings.fontFamily}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No brand settings configured</p>
                )}
              </CardContent>
            </Card>

            {/* Custom Domains */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Custom Domains</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDomain} className="mb-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="example.com"
                      required
                    />
                    <Button type="submit">Add Domain</Button>
                  </div>
                </form>
                {domains.length === 0 ? (
                  <p className="text-gray-500 text-sm">No custom domains added</p>
                ) : (
                  <div className="space-y-2">
                    {domains.map((domain) => (
                      <div key={domain.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{domain.domain}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {domain.verified ? (
                              <Badge className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            {domain.dnsConfigured && (
                              <Badge variant="outline">DNS Configured</Badge>
                            )}
                          </div>
                        </div>
                        {!domain.verified && (
                          <Button size="sm" onClick={() => handleVerifyDomain(domain.id)}>
                            Verify
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>API Keys</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  API keys allow programmatic access to this tenant's data. Keep them secure!
                </p>
                <Button onClick={handleGenerateApiKey} variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Generate New API Key
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhiteLabel;

