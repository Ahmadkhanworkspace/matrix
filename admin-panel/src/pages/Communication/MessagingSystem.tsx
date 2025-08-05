import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Users, Send, Inbox, Archive, Search } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Message {
  id: string;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  type: 'internal' | 'announcement' | 'support' | 'leadership' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'archived';
  sendDate: string;
  readDate: string;
  isReply: boolean;
  parentMessageId: string;
  attachments: string[];
  currency: string;
}

interface MessageStats {
  totalMessages: number;
  unreadMessages: number;
  sentMessages: number;
  averageResponseTime: number;
  topSender: string;
  topRecipient: string;
}

const MessagingSystem: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('inbox');
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      subject: 'Welcome to Matrix MLM',
      content: 'Welcome to Matrix MLM! We\'re excited to have you join our community. Please complete your profile and start inviting referrals to begin earning.',
      senderId: 'ADMIN001',
      senderName: 'System Admin',
      recipientId: 'M001',
      recipientName: 'John Smith',
      type: 'system',
      priority: 'high',
      status: 'read',
      sendDate: '2024-01-15 10:30:00',
      readDate: '2024-01-15 11:15:00',
      isReply: false,
      parentMessageId: '',
      attachments: [],
      currency: primaryCurrency
    },
    {
      id: '2',
      subject: 'Bonus Notification - 50 TRX Earned',
      content: 'Congratulations! You have earned a bonus of 50 TRX for completing Matrix Level 1. The bonus has been credited to your wallet.',
      senderId: 'ADMIN001',
      senderName: 'System Admin',
      recipientId: 'M001',
      recipientName: 'John Smith',
      type: 'announcement',
      priority: 'medium',
      status: 'delivered',
      sendDate: '2024-01-16 14:20:00',
      readDate: '',
      isReply: false,
      parentMessageId: '',
      attachments: [],
      currency: primaryCurrency
    },
    {
      id: '3',
      subject: 'Support Request - Matrix Completion Issue',
      content: 'I\'m having trouble completing Matrix Level 2. The system shows I have all positions filled but it\'s not marking as complete. Can you help?',
      senderId: 'M002',
      senderName: 'Sarah Johnson',
      recipientId: 'SUPPORT001',
      recipientName: 'Support Team',
      type: 'support',
      priority: 'high',
      status: 'sent',
      sendDate: '2024-01-17 09:45:00',
      readDate: '',
      isReply: false,
      parentMessageId: '',
      attachments: ['screenshot.png'],
      currency: primaryCurrency
    },
    {
      id: '4',
      subject: 'Leadership Program Invitation',
      content: 'You have been invited to join our Leadership Program. This exclusive program offers additional bonuses and training opportunities.',
      senderId: 'LEADERSHIP001',
      senderName: 'Leadership Team',
      recipientId: 'M003',
      recipientName: 'Mike Davis',
      type: 'leadership',
      priority: 'high',
      status: 'delivered',
      sendDate: '2024-01-18 16:30:00',
      readDate: '',
      isReply: false,
      parentMessageId: '',
      attachments: ['leadership-program.pdf'],
      currency: primaryCurrency
    },
    {
      id: '5',
      subject: 'System Maintenance Notice',
      content: 'Scheduled system maintenance will occur on January 20th from 2-4 AM UTC. Services may be temporarily unavailable during this time.',
      senderId: 'ADMIN001',
      senderName: 'System Admin',
      recipientId: 'ALL',
      recipientName: 'All Members',
      type: 'announcement',
      priority: 'urgent',
      status: 'sent',
      sendDate: '2024-01-19 12:00:00',
      readDate: '',
      isReply: false,
      parentMessageId: '',
      attachments: [],
      currency: primaryCurrency
    }
  ]);

  const [stats, setStats] = useState<MessageStats>({
    totalMessages: 5,
    unreadMessages: 3,
    sentMessages: 8,
    averageResponseTime: 2.5,
    topSender: 'System Admin',
    topRecipient: 'John Smith'
  });

  const [newMessage, setNewMessage] = useState<Partial<Message>>({
    subject: '',
    content: '',
    senderId: 'ADMIN001',
    senderName: 'System Admin',
    recipientId: '',
    recipientName: '',
    type: 'internal',
    priority: 'medium',
    status: 'sent',
    sendDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
    readDate: '',
    isReply: false,
    parentMessageId: '',
    attachments: [],
    currency: primaryCurrency
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleSaveMessage = () => {
    if (editingMessage) {
      setMessages(messages.map(message => message.id === editingMessage.id ? { ...editingMessage } : message));
      setEditingMessage(null);
    } else {
      const message: Message = {
        ...newMessage as Message,
        id: Date.now().toString()
      };
      setMessages([...messages, message]);
      setNewMessage({
        subject: '',
        content: '',
        senderId: 'ADMIN001',
        senderName: 'System Admin',
        recipientId: '',
        recipientName: '',
        type: 'internal',
        priority: 'medium',
        status: 'sent',
        sendDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        readDate: '',
        isReply: false,
        parentMessageId: '',
        attachments: [],
        currency: primaryCurrency
      });
    }
    setShowModal(false);
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setShowModal(true);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(message => message.id !== id));
  };

  const handleReply = (message: Message) => {
    setNewMessage({
      ...newMessage,
      subject: `Re: ${message.subject}`,
      recipientId: message.senderId,
      recipientName: message.senderName,
      parentMessageId: message.id,
      isReply: true
    });
    setShowModal(true);
  };

  const handleMarkAsRead = (id: string) => {
    setMessages(messages.map(message => 
      message.id === id 
        ? { ...message, status: 'read', readDate: new Date().toISOString().slice(0, 19).replace('T', ' ') }
        : message
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'internal': return <MessageSquare className="h-4 w-4" />;
      case 'announcement': return <BarChart3 className="h-4 w-4" />;
      case 'support': return <Users className="h-4 w-4" />;
      case 'leadership': return <Send className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-purple-100 text-purple-800';
      case 'leadership': return 'bg-orange-100 text-orange-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || message.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                Messaging System
              </h1>
              <p className="text-gray-600 mt-2">
                Manage internal messaging, announcements, and member communications
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Message
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Inbox className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sentMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="internal">Internal</option>
                  <option value="announcement">Announcement</option>
                  <option value="support">Support</option>
                  <option value="leadership">Leadership</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'inbox', name: 'Inbox', icon: Inbox },
                { id: 'sent', name: 'Sent', icon: Send },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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

        {/* Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                            {getTypeIcon(message.type)}
                            <span className="ml-1 capitalize">{message.type}</span>
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{message.senderName}</span>
                          <span>{new Date(message.sendDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedMessage.type)}`}>
                          {getTypeIcon(selectedMessage.type)}
                          <span className="ml-1 capitalize">{selectedMessage.type}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                          {selectedMessage.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                          {selectedMessage.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReply(selectedMessage)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditMessage(selectedMessage)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>From: {selectedMessage.senderName}</span>
                      <span>To: {selectedMessage.recipientName}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Sent: {new Date(selectedMessage.sendDate).toLocaleString()}
                      {selectedMessage.readDate && (
                        <span className="ml-4">Read: {new Date(selectedMessage.readDate).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                  {selectedMessage.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                      <div className="space-y-1">
                        {selectedMessage.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                            <span className="underline cursor-pointer">{attachment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedMessage.status !== 'read' && (
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingMessage ? 'Edit Message' : 'New Message'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={editingMessage?.subject || newMessage.subject}
                      onChange={(e) => editingMessage 
                        ? setEditingMessage({...editingMessage, subject: e.target.value})
                        : setNewMessage({...newMessage, subject: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                    <input
                      type="text"
                      value={editingMessage?.recipientName || newMessage.recipientName}
                      onChange={(e) => editingMessage 
                        ? setEditingMessage({...editingMessage, recipientName: e.target.value})
                        : setNewMessage({...newMessage, recipientName: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter recipient name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={editingMessage?.type || newMessage.type}
                      onChange={(e) => editingMessage 
                        ? setEditingMessage({...editingMessage, type: e.target.value as any})
                        : setNewMessage({...newMessage, type: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="internal">Internal</option>
                      <option value="announcement">Announcement</option>
                      <option value="support">Support</option>
                      <option value="leadership">Leadership</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={editingMessage?.priority || newMessage.priority}
                      onChange={(e) => editingMessage 
                        ? setEditingMessage({...editingMessage, priority: e.target.value as any})
                        : setNewMessage({...newMessage, priority: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={editingMessage?.content || newMessage.content}
                      onChange={(e) => editingMessage 
                        ? setEditingMessage({...editingMessage, content: e.target.value})
                        : setNewMessage({...newMessage, content: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={6}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingMessage(null);
                      setNewMessage({
                        subject: '',
                        content: '',
                        senderId: 'ADMIN001',
                        senderName: 'System Admin',
                        recipientId: '',
                        recipientName: '',
                        type: 'internal',
                        priority: 'medium',
                        status: 'sent',
                        sendDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        readDate: '',
                        isReply: false,
                        parentMessageId: '',
                        attachments: [],
                        currency: primaryCurrency
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingMessage ? 'Update' : 'Send'}
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

export default MessagingSystem; 
