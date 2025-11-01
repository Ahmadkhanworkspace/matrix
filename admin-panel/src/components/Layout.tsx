import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConnectionStatus from './ConnectionStatus';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  DollarSign, 
  BarChart3,
  FileText,
  Image,
  Palette,
  Globe,
  Bell,
  MessageSquare,
  TrendingUp,
  Wrench,
  CreditCard,
  ShoppingCart,
  Megaphone,
  ArrowLeftRight,
  HelpCircle,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
  Package,
  Store
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      name: 'Settings',
      href: '#',
      icon: Settings,
      dropdown: true,
      children: [
        { name: 'Admin Settings', href: '/admin/settings/admin' },
        { name: 'Matrix Settings', href: '/admin/settings/matrices' },
        { name: 'Email Settings', href: '/admin/settings/emails' },
        { name: 'Payment Gateway Settings', href: '/admin/settings/payment-gateways' },
        { name: 'Appearance Settings', href: '/admin/settings/appearance' },
        { name: 'Template Settings', href: '/admin/settings/templates' },
        { name: 'Front Page Settings', href: '/admin/settings/frontpage' },
      ]
    },
    {
      name: 'Modules',
      href: '#',
      icon: Package,
      dropdown: true,
      children: [
        { name: 'Modules Manager', href: '/admin/modules/manager' },
        { name: 'Module Store', href: '/admin/modules/store' },
      ]
    },
    {
      name: 'Members',
      href: '#',
      icon: Users,
      dropdown: true,
      children: [
        { name: 'Members List', href: '/admin/members/list' },
        { name: 'Free Members', href: '/admin/members/free' },
        { name: 'Pro Members', href: '/admin/members/pro' },
        { name: 'Search Members', href: '/admin/members/search' },
        { name: 'Top Sponsors', href: '/admin/members/top-sponsors' },
        { name: 'Referral Tracker', href: '/admin/members/referral-tracker' },
        { name: 'KYC Verification', href: '/admin/members/kyc' },
        { name: 'Leadership Ranks', href: '/admin/members/leadership-ranks' },
        { name: 'Pending Email Verification', href: '/admin/members/pending-email-verification' },
        { name: 'Manage Ranks', href: '/admin/ranks/manage' },
      ]
    },
    {
      name: 'Positions',
      href: '#',
      icon: BarChart3,
      dropdown: true,
      children: [
        { name: 'Add Member Position', href: '/admin/positions/add-member' },
        { name: 'Pending Transactions', href: '/admin/positions/pending-transactions' },
      ]
    },
    {
      name: 'Financial',
      href: '#',
      icon: DollarSign,
      dropdown: true,
      children: [
        { name: 'Withdrawals', href: '/admin/financial/withdrawals' },
        { name: 'Payments', href: '/admin/financial/payments' },
        { name: 'Deposits', href: '/admin/financial/deposits' },
        { name: 'Pending Transactions', href: '/admin/financial/pending-transactions' },
        { name: 'Add E-Wallet Transaction', href: '/admin/financial/add-ewallet-transaction' },
        { name: 'E-Wallet Transactions', href: '/admin/financial/ewallet-transactions' },
        { name: 'Commission Calculator', href: '/admin/financial/commission-calculator' },
        { name: 'Bonus System Manager', href: '/admin/financial/bonus-system' },
        { name: 'Fast Start Bonus', href: '/admin/financial/fast-start-bonus' },
      ]
    },
    {
      name: 'Banner & Text Ads',
      href: '#',
      icon: Megaphone,
      dropdown: true,
      children: [
        { name: 'Add Banner', href: '/admin/banner-ads/add-banner' },
        { name: 'Approved Banners', href: '/admin/banner-ads/approved-banners' },
        { name: 'Pending Banners', href: '/admin/banner-ads/pending-banners' },
        { name: 'Add Text Ad', href: '/admin/banner-ads/add-text-ad' },
        { name: 'Approved Text Ads', href: '/admin/banner-ads/approved-text-ads' },
        { name: 'Pending Text Ads', href: '/admin/banner-ads/pending-text-ads' },
      ]
    },
    {
      name: 'Matrix',
      href: '#',
      icon: BarChart3,
      dropdown: true,
      children: [
        { name: 'Matrix Overview', href: '/admin/matrix/overview' },
        { name: 'Matrix Positions', href: '/admin/matrix/positions' },
        { name: 'Matrix Cycles', href: '/admin/matrix/cycles' },
        { name: 'Spillover Manager', href: '/admin/matrix/spillover' },
        { name: 'Matrix Position Manager', href: '/admin/matrix/position-manager' },
        { name: 'Matrix Cycle Manager', href: '/admin/matrix/cycle-manager' },
      ]
    },
    {
      name: 'Communication',
      href: '#',
      icon: MessageSquare,
      dropdown: true,
      children: [
        { name: 'Email Users', href: '/admin/communication/email-users' },
        { name: 'Global PIF Logs', href: '/admin/communication/global-pif-logs' },
        { name: 'Message History', href: '/admin/communication/message-history' },
        { name: 'Notification Manager', href: '/admin/communication/notification-manager' },
        { name: 'Messaging System', href: '/admin/communication/messaging-system' },
        { name: 'Announcement Manager', href: '/admin/communication/announcement-manager' },
      ]
    },
    {
      name: 'Content',
      href: '#',
      icon: FileText,
      dropdown: true,
      children: [
        { name: 'Promotional Content Manager', href: '/admin/content/promotional-content' },
        { name: 'Email Template Manager', href: '/admin/content/email-templates' },
        { name: 'Banner Manager', href: '/admin/content/banner-manager' },
        { name: 'Email Campaigns', href: '/admin/email-campaigns' },
        { name: 'Campaign Analytics', href: '/admin/email-campaigns/analytics' },
      ]
    },
    {
      name: 'Analytics',
      href: '#',
      icon: TrendingUp,
      dropdown: true,
      children: [
        { name: 'Analytics Dashboard', href: '/admin/analytics/dashboard' },
        { name: 'Reporting System', href: '/admin/analytics/reporting' },
        { name: 'Data Visualization', href: '/admin/analytics/visualization' },
      ]
    },
    {
      name: 'Tools',
      href: '#',
      icon: Wrench,
      dropdown: true,
      children: [
        { name: 'Database Backup', href: '/admin/tools/database-backup' },
        { name: 'File Manager', href: '/admin/tools/file-manager' },
        { name: 'Promotional Banners', href: '/admin/tools/promotional-banners' },
        { name: 'Promotional Lead Pages', href: '/admin/tools/promotional-lead-pages' },
        { name: 'Promotional Solo Ads', href: '/admin/tools/promotional-solo-ads' },
        { name: 'Promotional Splash Pages', href: '/admin/tools/promotional-splash-pages' },
        { name: 'System Update', href: '/admin/tools/system-update' },
        { name: 'Testimonials Approved', href: '/admin/tools/testimonials-approved' },
        { name: 'Testimonials Pending', href: '/admin/tools/testimonials-pending' },
        { name: 'Contests', href: '/admin/tools/contests' },
        { name: 'Digital Products', href: '/admin/tools/digital-products' },
        { name: 'Email Validation', href: '/admin/tools/email-validation' },
        { name: 'Feedback Surveys', href: '/admin/tools/feedback-surveys' },
        { name: 'List Management', href: '/admin/tools/list-management' },
        { name: 'Marketing Tools', href: '/admin/tools/marketing-tools' },
        { name: 'Mobile App', href: '/admin/tools/mobile-app' },
        { name: 'Push Notifications', href: '/admin/tools/push-notifications' },
        { name: 'Instructions', href: '/admin/tools/instructions' },
        { name: 'Progressive Web App', href: '/admin/tools/progressive-web-app' },
        { name: 'Reset Cron Tasks', href: '/admin/tools/reset-cron-tasks' },
        { name: 'Training Video', href: '/admin/tools/training-video' },
        { name: 'White-Label', href: '/admin/white-label' },
        { name: 'Gamification', href: '/admin/gamification/manage' },
      ]
    },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdowns(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const isDropdownActive = (item: any) => {
    if (!item.children) return false;
    return item.children.some((child: any) => isActive(child.href));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="ml-3 text-white font-semibold">Matrix MLM</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.username?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-gray-900 font-medium">{user?.username || 'Admin'}</p>
              <p className="text-gray-500 text-sm">Administrator</p>
            </div>
            <ConnectionStatus />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden bg-white">
            {navigation.map((item) => (
              <div key={item.name} className="min-w-0">
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                        isDropdownActive(item) || openDropdowns.includes(item.name)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ease-in-out ${openDropdowns.includes(item.name) ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ease-in-out bg-white ${
                      openDropdowns.includes(item.name) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="ml-4 mt-2 space-y-1 pb-2 bg-white">
                        {item.children?.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              isActive(child.href)
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Matrix MLM Admin</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, {user?.username || 'Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 
