import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  X,
  Edit,
  Save,
  User,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Network,
  Award,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Star,
  Users,
  TrendingUp,
  Wallet,
  CreditCard,
  History,
  Eye,
  EyeOff
} from 'lucide-react';

interface Member {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  joinDate: string;
  lastLogin?: string;
  totalEarnings: number;
  matrixPositions: number;
  completedCycles: number;
  referralCount: number;
  sponsorId?: string;
  sponsorUsername?: string;
  tronAddress?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  membershipLevel: 'free' | 'basic' | 'premium' | 'vip';
}

interface MemberDetailsModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (member: Member) => void;
}

const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  member,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  React.useEffect(() => {
    if (member) {
      setEditedMember({ ...member });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSave = async () => {
    try {
      if (editedMember) {
        // await adminApiService.updateUser(member.id, editedMember);
        onUpdate(editedMember);
        toast.success('Member updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    }
  };

  const handleCancel = () => {
    setEditedMember({ ...member });
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'free':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'details', name: 'Details', icon: User },
    { id: 'matrix', name: 'Matrix Positions', icon: Network },
    { id: 'transactions', name: 'Transactions', icon: CreditCard },
    { id: 'bonuses', name: 'Bonuses', icon: Award },
    { id: 'referrals', name: 'Referrals', icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    @{member.username} • {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedMember?.username || ''}
                        onChange={(e) => setEditedMember(prev => prev ? { ...prev, username: e.target.value } : null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">@{member.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedMember?.email || ''}
                        onChange={(e) => setEditedMember(prev => prev ? { ...prev, email: e.target.value } : null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{member.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedMember?.phone || ''}
                        onChange={(e) => setEditedMember(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{member.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedMember?.country || ''}
                        onChange={(e) => setEditedMember(prev => prev ? { ...prev, country: e.target.value } : null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{member.country || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Account Status</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    {isEditing ? (
                      <select
                        value={editedMember?.status || 'active'}
                        onChange={(e) => setEditedMember(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Membership Level</label>
                    {isEditing ? (
                      <select
                        value={editedMember?.membershipLevel || 'free'}
                        onChange={(e) => setEditedMember(prev => prev ? { ...prev, membershipLevel: e.target.value as any } : null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="vip">VIP</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMembershipColor(member.membershipLevel)}`}>
                        {member.membershipLevel}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">KYC Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKycColor(member.kycStatus)}`}>
                      {member.kycStatus}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                    <div className="flex items-center mt-1">
                      {member.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="ml-2 text-sm text-gray-900">
                        {member.emailVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Verified</label>
                    <div className="flex items-center mt-1">
                      {member.phoneVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="ml-2 text-sm text-gray-900">
                        {member.phoneVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Financial Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Earnings</label>
                    <p className="mt-1 text-sm text-gray-900">${member.totalEarnings.toFixed(2)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">TRON Address</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {member.tronAddress || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Matrix Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Matrix Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Matrix Positions</label>
                    <p className="mt-1 text-sm text-gray-900">{member.matrixPositions}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completed Cycles</label>
                    <p className="mt-1 text-sm text-gray-900">{member.completedCycles}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Referral Count</label>
                    <p className="mt-1 text-sm text-gray-900">{member.referralCount}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sponsor</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {member.sponsorUsername ? `@${member.sponsorUsername}` : 'No sponsor'}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900">Timestamps</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Join Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'matrix' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Matrix Positions</h4>
                <p className="text-gray-500">Matrix position details will be displayed here.</p>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Transactions</h4>
                <p className="text-gray-500">Transaction history will be displayed here.</p>
              </div>
            )}

            {activeTab === 'bonuses' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Bonuses</h4>
                <p className="text-gray-500">Bonus history will be displayed here.</p>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Referrals</h4>
                <p className="text-gray-500">Referral network will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsModal; 
