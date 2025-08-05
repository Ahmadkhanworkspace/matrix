import React, { useState, useEffect } from 'react';
import { Shield, UserCheck, UserX, Clock, CheckCircle, XCircle, Eye, Edit, Trash2, Download, Filter, Search, AlertTriangle, FileText, Camera, Upload } from 'lucide-react';

interface KYCApplication {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submissionDate: string;
  reviewDate?: string;
  reviewerId?: string;
  reviewerName?: string;
  documents: KYCDocument[];
  personalInfo: PersonalInfo;
  verificationNotes?: string;
  rejectionReason?: string;
}

interface KYCDocument {
  id: string;
  type: 'id_card' | 'passport' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  reviewDate?: string;
  reviewerNotes?: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  idNumber: string;
  idType: string;
}

const KYCVerification: React.FC = () => {
  const [applications, setApplications] = useState<KYCApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for demonstration
  const mockApplications: KYCApplication[] = [
    {
      id: '1',
      memberId: 'M001',
      memberName: 'John Doe',
      memberEmail: 'john@example.com',
      status: 'pending',
      submissionDate: '2024-01-15',
      documents: [
        {
          id: '1',
          type: 'id_card',
          name: 'National ID Card',
          status: 'pending',
          uploadDate: '2024-01-15'
        },
        {
          id: '2',
          type: 'utility_bill',
          name: 'Electricity Bill',
          status: 'pending',
          uploadDate: '2024-01-15'
        }
      ],
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-05-15',
        nationality: 'USA',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
        phone: '+1234567890',
        idNumber: 'ID123456789',
        idType: 'National ID'
      }
    },
    {
      id: '2',
      memberId: 'M002',
      memberName: 'Jane Smith',
      memberEmail: 'jane@example.com',
      status: 'approved',
      submissionDate: '2024-01-10',
      reviewDate: '2024-01-12',
      reviewerId: 'R001',
      reviewerName: 'Admin User',
      documents: [
        {
          id: '3',
          type: 'passport',
          name: 'Passport',
          status: 'approved',
          uploadDate: '2024-01-10',
          reviewDate: '2024-01-12'
        }
      ],
      personalInfo: {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-08-20',
        nationality: 'Canada',
        address: '456 Oak Ave',
        city: 'Toronto',
        country: 'Canada',
        postalCode: 'M5V 3A8',
        phone: '+1987654321',
        idNumber: 'PASS987654321',
        idType: 'Passport'
      }
    }
  ];

  useEffect(() => {
    loadApplications();
  }, [currentPage, searchTerm, statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setApplications(mockApplications);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string, notes?: string) => {
    const updatedApplications = applications.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: newStatus as any,
          reviewDate: new Date().toISOString().split('T')[0],
          reviewerId: 'R001', // Current admin
          reviewerName: 'Admin User',
          verificationNotes: notes,
          ...(newStatus === 'rejected' && { rejectionReason: notes })
        };
      }
      return app;
    });
    setApplications(updatedApplications);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'id_card': return Shield;
      case 'passport': return FileText;
      case 'drivers_license': return Shield;
      case 'utility_bill': return FileText;
      case 'bank_statement': return FileText;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600">Manage Know Your Customer verification process</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-2 inline" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-500 text-white">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">KYC Applications</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{application.memberName}</div>
                      <div className="text-sm text-gray-500">{application.memberEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {application.documents.map((doc) => {
                        const Icon = getDocumentTypeIcon(doc.type);
                        return (
                          <div key={doc.id} className="relative">
                            <div className={`p-1 rounded-full ${getDocumentStatusColor(doc.status)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {doc.status === 'rejected' && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.submissionDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.reviewerName ? (
                      <div>
                        <div className="text-sm text-gray-900">{application.reviewerName}</div>
                        <div className="text-xs text-gray-500">{application.reviewDate}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not reviewed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedApplication(application.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(application.id, 'approved', 'Documents verified successfully')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusChange(application.id, 'rejected', 'Documents do not meet requirements')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">KYC Application Details</h3>
              <button 
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {(() => {
              const app = applications.find(a => a.id === selectedApplication);
              if (!app) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {app.personalInfo.firstName} {app.personalInfo.lastName}</div>
                        <div><span className="font-medium">Email:</span> {app.memberEmail}</div>
                        <div><span className="font-medium">Phone:</span> {app.personalInfo.phone}</div>
                        <div><span className="font-medium">Date of Birth:</span> {app.personalInfo.dateOfBirth}</div>
                        <div><span className="font-medium">Nationality:</span> {app.personalInfo.nationality}</div>
                        <div><span className="font-medium">Address:</span> {app.personalInfo.address}, {app.personalInfo.city}, {app.personalInfo.country}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      <div className="space-y-2">
                        {app.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              <span className="text-sm">{doc.name}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDocumentStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {app.verificationNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Verification Notes</h4>
                      <p className="text-sm text-gray-600">{app.verificationNotes}</p>
                    </div>
                  )}
                  
                  {app.rejectionReason && (
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">Rejection Reason</h4>
                      <p className="text-sm text-red-600">{app.rejectionReason}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCVerification; 
