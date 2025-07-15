'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Paperclip, Shield, Clock, User, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { communicationDataManager, SecureMessage, Provider } from '@/lib/communication-mock-data';
import { secureMessageSchema, SecureMessageFormData } from '@/lib/communication-validation';
import { sessionManager } from '@/lib/epic3-mock-data';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (messageData: SecureMessageFormData) => void;
  providers: Provider[];
}

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend, 
  providers 
}) => {
  const [formData, setFormData] = useState<SecureMessageFormData>({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = secureMessageSchema.parse(formData);
      onSend(validatedData);
      setFormData({ recipientId: '', subject: '', content: '', priority: 'medium' });
      setAttachments([]);
      setErrors({});
      onClose();
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validation = communicationDataManager.validateFileAttachment(file);
      return validation.isValid;
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Compose New Message</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recipient *</label>
            <select
              value={formData.recipientId}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select a provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {provider.specialty}
                </option>
              ))}
            </select>
            {errors.recipientId && (
              <p className="text-red-500 text-sm mt-1">{errors.recipientId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject (Optional)</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter message subject (max 128 characters)"
              maxLength={128}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.subject?.length || 0}/128 characters</p>
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message Content *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your message (max 1024 characters)"
              maxLength={1024}
              rows={6}
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.content?.length || 0}/1024 characters</p>
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attachments (Optional)</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                onChange={handleFileUpload}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">Add Files (Max 5MB each)</span>
                </div>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure & HIPAA Compliant</p>
                <p>{communicationDataManager.getPrivacyNotice()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MessagesList: React.FC<{ messages: SecureMessage[], onMessageClick: (message: SecureMessage) => void }> = ({ 
  messages, 
  onMessageClick 
}) => {
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
            <p>Start a conversation with your healthcare providers using the "Compose New Message" button above.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <Card 
          key={message.id} 
          className={`cursor-pointer transition-colors hover:bg-gray-50 ${!message.isRead ? 'border-blue-200 bg-blue-50' : ''}`}
          onClick={() => onMessageClick(message)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">
                    {message.senderRole === 'patient' ? `To: ${message.recipientName}` : `From: ${message.senderName}`}
                  </span>
                  <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
                    {message.priority}
                  </Badge>
                  {!message.isRead && <Badge variant="outline">New</Badge>}
                </div>
                
                {message.subject && (
                  <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                )}
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {message.content}
                </p>
                
                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{message.timestamp.toLocaleDateString()} {message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
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
                {message.senderRole === 'patient' ? 'To:' : 'From:'} {message.senderRole === 'patient' ? message.recipientName : message.senderName}
              </p>
              <p className="text-sm text-gray-600">
                {message.timestamp.toLocaleDateString()} at {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
                {message.priority}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <Shield className="h-3 w-3" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>

          {message.subject && (
            <div>
              <h3 className="font-medium text-lg mb-2">{message.subject}</h3>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Attachments</h4>
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">{attachment.fileName}</span>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default function SecureMessagingPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SecureMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userSession = sessionManager.getSession();
    if (!userSession) {
      router.push('/patient/login');
      return;
    }

    setSession(userSession);
    loadData(userSession.username);
    setIsLoading(false);
  }, [router]);

  const loadData = (patientId: string) => {
    const userMessages = communicationDataManager.getMessagesByUser(patientId);
    const availableProviders = communicationDataManager.getProviders();
    
    setMessages(userMessages);
    setProviders(availableProviders);
  };

  const handleSendMessage = (messageData: SecureMessageFormData) => {
    if (!session) return;

    const selectedProvider = providers.find(p => p.id === messageData.recipientId);
    if (!selectedProvider) return;

    const newMessage = communicationDataManager.sendMessage({
      senderId: session.username,
      senderName: session.firstName + ' ' + session.lastName,
      senderRole: 'patient',
      recipientId: messageData.recipientId,
      recipientName: selectedProvider.name,
      recipientRole: 'provider',
      subject: messageData.subject,
      content: messageData.content,
      isRead: false,
      threadId: communicationDataManager.generateThreadId(),
      priority: messageData.priority
    });

    setMessages(prev => [newMessage, ...prev]);
    setSuccessMessage('Message sent successfully! Your healthcare provider will respond as soon as possible.');
    
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
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/patient/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">Secure communication with your healthcare providers</p>
            </div>
            <Button 
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Compose New Message</span>
            </Button>
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
              <p className="font-medium">HIPAA Compliant Secure Messaging</p>
              <p>{communicationDataManager.getPrivacyNotice()}</p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <MessagesList messages={messages} onMessageClick={handleMessageClick} />

        {/* Compose Message Modal */}
        <ComposeMessageModal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendMessage}
          providers={providers}
        />

        {/* Message Detail Modal */}
        <MessageDetailModal
          message={selectedMessage}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </div>
  );
}