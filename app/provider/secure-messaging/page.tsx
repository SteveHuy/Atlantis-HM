'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Shield, Clock, User, AlertCircle, MessageSquare, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { communicationDataManager, SecureMessage, Patient } from '@/lib/communication-mock-data';
import { providerMessageSchema, ProviderMessageFormData } from '@/lib/communication-validation';
import { sessionManager } from '@/lib/session-manager';

interface MessageComposerProps {
  selectedPatient: Patient | null;
  onSendMessage: (messageData: ProviderMessageFormData) => void;
  onPatientSelect: (patient: Patient | null) => void;
  patients: Patient[];
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  selectedPatient,
  onSendMessage,
  onPatientSelect,
  patients
}) => {
  const [formData, setFormData] = useState<ProviderMessageFormData>({
    patientId: selectedPatient?.id || '',
    content: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, patientId: selectedPatient?.id || '' }));
  }, [selectedPatient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = providerMessageSchema.parse(formData);
      onSendMessage(validatedData);
      setFormData(prev => ({ ...prev, content: '' }));
      setAttachments([]);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validation = communicationDataManager.validateFileAttachment(file);
      return validation.isValid;
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Compose Message</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Patient *</label>
            <select
              value={formData.patientId}
              onChange={(e) => {
                const patient = patients.find(p => p.id === e.target.value) || null;
                onPatientSelect(patient);
                setFormData(prev => ({ ...prev, patientId: e.target.value }));
              }}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Choose a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
            )}
          </div>

          {selectedPatient && (
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-900">Patient Information</h4>
              <p className="text-sm text-blue-800">
                <strong>Name:</strong> {selectedPatient.name}<br />
                <strong>Email:</strong> {selectedPatient.email}<br />
                <strong>Phone:</strong> {selectedPatient.phone}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Message Content *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your message to the patient (max 1024 characters)"
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

          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">HIPAA Compliant Secure Messaging</p>
                <p>{communicationDataManager.getPrivacyNotice()}</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center space-x-2"
            disabled={!formData.patientId || !formData.content.trim()}
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
  selectedPatient: Patient | null;
  messages: SecureMessage[];
  onMessageClick: (message: SecureMessage) => void;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({
  selectedPatient,
  messages,
  onMessageClick
}) => {
  if (!selectedPatient) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Select a Patient</h3>
            <p>Choose a patient from the message composer to view your conversation history.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const patientMessages = messages.filter(m => 
    (m.senderId === selectedPatient.id) || (m.recipientId === selectedPatient.id)
  );

  if (patientMessages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversation with {selectedPatient.name}</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
            <p>Start a conversation with {selectedPatient.name} using the message composer above.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation with {selectedPatient.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {patientMessages.map((message) => (
            <div 
              key={message.id}
              className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                message.senderRole === 'provider' 
                  ? 'bg-blue-50 border-l-4 border-blue-200 ml-8' 
                  : 'bg-gray-50 border-l-4 border-gray-200 mr-8'
              }`}
              onClick={() => onMessageClick(message)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {message.senderRole === 'provider' ? 'You' : message.senderName}
                  </span>
                  {message.priority && (
                    <Badge variant={message.priority === 'high' ? 'destructive' : 'secondary'}>
                      {message.priority}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{message.timestamp.toLocaleDateString()} {message.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
              
              {message.subject && (
                <h4 className="font-medium text-sm mb-1">{message.subject}</h4>
              )}
              
              <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <Shield className="h-3 w-3" />
                  <span>Encrypted</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {message.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
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
                {message.senderRole === 'provider' ? 'To:' : 'From:'} {message.senderRole === 'provider' ? message.recipientName : message.senderName}
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

export default function SecureMessagingWithPatientsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<SecureMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userSession = sessionManager.getSession();
    if (!userSession) {
      router.push('/provider/login');
      return;
    }

    setSession(userSession);
    loadData();
    setIsLoading(false);
  }, [router]);

  const loadData = () => {
    const allMessages = communicationDataManager.getMessages();
    const availablePatients = communicationDataManager.getPatients();
    
    setMessages(allMessages);
    setPatients(availablePatients);
  };

  const handleSendMessage = (messageData: ProviderMessageFormData) => {
    if (!session || !selectedPatient) return;

    const newMessage = communicationDataManager.sendMessage({
      senderId: session.username,
      senderName: session.firstName + ' ' + session.lastName,
      senderRole: 'provider',
      recipientId: messageData.patientId,
      recipientName: selectedPatient.name,
      recipientRole: 'patient',
      content: messageData.content,
      isRead: false,
      threadId: communicationDataManager.generateThreadId(),
      priority: 'medium'
    });

    setMessages(prev => [newMessage, ...prev]);
    setSuccessMessage('Message sent successfully to ' + selectedPatient.name);
    
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleMessageClick = (message: SecureMessage) => {
    if (!message.isRead && message.recipientRole === 'provider') {
      communicationDataManager.markMessageAsRead(message.id);
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, isRead: true, status: 'read' } : m));
    }
    setSelectedMessage(message);
    setIsDetailOpen(true);
  };

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading secure messaging...</p>
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
              onClick={() => router.push('/provider/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Secure Messaging</h1>
            <p className="text-gray-600 mt-1">Communicate securely with your patients</p>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Composer */}
          <MessageComposer
            selectedPatient={selectedPatient}
            onSendMessage={handleSendMessage}
            onPatientSelect={handlePatientSelect}
            patients={patients}
          />

          {/* Message History */}
          <MessageHistory
            selectedPatient={selectedPatient}
            messages={messages}
            onMessageClick={handleMessageClick}
          />
        </div>

        {/* Message Detail Modal */}
        <MessageDetailModal
          message={selectedMessage}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />

        {/* Navigation Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              After sending messages, you can navigate back to <strong>View Patient EHR</strong> to access complete patient records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}