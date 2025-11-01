import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiService } from '../api/api';
import toast from 'react-hot-toast';
import {
  Users,
  ChevronDown,
  ChevronRight,
  User,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter
} from 'lucide-react';

interface TreeNode {
  id: string;
  username: string;
  email: string;
  status: string;
  totalEarnings: number;
  memberType: string;
  level: number;
  children?: TreeNode[];
  referralCount?: number;
}

const DownlineTree: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [depth, setDepth] = useState(5);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  useEffect(() => {
    fetchDownlineTree();
  }, [depth]);

  const fetchDownlineTree = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDownlineTree(depth);
      if (response.success) {
        setTreeData(response.data || null);
        // Auto-expand first level
        if (response.data?.children) {
          const firstLevelIds = response.data.children.map((child: TreeNode) => child.id);
          setExpandedNodes(new Set(firstLevelIds));
        }
      }
    } catch (error) {
      console.error('Error fetching downline tree:', error);
      toast.error('Failed to load downline tree');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 24;

    if (searchQuery && !node.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !hasMatchingChildren(node, searchQuery)) {
      return null;
    }

    return (
      <div key={node.id} className="relative">
        <div
          className={`flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
            selectedNode?.id === node.id ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ marginLeft: `${indent}px` }}
          onClick={() => setSelectedNode(node)}
        >
          <div className="flex items-center space-x-2 flex-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-6"></div>
            )}
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 truncate">{node.username}</span>
                {node.status === 'active' ? (
                  <Badge className="bg-green-600">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {node.memberType === 'pro' && (
                  <Badge className="bg-purple-600">Pro</Badge>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Level {node.level} • {node.referralCount || 0} referrals • ${parseFloat(node.totalEarnings.toString()).toFixed(2)} earned
              </div>
            </div>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-6 border-l-2 border-gray-200">
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const hasMatchingChildren = (node: TreeNode, query: string): boolean => {
    if (!node.children) return false;
    return node.children.some(child => 
      child.username.toLowerCase().includes(query.toLowerCase()) || 
      hasMatchingChildren(child, query)
    );
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (node: TreeNode) => {
      if (node.children && node.children.length > 0) {
        allIds.add(node.id);
        node.children.forEach(collectIds);
      }
    };
    if (treeData) {
      collectIds(treeData);
      setExpandedNodes(allIds);
    }
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Downline Tree</h1>
          <p className="text-gray-600">Visualize your referral network</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Depth</label>
              <select
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                className="border rounded-md px-3 py-2"
              >
                <option value={3}>3 Levels</option>
                <option value={5}>5 Levels</option>
                <option value={7}>7 Levels</option>
                <option value={10}>10 Levels</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                disabled={zoom >= 2}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tree View */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Referral Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                className="overflow-auto max-h-[600px]"
              >
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading tree...</p>
                  </div>
                ) : !treeData ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No downline data available</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {/* Root Node */}
                    <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg text-gray-900">{treeData.username}</span>
                          <Badge className="bg-blue-600">You</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {treeData.referralCount || 0} direct referrals • {treeData.children?.length || 0} first level
                        </div>
                      </div>
                    </div>
                    {/* Children */}
                    {treeData.children?.map((child) => renderTreeNode(child, 0))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Member Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{selectedNode.username}</h3>
                    <p className="text-sm text-gray-600">{selectedNode.email}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={selectedNode.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                        {selectedNode.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Type:</span>
                      <Badge className={selectedNode.memberType === 'pro' ? 'bg-purple-600' : 'bg-gray-600'}>
                        {selectedNode.memberType}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{selectedNode.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earnings:</span>
                      <span className="font-medium">${parseFloat(selectedNode.totalEarnings.toString()).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referrals:</span>
                      <span className="font-medium">{selectedNode.referralCount || 0}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a member to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DownlineTree;

