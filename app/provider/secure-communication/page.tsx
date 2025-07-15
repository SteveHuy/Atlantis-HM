'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  Send,
  Paperclip,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  User,
  Clock,
  Shield,
  FileText,
  X
} from 'lucide-react';
import { sessionManager, type UserSession } from '@/lib/epic3-mock-data';
import {
  serviceProviderDataManager,
  mockSecureMessages,
  type SecureMessage,
  type MessageAttachment
} from '@/lib/service-provider-mock-data';
import { providerSecureCommunicationSchema } from '@/lib/service-provider-validation';

interface MessageRecipient {
  id: string;
  name: string;
  type: 'provider' | 'patient' | 'receptionist';
  email: string;
}

const mockRecipients: MessageRecipient[] = [
  { id: 'patient-1', name: 'John Doe', type: 'patient', email: 'john.doe@email.com' },
  { id: 'patient-2', name: 'Jane Smith', type: 'patient', email: 'jane.smith@email.com' },
  { id: 'provider-2', name: 'Dr. Michael Chen', type: 'provider', email: 'michael.chen@atlantis.com' },
  { id: 'provider-3', name: 'Dr. Emily Rodriguez', type: 'provider', email: 'emily.rodriguez@atlantis.com' },
  { id: 'receptionist-1', name: 'Sarah Wilson', type: 'receptionist', email: 'sarah.wilson@atlantis.com' },
  { id: 'receptionist-2', name: 'Mike Brown', type: 'receptionist', email: 'mike.brown@atlantis.com' }
];

export default function ProviderSecureCommunicationPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<MessageRecipient | null>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showPastMessages, setShowPastMessages] = useState(false);
  const [pastMessages, setPastMessages] = useState<SecureMessage[]>([]);
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);

  useEffect(() => {
    const userSession = sessionManager.getSession();

    if (!userSession || userSession.role !== 'provider') {
      router.push('/provider/login');
      return;
    }

    setSession(userSession);
    setIsLoading(false);
  }, [router]);

  const handleRecipientChange = (recipientId: string) => {
    const recipient = mockRecipients.find(r => r.id === recipientId);
    setSelectedRecipientId(recipientId);
    setSelectedRecipient(recipient || null);

    if (recipient && session) {
      // Load past communications
      const userMessages = serviceProviderDataManager.getMessagesForUser(session.userId, 'provider');
      const conversationMessages = userMessages.filter(msg =>
        (msg.senderId === session.userId && msg.recipientId === recipientId) ||
        (msg.senderId === recipientId && msg.recipientId === session.userId)
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setPastMessages(conversationMessages);
      setShowPastMessages(conversationMessages.length > 0);
    } else {
      setPastMessages([]);
      setShowPastMessages(false);
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not allowed`);
        return;
      }

      validFiles.push(file);
    });

    if (attachments.length + validFiles.length > 5) {
      errors.push('Cannot attach more than 5 files total');
    } else {
      setAttachments(prev => [...prev, ...validFiles]);
    }

    setAttachmentErrors(errors);

    // Clear file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    setSendError('');
    setSendSuccess(false);
    setIsSending(true);

    try {
      if (!session || !selectedRecipient) {
        setSendError('Session or recipient not found');
        setIsSending(false);
        return;
      }

      // Validate form data
      const attachmentData = attachments.map(file => ({
        filename: file.name,
        size: file.size,
        type: file.type
      }));

      const validationResult = providerSecureCommunicationSchema.safeParse({
        recipientId: selectedRecipientId,
        recipientType: selectedRecipient.type,
        subject: subject.trim(),
        content: content.trim(),
        attachments: attachmentData,
        priority
      });

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(e => e.message).join(', ');
        setSendError(errors);
        setIsSending(false);
        return;
      }

      // Create message attachments
      const messageAttachments: MessageAttachment[] = attachments.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        filename: file.name,
        size: file.size,
        type: file.type,
        url: `/mock/attachments/${file.name}` // Mock URL
      }));

      // Send secure message
      const newMessage = serviceProviderDataManager.sendSecureMessage({
        senderId: session.userId,
        senderName: session.fullName,
        senderType: 'provider',
        recipientId: selectedRecipientId,
        recipientName: selectedRecipient.name,
        recipientType: selectedRecipient.type,
        subject: subject.trim(),
        content: content.trim(),
        attachments: messageAttachments,
        isRead: false
      });

      // Show success message
      setSendSuccess(true);

      // Clear form
      setSubject('');
      setContent('');
      setAttachments([]);
      setPriority('normal');

      // Update past messages
      const updatedMessages = [newMessage, ...pastMessages];
      setPastMessages(updatedMessages);
      setShowPastMessages(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSendSuccess(false), 3000);

    } catch (error) {
      setSendError('Failed to send message. Please try again.');
      console.error('Send message error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getRecipientTypeIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="h-4 w-4" />;
      case 'provider':
        return <Shield className="h-4 w-4" />;
      case 'receptionist':
        return <FileText className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRecipientTypeColor = (type: string) => {
    switch (type) {
      case 'patient':
        return 'text-blue-600';
      case 'provider':
        return 'text-green-600';
      case 'receptionist':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/provider/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">Secure Communication</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <span className="text-sm text-gray-600">
                {session.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Message Composition */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Compose Secure Message
                </CardTitle>
                <CardDescription>
                  Send encrypted messages to patients and healthcare colleagues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Success Message */}
                {sendSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">Message sent successfully and logged in audit trail</span>
                  </div>
                )}

                {/* Error Message */}
                {sendError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800">{sendError}</span>
                  </div>
                )}

                {/* Recipient Selection */}
                <div>
                  <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                    Message Recipient *
                  </label>
                  <select
                    id="recipient"
                    value={selectedRecipientId}
                    onChange={(e) => handleRecipientChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select recipient...</option>
                    <optgroup label="Patients">
                      {mockRecipients.filter(r => r.type === 'patient').map(recipient => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name} ({recipient.email})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Healthcare Providers">
                      {mockRecipients.filter(r => r.type === 'provider').map(recipient => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name} ({recipient.email})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Receptionists">
                      {mockRecipients.filter(r => r.type === 'receptionist').map(recipient => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name} ({recipient.email})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Subject Line */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter message subject..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={200}
                    required
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {subject.length}/200 characters
                  </div>
                </div>

                {/* Priority Selection */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Message Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content *
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message here..."
                    rows={8}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={5000}
                    required
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {content.length}/5000 characters
                  </div>
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileAttachment}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to attach files (Max 5 files, 10MB each)
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Supported: PDF, Images, Documents
                      </span>
                    </label>
                  </div>

                  {/* Attachment Errors */}
                  {attachmentErrors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {attachmentErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Attached Files */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Attached Files:</h4>
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !selectedRecipientId || !subject.trim() || !content.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Secure Message
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Past Communications */}
          <div className="lg:col-span-1">
            {selectedRecipient && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={getRecipientTypeColor(selectedRecipient.type)}>
                      {getRecipientTypeIcon(selectedRecipient.type)}
                    </div>
                    Past Communications
                  </CardTitle>
                  <CardDescription>
                    Conversation history with {selectedRecipient.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pastMessages.length === 0 ? (
                    <div className="text-center py-6">
                      <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No previous messages</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {pastMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg border ${
                            message.senderId === session?.userId
                              ? 'bg-blue-50 border-blue-200 ml-4'
                              : 'bg-gray-50 border-gray-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-600">
                              {message.senderId === session?.userId ? 'You' : message.senderName}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(message.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {message.content}
                          </p>
                          {message.attachments.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <Paperclip className="h-3 w-3" />
                              {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`text-xs px-2 py-1 rounded ${
                              message.deliveryStatus === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : message.deliveryStatus === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {message.deliveryStatus}
                            </div>
                            <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                              {message.encryptionStatus}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• All messages are encrypted during transmission</p>
                <p>• Communication logs are maintained for audit trail</p>
                <p>• HIPAA compliant messaging platform</p>
                <p>• Delivery confirmations are tracked</p>
                <p>• Failed deliveries are automatically reported</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
