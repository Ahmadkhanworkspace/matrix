import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error } = useQuery(
    ['users', currentPage, searchTerm, statusFilter],
    () => adminService.getUsers({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: statusFilter,
    })
  );

  const activateUserMutation = useMutation(
    (userId: string) => adminService.activateUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User activated successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to activate user');
      },
    }
  );

  const suspendUserMutation = useMutation(
    (userId: string) => adminService.suspendUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User suspended successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to suspend user');
      },
    }
  );

  const deleteUserMutation = useMutation(
    (userId: string) => adminService.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to delete user');
      },
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleActivate = (userId: string) => {
    if (window.confirm('Are you sure you want to activate this user?')) {
      activateUserMutation.mutate(userId);
    }
  };

  const handleSuspend = (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      suspendUserMutation.mutate(userId);
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <button className="btn btn-primary flex items-center">
          <Plus size={16} className="mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Member Type</th>
                <th>Total Earnings</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.data.map((user: any) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-900">{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.status === 'active' ? 'badge-success' :
                      user.status === 'suspended' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="text-gray-900">{user.memberType}</td>
                  <td className="text-gray-900">${user.totalEarnings.toLocaleString()}</td>
                  <td className="text-gray-500">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* View user details */}}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {/* Edit user */}}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      {user.status === 'suspended' ? (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Activate User"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(user.id)}
                          className="p-1 text-gray-400 hover:text-yellow-600"
                          title="Suspend User"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((usersData.pagination.page - 1) * usersData.pagination.limit) + 1} to{' '}
                {Math.min(usersData.pagination.page * usersData.pagination.limit, usersData.pagination.total)} of{' '}
                {usersData.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {usersData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === usersData.pagination.totalPages}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users; 
