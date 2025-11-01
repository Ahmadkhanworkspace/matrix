import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { adminApiService } from '../../api/adminApi';
import toast from 'react-hot-toast';
import {
  Trophy,
  Star,
  Target,
  Gift,
  Plus,
  Edit,
  Trash2,
  Award,
  Coins,
  Users,
  DollarSign
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirementType: string;
  requirementValue: number;
  isActive: boolean;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  requirements: any;
  reward: any;
  isActive: boolean;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: string;
  quantity: number;
  remaining: number;
  isActive: boolean;
}

const ManageGamification: React.FC = () => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'achievement' | 'challenge' | 'reward'>('achievement');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'achievements') {
        const response = await adminApiService.getAchievements();
        if (response.success) {
          setAchievements(response.data || []);
        }
      }
      // Challenges and rewards would be fetched similarly
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (type: 'achievement' | 'challenge' | 'reward') => {
    setFormType(type);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      category: '',
      points: 0,
      requirementType: '',
      requirementValue: 0,
      isActive: true
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      // Implement save logic based on formType
      toast.success(`${formType} ${editingItem ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(`Failed to save ${formType}`);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gamification Management</h1>
          <p className="text-gray-600">Manage achievements, challenges, and rewards</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleCreate('achievement')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Achievement
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : achievements.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No achievements created</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-2xl">{achievement.icon || '🏆'}</span>
                            </div>
                            <div>
                              <CardTitle className="text-lg">{achievement.name}</CardTitle>
                              <p className="text-sm text-gray-600">{achievement.category}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-4">{achievement.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge>{achievement.points} points</Badge>
                          {achievement.isActive ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => {}}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleCreate('challenge')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Challenges management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleCreate('reward')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Reward
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Rewards Shop</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Rewards management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingItem ? 'Edit' : 'Create'} {formType.charAt(0).toUpperCase() + formType.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full border rounded-md p-2"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                {formType === 'achievement' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="icon">Icon (Emoji)</Label>
                        <Input
                          id="icon"
                          value={formData.icon || ''}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          placeholder="🏆"
                        />
                      </div>
                      <div>
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          value={formData.points || 0}
                          onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive !== undefined ? formData.isActive : true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex space-x-2">
                  <Button type="button" onClick={handleSave}>Save</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageGamification;

