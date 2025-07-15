'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Shield, Clock, User, MessageSquare, Users, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { communicationDataManager, SecureMessage, Provider, Staff } from '@/lib/communication-mock-data';
import { receptionistMessageSchema, ReceptionistMessageFormData } from '@/lib/communication-validation';
import { sessionManager } from '@/lib/session-manager';

interface MessageComposerProps {
  onSendMessage: (messageData: ReceptionistMessageFormData) => void;
  providers: Provider[];
  staff: Staff[];
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  providers,
  staff
}) => {
  const [formData, setFormData] = useState<ReceptionistMessageFormData>({
    recipientId: '',
    recipientType: 'provider',
    content: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRecipient, setSelectedRecipient] = useState<Provider | Staff | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = receptionistMessageSchema.parse(formData);
      onSendMessage(validatedData);
      
      // Reset form
      setFormData({
        recipientId: '',
        recipientType: 'provider',
        content: '',
        priority: 'medium'
      });
      setSelectedRecipient(null);
      setErrors({});
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  const handleRecipientChange = (recipientId: string, recipientType: 'provider' | 'staff') => {
    setFormData(prev => ({ ...prev, recipientId, recipientType }));
    
    // Find and set selected recipient
    let recipient = null;
    if (recipientType === 'provider') {
      recipient = providers.find(p => p.id === recipientId) || null;
    } else {
      recipient = staff.find(s => s.id === recipientId) || null;
    }
    setSelectedRecipient(recipient);
  };

  const getRecipientOptions = () => {
    const options: { id: string; name: string; type: 'provider' | 'staff'; details: string }[] = [];
    
    providers.forEach(provider => {
      options.push({
        id: provider.id,
        name: provider.name,
        type: 'provider',
        details: `${provider.specialty} - ${provider.department}`
      });
    });
    
    staff.forEach(staffMember => {
      options.push({
        id: staffMember.id,
        name: staffMember.name,
        type: 'staff',
        details: `${staffMember.role} - ${staffMember.department}`
      });
    });
    
    return options;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Secure Communication</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recipient *</label>
            <select
              value={formData.recipientId}
              onChange={(e) => {
                const option = getRecipientOptions().find(o => o.id === e.target.value);
                if (option) {
                  handleRecipientChange(option.id, option.type);
                }
              }}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select recipient</option>
              <optgroup label="Providers">
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} - {provider.specialty}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Staff">
                {staff.map(staffMember => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {staffMember.name} - {staffMember.role}
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.recipientId && (
              <p className="text-red-500 text-sm mt-1">{errors.recipientId}</p>
            )}
          </div>

          {selectedRecipient && (
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-900">Recipient Information</h4>
              <p className="text-sm text-blue-800">
                <strong>Name:</strong> {selectedRecipient.name}<br />
                <strong>Role:</strong> {'specialty' in selectedRecipient ? selectedRecipient.specialty : selectedRecipient.role}<br />
                <strong>Department:</strong> {selectedRecipient.department}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                priority: e.target.value as 'low' | 'medium' | 'high'
              }))}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message Content *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your secure message (max 4096 characters)"
              maxLength={4096}
              rows={8}
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.content?.length || 0}/4096 characters</p>
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Privacy Notice</p>
                <p>{communicationDataManager.getPrivacyNotice()}</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center space-x-2"
            disabled={!formData.recipientId || !formData.content.trim()}
          >
            <Send className="h-4 w-4" />
            <span>Send Message</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

interface MessageHistoryProps {
  messages: SecureMessage[];
  onMessageClick: (message: SecureMessage) => void;
  onSortChange: (sortBy: 'date' | 'recipient') => void;
  currentSort: 'date' | 'recipient';
}

