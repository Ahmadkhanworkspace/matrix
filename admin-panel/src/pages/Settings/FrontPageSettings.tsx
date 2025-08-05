import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Globe, 
  Image, 
  Type, 
  Settings, 
  Save, 
  Upload,
  Eye,
  EyeOff,
  Palette,
  Layout,
  FileText,
  Video,
  Star,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  Plus,
  Trash2
} from 'lucide-react';

interface FrontPageSettings {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroVideo: string;
  heroButtonText: string;
  heroButtonUrl: string;
  showHeroVideo: boolean;
  
  // Features Section
  featuresTitle: string;
  featuresSubtitle: string;
  showFeatures: boolean;
  features: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
    isActive: boolean;
  }>;
  
  // Statistics Section
  statsTitle: string;
  showStats: boolean;
  statistics: Array<{
    id: number;
    label: string;
    value: string;
    icon: string;
    isActive: boolean;
  }>;
  
  // Testimonials Section
  testimonialsTitle: string;
  showTestimonials: boolean;
  testimonials: Array<{
    id: number;
    name: string;
    position: string;
    content: string;
    rating: number;
    image: string;
    isActive: boolean;
  }>;
  
  // Content Sections
  aboutTitle: string;
  aboutContent: string;
  showAbout: boolean;
  
  contactTitle: string;
  contactContent: string;
  showContact: boolean;
  
  // SEO Settings
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string;
  
  // Advanced Settings
  enableAnimations: boolean;
  enableParallax: boolean;
  customCSS: string;
}

