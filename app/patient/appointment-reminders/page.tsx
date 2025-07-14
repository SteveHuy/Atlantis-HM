"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Settings, 
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Send,
  History
} from "lucide-react";
import { 
  reminderSettingsSchema, 
  type ReminderSettingsData,
  REMINDER_INTERVALS,
  REMINDER_METHODS
} from "@/lib/epic4-validation";
import { 
  Epic4MockDataManager, 
  type ReminderSettings,
  type ReminderLog
} from "@/lib/epic4-mock-data";

export default function AppointmentRemindersPage() {
  const [currentSettings, setCurrentSettings] = useState<ReminderSettings | null>(null);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReminderSettingsData>({
    resolver: zodResolver(reminderSettingsSchema)
  });

  const watchedIntervals = watch('intervals') || [];

  // Load current reminder settings
  const loadSettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const settings = Epic4MockDataManager.getReminderSettings('patient-john');
      setCurrentSettings(settings);
      
      // Set form values
      setValue('method', settings.method);
      setValue('intervals', settings.intervals);
      setValue('enabled', settings.enabled);
      
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('error', 'Failed to load reminder settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Load reminder history
  const loadReminderLogs = async () => {
    try {
      const logs = Epic4MockDataManager.getReminderLogs('patient-john');
      setReminderLogs(logs);
    } catch (error) {
      console.error('Error loading reminder logs:', error);
    }
  };

  // Load current settings on mount
  useEffect(() => {
    loadSettings();
    loadReminderLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle form submission
  const onSubmit = async (data: ReminderSettingsData) => {
    setIsSaving(true);
    
    try {
      // Validate intervals
      if (data.intervals.length === 0) {
        showNotification('error', 'Invalid reminder interval');
        return;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update settings
      const updatedSettings = Epic4MockDataManager.updateReminderSettings('patient-john', {
        method: data.method,
        intervals: data.intervals,
        enabled: data.enabled
      });
      
      setCurrentSettings(updatedSettings);
      showNotification('success', 'Reminder settings updated');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', 'Failed to update reminder settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Send test reminder
  const handleSendTestReminder = async () => {
    if (!currentSettings) return;
    
    setIsSendingTest(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Send test reminder
      const testReminder = Epic4MockDataManager.sendTestReminder('patient-john');
      
      // Refresh logs
      loadReminderLogs();
      
      // Update current settings with new test count
      setCurrentSettings(prev => prev ? { 
        ...prev, 
        testRemindersSent: prev.testRemindersSent + 1 
      } : null);
      
      showNotification('success', `Test reminder sent via ${testReminder.method}!`);
      
    } catch (error) {
      console.error('Error sending test reminder:', error);
      showNotification('error', 'Failed to send test reminder');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Revert to default settings
  const handleRevertToDefault = async () => {
    if (!confirm('Are you sure you want to revert to default reminder settings?')) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Default settings
      const defaultSettings = {
        method: 'both' as const,
        intervals: ['24h', '1h'],
        enabled: true
      };
      
      // Update settings
      const updatedSettings = Epic4MockDataManager.updateReminderSettings('patient-john', defaultSettings);
      
      setCurrentSettings(updatedSettings);
      
      // Update form
      setValue('method', defaultSettings.method);
      setValue('intervals', defaultSettings.intervals);
      setValue('enabled', defaultSettings.enabled);
      
      showNotification('success', 'Settings reverted to default');
      
    } catch (error) {
      console.error('Error reverting settings:', error);
      showNotification('error', 'Failed to revert settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle interval checkbox change
  const handleIntervalChange = (interval: string, checked: boolean) => {
    const currentIntervals = watchedIntervals;
    
    if (checked) {
      setValue('intervals', [...currentIntervals, interval]);
    } else {
      setValue('intervals', currentIntervals.filter(i => i !== interval));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Appointment Reminders</h1>
          <p className="text-gray-600">Configure how and when you receive appointment reminders</p>
        </div>

        {/* Notification */}
        {notification && (
          <Alert className={`mb-6 ${
            notification.type === 'success' ? 'bg-green-50 border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
            {notification.type === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
            <AlertDescription className={
              notification.type === 'success' ? 'text-green-800' :
              notification.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Reminder Settings</h2>
                <p className="text-gray-600">Choose how you want to receive appointment reminders</p>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading current settings...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Enable/Disable Reminders */}
                  <div className="flex items-center space-x-3">
                    <input
                      id="enabled"
                      type="checkbox"
                      {...register('enabled')}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                      Enable appointment reminders
                    </Label>
                  </div>

                  {/* Reminder Method */}
                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-3 block">
                      Reminder Method
                    </Label>
                    <div className="space-y-3">
                      {REMINDER_METHODS.map((method) => (
                        <label key={method.value} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            value={method.value}
                            {...register('method')}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            {method.value === 'email' && <Mail className="w-4 h-4 text-gray-500" />}
                            {method.value === 'sms' && <MessageSquare className="w-4 h-4 text-gray-500" />}
                            {method.value === 'both' && <Bell className="w-4 h-4 text-gray-500" />}
                            <span className="text-sm text-gray-700">{method.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.method && (
                      <p className="text-sm text-red-600 mt-1">{errors.method.message}</p>
                    )}
                  </div>

                  {/* Reminder Intervals */}
                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-3 block">
                      Reminder Schedule
                    </Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Select when you want to receive reminders before your appointments
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {REMINDER_INTERVALS.map((interval) => (
                        <label key={interval.value} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={watchedIntervals.includes(interval.value)}
                            onChange={(e) => handleIntervalChange(interval.value, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{interval.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.intervals && (
                      <p className="text-sm text-red-600 mt-1">{errors.intervals.message}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" disabled={isSaving} className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRevertToDefault}
                      disabled={isSaving}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Revert to Default
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Settings Summary */}
            {currentSettings && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Settings</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${currentSettings.enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {currentSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium text-gray-900">
                      {REMINDER_METHODS.find(m => m.value === currentSettings.method)?.label}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Schedule:</span>
                    <div className="mt-1 space-y-1">
                      {currentSettings.intervals.map((interval) => {
                        const intervalConfig = REMINDER_INTERVALS.find(i => i.value === interval);
                        return (
                          <div key={interval} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block mr-1">
                            {intervalConfig?.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-gray-600">Test reminders sent:</span>
                    <span className="font-medium text-gray-900">{currentSettings.testRemindersSent}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Test Reminder */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Reminder</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a test reminder to verify your settings are working correctly.
              </p>
              <Button
                onClick={handleSendTestReminder}
                disabled={isSendingTest || !currentSettings?.enabled}
                className="w-full"
                variant="outline"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSendingTest ? 'Sending...' : 'Send Test Reminder'}
              </Button>
            </Card>

            {/* Recent Reminder History */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <History className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Reminders</h3>
              </div>
              
              {reminderLogs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No reminders sent yet
                </p>
              ) : (
                <div className="space-y-3">
                  {reminderLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="border-l-2 border-blue-200 pl-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          log.method === 'email' ? 'bg-blue-100 text-blue-800' :
                          log.method === 'sms' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.method.toUpperCase()}
                        </span>
                        <span className={`text-xs ${
                          log.status === 'delivered' ? 'text-green-600' :
                          log.status === 'sent' ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.sentAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  
                  {reminderLogs.length > 5 && (
                    <p className="text-xs text-center text-gray-500 pt-2 border-t">
                      ... and {reminderLogs.length - 5} more
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}