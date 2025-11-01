import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { adminApiService } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Award, CheckCircle, X } from 'lucide-react';

interface Rank {
  id: string;
  name: string;
  level: number;
  description: string;
  icon: string;
  color: string;
  requirements: any;
  benefits: any;
  bonuses: any;
  privileges: string[];
  isActive: boolean;
}

const ManageRanks: React.FC = () => {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    requirements: [],
    benefits: [],
    bonuses: {},
    privileges: [] as string[],
    isActive: true
  });

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getRanks();
      if (response.success) {
        setRanks(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching ranks:', error);
      toast.error('Failed to load ranks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRank) {
        const response = await adminApiService.updateRank(editingRank.id, formData);
        if (response.success) {
          toast.success('Rank updated successfully');
          resetForm();
          fetchRanks();
        }
      } else {
        const response = await adminApiService.createRank(formData);
        if (response.success) {
          toast.success('Rank created successfully');
          resetForm();
          fetchRanks();
        }
      }
    } catch (error) {
      toast.error('Failed to save rank');
    }
  };

  const handleDelete = async (rankId: string) => {
    if (!window.confirm('Are you sure you want to delete this rank?')) return;

    try {
      const response = await adminApiService.deleteRank(rankId);
      if (response.success) {
        toast.success('Rank deleted successfully');
        fetchRanks();
      }
    } catch (error) {
      toast.error('Failed to delete rank');
    }
  };

  const handleEdit = (rank: Rank) => {
    setEditingRank(rank);
    setFormData({
      name: rank.name,
      level: rank.level.toString(),
      description: rank.description || '',
      icon: rank.icon || '',
      color: rank.color || '#3B82F6',
      requirements: rank.requirements || [],
      benefits: rank.benefits || [],
      bonuses: rank.bonuses || {},
      privileges: rank.privileges || [],
      isActive: rank.isActive
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      requirements: [],
      benefits: [],
      bonuses: {},
      privileges: [],
      isActive: true
    });
    setEditingRank(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Ranks</h1>
          <p className="text-gray-600">Create and manage user rank levels</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rank
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRank ? 'Edit Rank' : 'Create New Rank'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rank Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Input
                    id="level"
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full border rounded-md p-2"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🏆"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">{editingRank ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ranks List */}
      <Card>
        <CardHeader>
          <CardTitle>All Ranks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : ranks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No ranks created yet</p>
          ) : (
            <div className="space-y-4">
              {ranks
                .sort((a, b) => a.level - b.level)
                .map((rank) => (
                  <div key={rank.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                          style={{ backgroundColor: rank.color || '#3B82F6' }}
                        >
                          {rank.icon || rank.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{rank.name}</h3>
                            <Badge variant="outline">Level {rank.level}</Badge>
                            {rank.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{rank.description}</p>
                          {rank.privileges && rank.privileges.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {rank.privileges.map((priv, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {priv}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(rank)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(rank.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageRanks;

