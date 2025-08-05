import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  MessageCircle, 
  HelpCircle, 
  Mail, 
  Phone, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  FileText,
  Video,
  BookOpen
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  lastUpdated: string;
  messages: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'contact'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      subject: 'Payment withdrawal issue',
      status: 'in-progress',
      priority: 'high',
      category: 'Payments',
      createdAt: '2024-01-10',
      lastUpdated: '2024-01-12',
      messages: 3
    },
    {
      id: '2',
      subject: 'Matrix position placement',
      status: 'open',
      priority: 'medium',
      category: 'Matrix',
      createdAt: '2024-01-11',
      lastUpdated: '2024-01-11',
      messages: 1
    },
    {
      id: '3',
      subject: 'Account verification',
      status: 'resolved',
      priority: 'low',
      category: 'Account',
      createdAt: '2024-01-08',
      lastUpdated: '2024-01-09',
      messages: 2
    }
  ]);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I withdraw my earnings?',
      answer: 'You can withdraw your earnings from the Wallet page. Click on "Withdraw" and enter the amount you wish to withdraw. Withdrawals are processed within 24-48 hours.',
      category: 'Payments'
    },
    {
      id: '2',
      question: 'How does the matrix system work?',
      answer: 'The matrix system is a 3x3 structure where each level must be filled before moving to the next. When a level is complete, you cycle and earn bonuses.',
      category: 'Matrix'
    },
    {
      id: '3',
      question: 'How do I refer new members?',
      answer: 'Share your referral link with potential members. When they register using your link, they become part of your downline and you earn referral bonuses.',
      category: 'Referrals'
    },
    {
      id: '4',
      question: 'What are the minimum withdrawal amounts?',
      answer: 'The minimum withdrawal amount is $50 for most payment methods. Some methods may have different minimums.',
      category: 'Payments'
    },
    {
      id: '5',
      question: 'How long does it take to process payments?',
      answer: 'Deposits are usually processed instantly. Withdrawals take 24-48 hours for processing and approval.',
      category: 'Payments'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600">Get help with your account and transactions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">Active support requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'in-progress').length}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</div>
            <p className="text-xs text-muted-foreground">Successfully resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'tickets' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('tickets')}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Support Tickets
        </Button>
        <Button
          variant={activeTab === 'faq' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('faq')}
          className="flex-1"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          FAQ
        </Button>
        <Button
          variant={activeTab === 'contact' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('contact')}
          className="flex-1"
        >
          <Mail className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'tickets' && (
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                  <p className="text-gray-500">You haven't created any support tickets yet.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {ticket.subject}
                          </h3>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Category: {ticket.category} • Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last updated: {new Date(ticket.lastUpdated).toLocaleDateString()} • {ticket.messages} messages
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {ticket.status === 'open' && (
                          <Button size="sm">
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{faq.answer}</p>
                  <Badge variant="secondary">{faq.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-gray-600">support@matrixmlm.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Phone Support</div>
                  <div className="text-sm text-gray-600">+1 (555) 123-4567</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Support Hours</div>
                  <div className="text-sm text-gray-600">24/7 Online Support</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Download User Manual
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Watch Tutorial Videos
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Read Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Support; 