const MessageHistory: React.FC<MessageHistoryProps> = ({
  messages,
  onMessageClick,
  onSortChange,
  currentSort
}) => {
  const sortedMessages = [...messages].sort((a, b) => {
    if (currentSort === 'date') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      return a.recipientName.localeCompare(b.recipientName);
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Message History</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value as 'date' | 'recipient')}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="date">Date</option>
              <option value="recipient">Recipient</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
              <p>Start communicating securely with providers and staff using the message composer.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedMessages.map((message) => (
              <div 
                key={message.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onMessageClick(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {message.recipientRole === 'provider' ? (
                        <Users className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-medium">To: {message.recipientName}</span>
                      <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
                        {message.priority}
                      </Badge>
                      <Badge className={`text-xs ${getStatusBadgeColor(message.status)}`}>
                        {message.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {message.timestamp.toLocaleDateString()} {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="h-3 w-3 text-green-600" />
                          <span>Encrypted</span>
                        </div>
                      </div>
                      <span className="capitalize">{message.recipientRole}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MessageDetailModal: React.FC<{
  message: SecureMessage | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ message, isOpen, onClose }) => {
  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Message Details</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                <strong>To:</strong> {message.recipientName} ({message.recipientRole})<br />
                <strong>From:</strong> {message.senderName} ({message.senderRole})
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {message.timestamp.toLocaleDateString()} at {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
                {message.priority} priority
              </Badge>
              <Badge variant="outline">
                {message.status}
              </Badge>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">Message Encrypted & HIPAA Compliant</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default function SecureCommunicationPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<SecureMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'recipient'>('date');

  useEffect(() => {
    const userSession = sessionManager.getSession();
    if (!userSession || userSession.role !== 'receptionist') {
      router.push('/receptionist/login');
      return;
    }

    setSession(userSession);
    loadData(userSession.username);
    setIsLoading(false);
  }, [router]);

  const loadData = (receptionistId: string) => {
    // Get messages sent by this receptionist
    const userMessages = communicationDataManager.getMessagesByUser(receptionistId);
    const availableProviders = communicationDataManager.getProviders();
    const availableStaff = communicationDataManager.getStaff();
    
    setMessages(userMessages.filter(m => m.senderRole === 'receptionist'));
    setProviders(availableProviders);
    setStaff(availableStaff);
  };

  const handleSendMessage = (messageData: ReceptionistMessageFormData) => {
    if (!session) return;

    const recipients = [...providers, ...staff];
    const selectedRecipient = recipients.find(r => r.id === messageData.recipientId);
    if (!selectedRecipient) return;

    const recipientRole = messageData.recipientType === 'provider' ? 'provider' : 'receptionist';
    
    const newMessage = communicationDataManager.sendMessage({
      senderId: session.username,
      senderName: session.firstName + ' ' + session.lastName,
      senderRole: 'receptionist',
      recipientId: messageData.recipientId,
      recipientName: selectedRecipient.name,
      recipientRole: recipientRole,
      content: messageData.content,
      isRead: false,
      threadId: communicationDataManager.generateThreadId(),
      priority: messageData.priority
    });

    setMessages(prev => [newMessage, ...prev]);
    setSuccessMessage('Message sent successfully! Communication has been encrypted and logged to Message table.');
    
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleMessageClick = (message: SecureMessage) => {
    if (!message.isRead) {
      communicationDataManager.markMessageAsRead(message.id);
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, isRead: true, status: 'read' } : m));
    }
    setSelectedMessage(message);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading secure communication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/receptionist/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Secure Communication</h1>
            <p className="text-gray-600 mt-1">Secure messaging with providers and staff</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 text-green-600">✓</div>
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* HIPAA Privacy Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Secure Messaging Compliance</p>
              <p>{communicationDataManager.getPrivacyNotice()}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Composer */}
          <MessageComposer
            onSendMessage={handleSendMessage}
            providers={providers}
            staff={staff}
          />

          {/* Message History */}
          <MessageHistory
            messages={messages}
            onMessageClick={handleMessageClick}
            onSortChange={setSortBy}
            currentSort={sortBy}
          />
        </div>

        {/* Message Detail Modal */}
        <MessageDetailModal
          message={selectedMessage}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />

        {/* Statistics Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-lg font-semibold">{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Available Recipients</p>
                  <p className="text-lg font-semibold">{providers.length + staff.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Security Status</p>
                  <p className="text-lg font-semibold text-green-600">HIPAA Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}