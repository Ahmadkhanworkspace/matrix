import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Palette, 
  Image, 
  Type, 
  Eye, 
  Save, 
  Upload,
  Download,
  RefreshCw,
  Trash2,
  Settings,
  Globe,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  EyeOff
} from 'lucide-react';

interface AppearanceSettings {
  // Theme Settings
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  theme: 'light' | 'dark' | 'auto';
  
  // Logo Settings
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  faviconUrl: string;
  
  // Typography
  fontFamily: string;
  fontSize: string;
  headingFont: string;
  
  // Layout
  sidebarWidth: number;
  headerHeight: number;
  borderRadius: number;
  
  // Custom CSS
  customCSS: string;
  
  // Front Page Settings
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  showStats: boolean;
  showTestimonials: boolean;
  showFeatures: boolean;
  
  // Mobile Settings
  mobileOptimized: boolean;
  mobileMenuStyle: string;
  
  // Advanced
  enableAnimations: boolean;
  enableShadows: boolean;
  enableGradients: boolean;
}

const AppearanceSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppearanceSettings>({
    // Theme Settings
    primaryColor: '#D4AF37',
    secondaryColor: '#1F1F23',
    accentColor: '#FFD700',
    theme: 'dark',
    
    // Logo Settings
    logoUrl: '/logo.png',
    logoWidth: 200,
    logoHeight: 60,
    faviconUrl: '/favicon.ico',
    
    // Typography
    fontFamily: 'Inter',
    fontSize: '14px',
    headingFont: 'Inter',
    
    // Layout
    sidebarWidth: 280,
    headerHeight: 64,
    borderRadius: 8,
    
    // Custom CSS
    customCSS: '',
    
    // Front Page Settings
    heroTitle: 'Matrix MLM System',
    heroSubtitle: 'Professional Multi-Level Marketing Platform',
    heroImage: '/hero-image.jpg',
    showStats: true,
    showTestimonials: true,
    showFeatures: true,
    
    // Mobile Settings
    mobileOptimized: true,
    mobileMenuStyle: 'slide',
    
    // Advanced
    enableAnimations: true,
    enableShadows: true,
    enableGradients: true,
  });

  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    fetchAppearanceSettings();
  }, []);

  const fetchAppearanceSettings = async () => {
    try {
      // Fetch settings from backend
      // const response = await api.settings.getAppearanceSettings();
      // if (response.success) {
      //   setSettings(response.data);
      // }
    } catch (error) {
      console.error('Failed to fetch appearance settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save settings to backend
      // const response = await api.settings.updateAppearanceSettings(settings);
      // if (response.success) {
      //   alert('Appearance settings saved successfully!');
      // }
      alert('Appearance settings saved successfully!');
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
      alert('Failed to save appearance settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (selectedFile) {
      try {
        // Upload logo to server
        // const response = await api.settings.uploadLogo(selectedFile);
        // if (response.success) {
        //   setSettings(prev => ({ ...prev, logoUrl: response.data.url }));
        //   setSelectedFile(null);
        //   setLogoPreview('');
        // }
        alert('Logo uploaded successfully!');
      } catch (error) {
        console.error('Failed to upload logo:', error);
        alert('Failed to upload logo');
      }
    }
  };

  const generatePreviewCSS = () => {
    return `
      :root {
        --primary-color: ${settings.primaryColor};
        --secondary-color: ${settings.secondaryColor};
        --accent-color: ${settings.accentColor};
        --font-family: ${settings.fontFamily};
        --font-size: ${settings.fontSize};
        --border-radius: ${settings.borderRadius}px;
      }
      
      ${settings.customCSS}
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appearance Settings</h1>
          <p className="text-gray-600">Customize the look and feel of your MLM system</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode && (
        <Card className="border-2 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <style>{generatePreviewCSS()}</style>
              <div className="text-center">
                <h1 style={{ color: settings.primaryColor, fontFamily: settings.fontFamily }}>
                  {settings.heroTitle}
                </h1>
                <p style={{ color: settings.secondaryColor }}>
                  {settings.heroSubtitle}
                </p>
                <div className="mt-4">
                  <div style={{ backgroundColor: settings.primaryColor }}>
                    <Button className="text-white">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#D4AF37"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#1F1F23"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  placeholder="#FFD700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme Mode</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Logo Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="max-h-20 mx-auto" />
                ) : (
                  <div className="text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-2" />
                    <p>No logo uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Logo</label>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button onClick={handleLogoUpload} disabled={!selectedFile}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <Input
                  value={settings.logoUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                  <Input
                    type="number"
                    value={settings.logoWidth}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoWidth: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                  <Input
                    type="number"
                    value={settings.logoHeight}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoHeight: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                <Input
                  value={settings.faviconUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                  placeholder="/favicon.ico"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Type className="h-5 w-5 mr-2" />
            Typography Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="12px">Small (12px)</option>
                <option value="14px">Medium (14px)</option>
                <option value="16px">Large (16px)</option>
                <option value="18px">Extra Large (18px)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
              <select
                value={settings.headingFont}
                onChange={(e) => setSettings(prev => ({ ...prev, headingFont: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Front Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Front Page Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <Input
                value={settings.heroTitle}
                onChange={(e) => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
                placeholder="Matrix MLM System"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <Input
                value={settings.heroSubtitle}
                onChange={(e) => setSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                placeholder="Professional Multi-Level Marketing Platform"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
              <Input
                value={settings.heroImage}
                onChange={(e) => setSettings(prev => ({ ...prev, heroImage: e.target.value }))}
                placeholder="/hero-image.jpg"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showStats}
                  onChange={(e) => setSettings(prev => ({ ...prev, showStats: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Show Statistics</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showTestimonials}
                  onChange={(e) => setSettings(prev => ({ ...prev, showTestimonials: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Show Testimonials</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showFeatures}
                  onChange={(e) => setSettings(prev => ({ ...prev, showFeatures: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Show Features</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Layout Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sidebar Width (px)</label>
              <Input
                type="number"
                value={settings.sidebarWidth}
                onChange={(e) => setSettings(prev => ({ ...prev, sidebarWidth: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Header Height (px)</label>
              <Input
                type="number"
                value={settings.headerHeight}
                onChange={(e) => setSettings(prev => ({ ...prev, headerHeight: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius (px)</label>
              <Input
                type="number"
                value={settings.borderRadius}
                onChange={(e) => setSettings(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Mobile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.mobileOptimized}
                onChange={(e) => setSettings(prev => ({ ...prev, mobileOptimized: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Mobile Optimized</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Menu Style</label>
              <select
                value={settings.mobileMenuStyle}
                onChange={(e) => setSettings(prev => ({ ...prev, mobileMenuStyle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="slide">Slide</option>
                <option value="overlay">Overlay</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableAnimations}
                onChange={(e) => setSettings(prev => ({ ...prev, enableAnimations: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Enable Animations</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableShadows}
                onChange={(e) => setSettings(prev => ({ ...prev, enableShadows: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Enable Shadows</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableGradients}
                onChange={(e) => setSettings(prev => ({ ...prev, enableGradients: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Enable Gradients</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Type className="h-5 w-5 mr-2" />
            Custom CSS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS Code</label>
            <textarea
              value={settings.customCSS}
              onChange={(e) => setSettings(prev => ({ ...prev, customCSS: e.target.value }))}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="/* Add your custom CSS here */"
            />
            <p className="text-sm text-gray-500 mt-1">
              Add custom CSS to override default styles. Use with caution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings; 
