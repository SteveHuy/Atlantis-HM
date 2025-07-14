'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Simple select will be rendered as HTML select
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Phone, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { 
  updateEmergencyContactSchema, 
  type UpdateEmergencyContactData,
  getFieldErrors 
} from '@/lib/epic3-validation';
import { 
  mockDataManager, 
  sessionManager, 
  EMERGENCY_CONTACT_RELATIONS 
} from '@/lib/epic3-mock-data';

export default function UpdateEmergencyContactPage() {
  const router = useRouter();
  const [session] = useState(() => sessionManager.getSession());
  const [formData, setFormData] = useState<UpdateEmergencyContactData>({
    name: '',
    relation: '',
    phone: '',
    email: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and load existing data
  useEffect(() => {
    if (!session || session.role !== 'patient') {
      router.push('/patient/login');
      return;
    }

    // Load existing emergency contact data
    const patient = mockDataManager.getPatientByUsername(session.username);
    if (patient?.emergencyContact) {
      setFormData({
        name: patient.emergencyContact.name,
        relation: patient.emergencyContact.relation,
        phone: patient.emergencyContact.phone,
        email: patient.emergencyContact.email || ''
      });
    }
    
    setIsLoading(false);
  }, [session, router]);

  const handleInputChange = (field: keyof UpdateEmergencyContactData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear submit messages
    if (submitError) setSubmitError('');
    if (submitSuccess) setSubmitSuccess('');
  };

  const validateForm = () => {
    const fieldErrors = getFieldErrors(updateEmergencyContactSchema, formData);
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('Please resolve all validation errors before continuing.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      // Update emergency contact information
      const success = mockDataManager.updatePatientEmergencyContact(session.userId, {
        name: formData.name,
        relation: formData.relation,
        phone: formData.phone,
        email: formData.email || undefined
      });
      
      if (!success) {
        throw new Error('Failed to update emergency contact');
      }
      
      // Log audit event
      mockDataManager.addAuditLogEntry({
        userId: session.userId,
        userRole: 'patient',
        action: 'UPDATE_EMERGENCY_CONTACT',
        details: `Emergency contact updated: ${formData.name} (${formData.relation})`
      });
      
      // Show success message
      setSubmitSuccess('Emergency contact updated successfully');
      
      // Redirect to Profile Management after 2 seconds
      setTimeout(() => {
        router.push('/patient/profile');
      }, 2000);
      
    } catch (error) {
      setSubmitError('An error occurred while updating emergency contact. Please try again.');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emergency contact information...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/patient/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
              <Phone className="h-6 w-6" />
              Update Emergency Contact
            </CardTitle>
            <CardDescription>
              Keep your emergency contact information up to date for accurate and timely communication in case of emergencies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitSuccess && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {submitSuccess}
                </AlertDescription>
              </Alert>
            )}
            
            {submitError && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Emergency Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Emergency Contact Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  maxLength={128}
                  className={errors.name ? 'border-red-500' : ''}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  placeholder="Enter full name of emergency contact"
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Relationship */}
              <div className="space-y-2">
                <Label htmlFor="relation">Relationship *</Label>
                <select
                  id="relation"
                  value={formData.relation} 
                  onChange={(e) => handleInputChange('relation', e.target.value)}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.relation ? 'border-red-500' : ''}`}
                >
                  <option value="">Select relationship</option>
                  {EMERGENCY_CONTACT_RELATIONS.map((relation) => (
                    <option key={relation} value={relation}>
                      {relation}
                    </option>
                  ))}
                </select>
                {errors.relation && (
                  <p className="text-sm text-red-600">{errors.relation}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  maxLength={256}
                  className={errors.email ? 'border-red-500' : ''}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  placeholder="contact@example.com"
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Important Notice
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• This person will be contacted in case of medical emergencies</li>
                  <li>• Verify all contact information is current and accurate</li>
                  <li>• Inform your emergency contact about being listed</li>
                  <li>• Update immediately if contact information changes</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                {isSubmitting ? 'Updating...' : 'Save Emergency Contact'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}