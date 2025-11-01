import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { apiService } from '../api/api';
import toast from 'react-hot-toast';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Copy,
  Link as LinkIcon,
  X
} from 'lucide-react';

interface SocialShareProps {
  url: string;
  title?: string;
  description?: string;
  content?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title, description, content }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiService.getPostTemplates();
      if (response.success) {
        setTemplates(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleShare = async (platform: string) => {
    try {
      const response = await apiService.shareContent({
        platform,
        url,
        title,
        description,
        content
      });

      if (response.success) {
        window.open(response.data.shareUrl, '_blank', 'width=600,height=400');
      }
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const handleGeneratePost = async (templateId: string) => {
    try {
      const response = await apiService.generatePost({
        templateId,
        variables: {
          url,
          title,
          description
        }
      });

      if (response.success) {
        const { shareUrl } = response.data;
        if (shareUrl) {
          window.open(shareUrl, '_blank');
        } else {
          toast.success('Post content generated!');
        }
      }
    } catch (error) {
      toast.error('Failed to generate post');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const platforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600', platform: 'facebook' },
    { name: 'Twitter', icon: Twitter, color: 'bg-sky-500', platform: 'twitter' },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', platform: 'linkedin' },
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500', platform: 'whatsapp' },
    { name: 'Email', icon: Mail, color: 'bg-gray-600', platform: 'email' },
  ];

  return (
    <>
      <Button onClick={() => setShowShareMenu(true)} variant="outline">
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {showShareMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Share Content</CardTitle>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Share Buttons */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Share</p>
                <div className="grid grid-cols-3 gap-2">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <button
                        key={platform.platform}
                        onClick={() => handleShare(platform.platform)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${platform.color} text-white hover:opacity-90 transition-opacity`}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs">{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Link Copy */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Or copy link</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                  />
                  <Button onClick={copyToClipboard} size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Post Templates */}
              {templates.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Use Template</p>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      if (e.target.value) {
                        handleGeneratePost(e.target.value);
                      }
                    }}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SocialShare;

