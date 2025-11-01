import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { List, Plus, Edit, Trash2, Users, Mail, Download, Upload, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailList {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

const ListManagement: React.FC = () => {
  const [lists, setLists] = useState<EmailList[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleCreateList = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    const newList: EmailList = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      memberCount: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setLists([...lists, newList]);
    setFormData({ name: '', description: '' });
    setShowCreateModal(false);
    toast.success('Email list created successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email List Management</h1>
          <p className="text-gray-600">Create and manage email lists for marketing campaigns</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create List
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lists</p>
                <p className="text-2xl font-bold">{lists.length}</p>
              </div>
              <List className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Lists</p>
                <p className="text-2xl font-bold">
                  {lists.filter(l => l.status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">
                  {lists.reduce((sum, l) => sum + l.memberCount, 0)}
                </p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. List Size</p>
                <p className="text-2xl font-bold">
                  {lists.length > 0
                    ? Math.round(lists.reduce((sum, l) => sum + l.memberCount, 0) / lists.length)
                    : 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <List className="h-5 w-5 mr-2" />
            Email Lists ({lists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lists.length > 0 ? (
            <div className="space-y-2">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <List className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{list.name}</h3>
                        <Badge className={list.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {list.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{list.description || 'No description'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{list.memberCount} members</span>
                        <span>Created: {new Date(list.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-1" />
                        Members
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No email lists created yet</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First List
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Email List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter list name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateList} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ListManagement;