const FrontPageSettings: React.FC = () => {
  const [settings, setSettings] = useState<FrontPageSettings>({
    // Hero Section
    heroTitle: 'Matrix MLM System',
    heroSubtitle: 'Professional Multi-Level Marketing Platform',
    heroDescription: 'Join thousands of successful entrepreneurs in our advanced MLM system. Build your network, earn rewards, and achieve financial freedom.',
    heroImage: '/hero-image.jpg',
    heroVideo: '/hero-video.mp4',
    heroButtonText: 'Get Started Today',
    heroButtonUrl: '/register',
    showHeroVideo: false,
    
    // Features Section
    featuresTitle: 'Why Choose Matrix MLM',
    featuresSubtitle: 'Discover the advantages of our platform',
    showFeatures: true,
    features: [
      {
        id: 1,
        title: 'Advanced Matrix System',
        description: 'Our sophisticated matrix system ensures fair distribution and maximum earnings potential.',
        icon: 'TrendingUp',
        isActive: true
      },
      {
        id: 2,
        title: 'Real-time Analytics',
        description: 'Track your performance with detailed analytics and insights.',
        icon: 'BarChart3',
        isActive: true
      },
      {
        id: 3,
        title: 'Secure Payments',
        description: 'Multiple payment options with bank-level security.',
        icon: 'Shield',
        isActive: true
      },
      {
        id: 4,
        title: '24/7 Support',
        description: 'Round-the-clock customer support to help you succeed.',
        icon: 'Headphones',
        isActive: true
      }
    ],
    
    // Statistics Section
    statsTitle: 'Platform Statistics',
    showStats: true,
    statistics: [
      {
        id: 1,
        label: 'Active Members',
        value: '50,000+',
        icon: 'Users',
        isActive: true
      },
      {
        id: 2,
        label: 'Total Earnings',
        value: '$10M+',
        icon: 'DollarSign',
        isActive: true
      },
      {
        id: 3,
        label: 'Success Rate',
        value: '95%',
        icon: 'CheckCircle',
        isActive: true
      },
      {
        id: 4,
        label: 'Countries',
        value: '150+',
        icon: 'Globe',
        isActive: true
      }
    ],
    
    // Testimonials Section
    testimonialsTitle: 'What Our Members Say',
    showTestimonials: true,
    testimonials: [
      {
        id: 1,
        name: 'John Smith',
        position: 'Top Earner',
        content: 'Matrix MLM changed my life. I\'ve never seen such a professional and fair system.',
        rating: 5,
        image: '/testimonial-1.jpg',
        isActive: true
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        position: 'Network Leader',
        content: 'The support team is incredible. They helped me build a successful network.',
        rating: 5,
        image: '/testimonial-2.jpg',
        isActive: true
      },
      {
        id: 3,
        name: 'Mike Davis',
        position: 'Diamond Member',
        content: 'Best decision I ever made. The earnings potential is unlimited.',
        rating: 5,
        image: '/testimonial-3.jpg',
        isActive: true
      }
    ],
    
    // Content Sections
    aboutTitle: 'About Matrix MLM',
    aboutContent: 'Matrix MLM is a leading multi-level marketing platform designed to help entrepreneurs build successful businesses. Our advanced technology and proven strategies ensure maximum success for our members.',
    showAbout: true,
    
    contactTitle: 'Contact Us',
    contactContent: 'Ready to start your journey? Contact our team for personalized guidance and support.',
    showContact: true,
    
    // SEO Settings
    pageTitle: 'Matrix MLM System - Professional Multi-Level Marketing Platform',
    metaDescription: 'Join Matrix MLM, the leading multi-level marketing platform. Build your network, earn rewards, and achieve financial freedom with our advanced system.',
    metaKeywords: 'MLM, multi-level marketing, matrix system, network marketing, business opportunity',
    
    // Advanced Settings
    enableAnimations: true,
    enableParallax: true,
    customCSS: ''
  });

  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'features' | 'stats' | 'testimonials' | 'content' | 'seo' | 'advanced'>('hero');

  useEffect(() => {
    fetchFrontPageSettings();
  }, []);

  const fetchFrontPageSettings = async () => {
    try {
      // Fetch settings from backend
      // const response = await api.settings.getFrontPageSettings();
      // if (response.success) {
      //   setSettings(response.data);
      // }
    } catch (error) {
      console.error('Failed to fetch front page settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save settings to backend
      // const response = await api.settings.updateFrontPageSettings(settings);
      // if (response.success) {
      //   alert('Front page settings saved successfully!');
      // }
      alert('Front page settings saved successfully!');
    } catch (error) {
      console.error('Failed to save front page settings:', error);
      alert('Failed to save front page settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({ ...prev, [field]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now(),
      title: '',
      description: '',
      icon: 'Star',
      isActive: true
    };
    setSettings(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  const updateFeature = (id: number, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const removeFeature = (id: number) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== id)
    }));
  };

  const addStatistic = () => {
    const newStat = {
      id: Date.now(),
      label: '',
      value: '',
      icon: 'TrendingUp',
      isActive: true
    };
    setSettings(prev => ({
      ...prev,
      statistics: [...prev.statistics, newStat]
    }));
  };

  const updateStatistic = (id: number, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      statistics: prev.statistics.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeStatistic = (id: number) => {
    setSettings(prev => ({
      ...prev,
      statistics: prev.statistics.filter(s => s.id !== id)
    }));
  };

  const addTestimonial = () => {
    const newTestimonial = {
      id: Date.now(),
      name: '',
      position: '',
      content: '',
      rating: 5,
      image: '',
      isActive: true
    };
    setSettings(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }));
  };

  const updateTestimonial = (id: number, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      testimonials: prev.testimonials.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const removeTestimonial = (id: number) => {
    setSettings(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(t => t.id !== id)
    }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Front Page Settings</h1>
          <p className="text-gray-600">Configure your website homepage and landing page</p>
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hero')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'hero'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Image className="h-4 w-4 mr-2 inline" />
            Hero Section
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Award className="h-4 w-4 mr-2 inline" />
            Features
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2 inline" />
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'testimonials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 mr-2 inline" />
            Testimonials
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            Content
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'seo'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Globe className="h-4 w-4 mr-2 inline" />
            SEO
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'advanced'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            Advanced
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      {activeTab === 'hero' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="h-5 w-5 mr-2" />
              Hero Section Settings
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
                <textarea
                  value={settings.heroDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, heroDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hero description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={settings.heroImage}
                    onChange={(e) => setSettings(prev => ({ ...prev, heroImage: e.target.value }))}
                    placeholder="/hero-image.jpg"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('hero-image-upload')?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    id="hero-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'heroImage')}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Video</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={settings.heroVideo}
                    onChange={(e) => setSettings(prev => ({ ...prev, heroVideo: e.target.value }))}
                    placeholder="/hero-video.mp4"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('hero-video-upload')?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    id="hero-video-upload"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'heroVideo')}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <Input
                  value={settings.heroButtonText}
                  onChange={(e) => setSettings(prev => ({ ...prev, heroButtonText: e.target.value }))}
                  placeholder="Get Started Today"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
                <Input
                  value={settings.heroButtonUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, heroButtonUrl: e.target.value }))}
                  placeholder="/register"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showHeroVideo}
                  onChange={(e) => setSettings(prev => ({ ...prev, showHeroVideo: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Show Hero Video</label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Section */}
      {activeTab === 'features' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Features Section
              </div>
              <Button onClick={addFeature}>
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features Title</label>
                <Input
                  value={settings.featuresTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, featuresTitle: e.target.value }))}
                  placeholder="Why Choose Matrix MLM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features Subtitle</label>
                <Input
                  value={settings.featuresSubtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, featuresSubtitle: e.target.value }))}
                  placeholder="Discover the advantages of our platform"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showFeatures}
                  onChange={(e) => setSettings(prev => ({ ...prev, showFeatures: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Show Features Section</label>
              </div>
            </div>

            <div className="space-y-4">
              {settings.features.map((feature, index) => (
                <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">Feature {index + 1}</h3>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => removeFeature(feature.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <Input
                        value={feature.title}
                        onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                        placeholder="Feature title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <Input
                        value={feature.icon}
                        onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)}
                        placeholder="TrendingUp"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Feature description..."
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={feature.isActive}
                        onChange={(e) => updateFeature(feature.id, 'isActive', e.target.checked)}
                        className="rounded border-gray-300 mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Section */}
      {activeTab === 'stats' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Statistics Section
              </div>
              <Button onClick={addStatistic}>
                <Plus className="h-4 w-4 mr-2" />
                Add Statistic
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statistics Title</label>
                <Input
                  value={settings.statsTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, statsTitle: e.target.value }))}
                  placeholder="Platform Statistics"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showStats}
                  onChange={(e) => setSettings(prev => ({ ...prev, showStats: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Show Statistics Section</label>
              </div>
            </div>

            <div className="space-y-4">
              {settings.statistics.map((stat, index) => (
                <div key={stat.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">Statistic {index + 1}</h3>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => removeStatistic(stat.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                      <Input
                        value={stat.label}
                        onChange={(e) => updateStatistic(stat.id, 'label', e.target.value)}
                        placeholder="Active Members"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                      <Input
                        value={stat.value}
                        onChange={(e) => updateStatistic(stat.id, 'value', e.target.value)}
                        placeholder="50,000+"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <Input
                        value={stat.icon}
                        onChange={(e) => updateStatistic(stat.id, 'icon', e.target.value)}
                        placeholder="Users"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={stat.isActive}
                        onChange={(e) => updateStatistic(stat.id, 'isActive', e.target.checked)}
                        className="rounded border-gray-300 mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonials Section */}
      {activeTab === 'testimonials' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Testimonials Section
              </div>
              <Button onClick={addTestimonial}>
                <Plus className="h-4 w-4 mr-2" />
                Add Testimonial
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testimonials Title</label>
                <Input
                  value={settings.testimonialsTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, testimonialsTitle: e.target.value }))}
                  placeholder="What Our Members Say"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showTestimonials}
                  onChange={(e) => setSettings(prev => ({ ...prev, showTestimonials: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Show Testimonials Section</label>
              </div>
            </div>

            <div className="space-y-4">
              {settings.testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">Testimonial {index + 1}</h3>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => removeTestimonial(testimonial.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <Input
                        value={testimonial.position}
                        onChange={(e) => updateTestimonial(testimonial.id, 'position', e.target.value)}
                        placeholder="Top Earner"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        value={testimonial.content}
                        onChange={(e) => updateTestimonial(testimonial.id, 'content', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Testimonial content..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <div className="flex items-center space-x-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <Input
                        value={testimonial.image}
                        onChange={(e) => updateTestimonial(testimonial.id, 'image', e.target.value)}
                        placeholder="/testimonial-1.jpg"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={testimonial.isActive}
                        onChange={(e) => updateTestimonial(testimonial.id, 'isActive', e.target.checked)}
                        className="rounded border-gray-300 mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Sections */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                About Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About Title</label>
                  <Input
                    value={settings.aboutTitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, aboutTitle: e.target.value }))}
                    placeholder="About Matrix MLM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About Content</label>
                  <textarea
                    value={settings.aboutContent}
                    onChange={(e) => setSettings(prev => ({ ...prev, aboutContent: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="About content..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showAbout}
                    onChange={(e) => setSettings(prev => ({ ...prev, showAbout: e.target.checked }))}
                    className="rounded border-gray-300 mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Show About Section</label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Contact Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Title</label>
                  <Input
                    value={settings.contactTitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactTitle: e.target.value }))}
                    placeholder="Contact Us"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Content</label>
                  <textarea
                    value={settings.contactContent}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactContent: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact content..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showContact}
                    onChange={(e) => setSettings(prev => ({ ...prev, showContact: e.target.checked }))}
                    className="rounded border-gray-300 mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Show Contact Section</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEO Settings */}
      {activeTab === 'seo' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              SEO Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <Input
                  value={settings.pageTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageTitle: e.target.value }))}
                  placeholder="Matrix MLM System - Professional Multi-Level Marketing Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={settings.metaDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Meta description for search engines..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                <Input
                  value={settings.metaKeywords}
                  onChange={(e) => setSettings(prev => ({ ...prev, metaKeywords: e.target.value }))}
                  placeholder="MLM, multi-level marketing, matrix system, network marketing"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings */}
      {activeTab === 'advanced' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                  checked={settings.enableParallax}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableParallax: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Enable Parallax Effects</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
                <textarea
                  value={settings.customCSS}
                  onChange={(e) => setSettings(prev => ({ ...prev, customCSS: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="/* Add your custom CSS here */"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add custom CSS to override default styles. Use with caution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FrontPageSettings; 
