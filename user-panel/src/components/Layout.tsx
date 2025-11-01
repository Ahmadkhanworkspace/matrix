import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  Wallet, 
  LogOut, 
  Settings, 
  BarChart3,
  CreditCard,
  ShoppingCart,
  Users,
  Megaphone,
  ArrowRightLeft,
  Globe,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Menu,
  X,
  ChevronDown,
  Link2,
  Award,
  MessageSquare,
  Trophy
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Withdrawal', href: '/withdrawal', icon: CreditCard },
    { name: 'Purchase Position', href: '/purchase-position', icon: ShoppingCart },
    { name: 'Manage Positions', href: '/manage-positions', icon: BarChart3 },
    { name: 'Referrals', href: '/referrals', icon: Link2 },
    { name: 'Ranks', href: '/ranks', icon: Award },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Gamification', href: '/gamification', icon: Trophy },
    { name: 'Promo Tools', href: '/promo-tools', icon: Megaphone },
    { name: 'Transfer Funds', href: '/transfer-funds', icon: ArrowRightLeft },
    { name: 'Global PIF', href: '/global-pif', icon: Globe },
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'Stats', href: '/stats', icon: TrendingUp },
    { name: 'Next to Cycle', href: '/next-to-cycle', icon: RotateCcw },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="ml-3 text-gray-900 font-semibold">Matrix MLM</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-gray-900 font-medium">{user?.username}</p>
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user?.status === 'pro' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {user?.status === 'pro' ? 'Pro Member' : 'Free Member'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{ textDecoration: 'none' }}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 no-underline ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-black' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="mt-auto pt-4 pb-4 px-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 w-full min-w-0 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-gray-900 text-lg font-semibold">Matrix MLM System</h1>
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-semibold text-sm">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="hidden md:block">{user?.username}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    style={{ textDecoration: 'none', display: 'block' }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 no-underline"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/wallet"
                    style={{ textDecoration: 'none', display: 'block' }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 no-underline"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Wallet
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 md:p-6 min-h-screen bg-gray-50">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 