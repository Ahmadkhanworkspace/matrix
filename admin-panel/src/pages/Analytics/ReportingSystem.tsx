import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'financial' | 'user' | 'matrix' | 'custom';
  dateRange: string;
  filters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  downloadUrl?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: string[];
  isActive: boolean;
}

const ReportingSystem: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('reports');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Member Report - January 2024',
      type: 'user',
      dateRange: '2024-01-01 to 2024-01-31',
      filters: {
        memberTypes: 'all',
        includeInactive: false
      },
      format: 'pdf',
      status: 'completed',
      createdAt: '2024-01-31 23:59:00',
      downloadUrl: '/reports/monthly-member-jan-2024.pdf'
    },
    {
      id: '2',
      name: 'Financial Performance Report - Q4 2023',
      type: 'financial',
      dateRange: '2023-10-01 to 2023-12-31',
      filters: {
        includePending: true,
        currency: primaryCurrency
      },
      format: 'pdf',
      status: 'completed',
      createdAt: '2024-01-15 10:00:00',
      downloadUrl: '/reports/financial-q4-2023.pdf'
    },
    {
      id: '3',
      name: 'Matrix Completion Analysis',
      type: 'matrix',
      dateRange: '2024-01-01 to 2024-01-31',
      filters: {
        levels: 'all',
        includeSpillover: true
      },
      format: 'pdf',
      status: 'completed',
      createdAt: '2024-01-20 14:30:00',
      downloadUrl: '/reports/matrix-completion-analysis.pdf'
    },
    {
      id: '4',
      name: 'System Performance Report',
      type: 'custom',
      dateRange: '2023-12-20 to 2024-01-19',
      filters: {
        includeErrors: true,
        includeBackups: true
      },
      format: 'pdf',
      status: 'pending',
      createdAt: '2024-01-19 16:00:00'
    },
    {
      id: '5',
      name: 'Bonus Distribution Report',
      type: 'custom',
      dateRange: '2024-01-01 to 2024-01-31',
      filters: {
        bonusTypes: 'all',
        includeInactive: false
      },
      format: 'pdf',
      status: 'completed',
      createdAt: '2024-01-18 09:00:00',
      downloadUrl: '/reports/bonus-distribution-jan-2024.pdf'
    }
  ]);

  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Monthly Member Report',
      type: 'user',
      description: 'Standard monthly report for member statistics and growth',
      parameters: ['dateRange', 'memberTypes', 'includeInactive'],
      isActive: true
    },
    {
      id: '2',
      name: 'Financial Performance Report',
      type: 'financial',
      description: 'Comprehensive financial analysis with earnings and payout data',
      parameters: ['dateRange', 'includePending', 'currency'],
      isActive: true
    },
    {
      id: '3',
      name: 'Matrix Completion Report',
      type: 'matrix',
      description: 'Matrix performance analysis with completion rates and levels',
      parameters: ['dateRange', 'levels', 'includeSpillover'],
      isActive: true
    },
    {
      id: '4',
      name: 'System Health Report',
      type: 'custom',
      description: 'System performance and health metrics',
      parameters: ['dateRange', 'includeErrors', 'includeBackups'],
      isActive: true
    },
    {
      id: '5',
      name: 'Bonus Distribution Report',
      type: 'custom',
      description: 'Bonus analysis across different types and categories',
      parameters: ['dateRange', 'bonusTypes', 'includeInactive'],
      isActive: true
    }
  ]);

  const [newReport, setNewReport] = useState<Partial<Report>>({
    name: '',
    type: 'user',
    dateRange: 'last30days',
    filters: {},
    format: 'pdf'
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportParameters, setReportParameters] = useState<{ [key: string]: any }>({});

  const handleGenerateReport = () => {
    const report: Report = {
      ...newReport as Report,
      id: Date.now().toString()
    };
    setReports([...reports, report]);
    setNewReport({
      name: '',
      description: '',
      type: 'financial',
      dateRange: 'last30days',
      filters: {},
      format: 'pdf',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    toast.success('Report generated successfully');
  };

  const handleDownloadReport = (report: Report) => {
    // Simulate download
    console.log(`Downloading report: ${report.name}`);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(report => report.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'matrix': return <BarChart3 className="h-4 w-4" />;
      case 'custom': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'matrix': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FileText className="h-4 w-4" />;
      case 'pending': return <BarChart3 className="h-4 w-4" />;
      case 'failed': return <Trash2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                Reporting System
              </h1>
              <p className="text-gray-600 mt-2">
                Generate and manage comprehensive reports for members, finances, and system performance
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'reports', name: 'Reports', icon: FileText },
                { id: 'templates', name: 'Templates', icon: FileText },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option value="all">All Types</option>
                    <option value="user">Member</option>
                    <option value="financial">Financial</option>
                    <option value="matrix">Matrix</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.name}</div>
                          <div className="text-sm text-gray-500">{report.dateRange}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                          {getTypeIcon(report.type)}
                          <span className="ml-1 capitalize">{report.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">{report.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.downloadUrl ? 'Available' : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {report.status === 'completed' && (
                            <>
                              <button
                                onClick={() => handleViewReport(report)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadReport(report)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                          {getTypeIcon(template.type)}
                          <span className="ml-1 capitalize">{template.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {template.parameters.length} parameters
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Use Template
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.status === 'completed').length}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Templates</p>
                  <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types Distribution</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Report types chart</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Generation Trend</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Generation trend chart</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Report Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                    <p className="text-sm text-gray-900">{selectedReport.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <p className="text-sm text-gray-900">{selectedReport.dateRange}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedReport.type)}`}>
                      {getTypeIcon(selectedReport.type)}
                      <span className="ml-1 capitalize">{selectedReport.type}</span>
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                      {getStatusIcon(selectedReport.status)}
                      <span className="ml-1 capitalize">{selectedReport.status}</span>
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parameters</label>
                    <div className="text-sm text-gray-900">
                      {Object.entries(selectedReport.filters).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Download</label>
                    <p className="text-sm text-gray-900">
                      {selectedReport.downloadUrl ? (
                        <a href={selectedReport.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Download Report
                        </a>
                      ) : (
                        'Report not yet available'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedReport.status === 'completed' && selectedReport.downloadUrl && (
                    <button
                      onClick={() => handleDownloadReport(selectedReport)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Report Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Report</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                    <input
                      type="text"
                      value={newReport.name}
                      onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter report name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select
                      value={newReport.type}
                      onChange={(e) => setNewReport({...newReport, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">Member Report</option>
                      <option value="financial">Financial Report</option>
                      <option value="matrix">Matrix Report</option>
                      <option value="custom">Custom Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter report description"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTemplate('');
                      setNewReport({
                        name: '',
                        type: 'user',
                        dateRange: 'last30days',
                        filters: {},
                        format: 'pdf'
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportingSystem; 
