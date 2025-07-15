'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Simple select will be rendered as HTML select
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, XCircle, Shield, AlertTriangle } from 'lucide-react';
import { 
  receptionistAssistedRegistrationSchema, 
  type ReceptionistAssistedRegistrationData,
  getFieldErrors 
} from '@/lib/epic3-validation';
import { 
  mockDataManager, 
  sessionManager, 
  MOCK_INSURANCE_PROVIDERS 
} from '@/lib/epic3-mock-data';

export default function ReceptionistAssistedRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ReceptionistAssistedRegistrationData>({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    insuranceProvider: '',
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  
  // Insurance verification state
  const [policyNumber, setPolicyNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'active' | 'inactive' | 'invalid';
    message: string;
    timestamp: string;
  } | null>(null);
  const [auditTrail, setAuditTrail] = useState<string[]>([]);
  
  // Check if receptionist is logged in
  const [receptionistSession] = useState(() => {
    const session = sessionManager.getSession();
    return session?.role === 'receptionist' ? session : null;
  });

  // Redirect if not authorized
  if (!receptionistSession) {
    router.push('/receptionist/login');
    return null;
  }

  const handleInputChange = (field: keyof ReceptionistAssistedRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Real-time username uniqueness check
    if (field === 'username' && value) {
      if (!mockDataManager.isUsernameUnique(value)) {
        setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      }
    }
    
    // Real-time email uniqueness check
    if (field === 'email' && value) {
      if (!mockDataManager.isEmailUnique(value)) {
        setErrors(prev => ({ ...prev, email: 'Email is already registered' }));
      }
    }
  };

  const validateForm = () => {
    const fieldErrors = getFieldErrors(receptionistAssistedRegistrationSchema, formData);
    
    // Add custom validation
    if (formData.username && !mockDataManager.isUsernameUnique(formData.username)) {
      fieldErrors.username = 'Username is already taken';
    }
    
    if (formData.email && !mockDataManager.isEmailUnique(formData.email)) {
      fieldErrors.email = 'Email is already registered';
    }
    
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create patient account
      const newPatient = mockDataManager.createPatient({
        username: formData.username,
        password: formData.password, // In real app, this would be hashed
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        phone: formData.phone,
        insuranceProvider: formData.insuranceProvider || undefined,
        policyNumber: policyNumber || undefined,
        insuranceStatus: verificationResult?.status || undefined,
        isVerified: false, // Patient needs to verify email
        registeredBy: receptionistSession.userId
      });
      
      // Log audit event
      mockDataManager.addAuditLogEntry({
        userId: receptionistSession.userId,
        userRole: 'receptionist',
        action: 'PATIENT_REGISTRATION',
        details: `Registered new patient: ${newPatient.fullName} (${newPatient.username})`
      });
      
      // Generate temporary credentials (in real app, would be more secure)
      // Note: In production, this would be handled securely by the backend
      
      // Show success message with email simulation
      setSubmitSuccess(`Patient account created successfully! Verification email sent to ${formData.email}.`);
      
      // Redirect to Patient Login after 3 seconds
      setTimeout(() => {
        router.push('/patient/login?message=account-created');
      }, 3000);
      
    } catch (error) {
      setSubmitError('An error occurred while creating the patient account. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    return { strength, checks };
  };

  const passwordAnalysis = getPasswordStrength(formData.password);

  const handleInsuranceVerification = async () => {
    if (!formData.insuranceProvider || !policyNumber) {
      setErrors(prev => ({
        ...prev,
        insurance: 'Both insurance provider and policy number are required for verification'
      }));
      return;
    }

    setIsVerifying(true);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.insurance;
      return newErrors;
    });

    try {
      // Simulate API call to verify insurance
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification logic
      const isExpired = policyNumber.toLowerCase().includes('expired');
      const isInvalid = policyNumber.toLowerCase().includes('invalid');
      
      let result: typeof verificationResult;
      
      if (isInvalid) {
        result = {
          status: 'invalid',
          message: 'Policy number not found in insurance database. Please verify details.',
          timestamp: new Date().toISOString()
        };
      } else if (isExpired) {
        result = {
          status: 'inactive',
          message: 'Policy is inactive or expired. Patient should contact insurance provider.',
          timestamp: new Date().toISOString()
        };
      } else {
        result = {
          status: 'active',
          message: 'Insurance coverage verified successfully. Registration can proceed.',
          timestamp: new Date().toISOString()
        };
      }

      setVerificationResult(result);
      
      // Add to audit trail
      const auditEntry = `${new Date().toLocaleString()}: Insurance verification for ${formData.insuranceProvider} policy ${policyNumber} - Status: ${result.status}`;
      setAuditTrail(prev => [...prev, auditEntry]);
      
      // Log audit event
      mockDataManager.addAuditLogEntry({
        userId: receptionistSession.userId,
        userRole: 'receptionist',
        action: 'INSURANCE_VERIFICATION',
        details: auditEntry
      });

    } catch (error) {
      setVerificationResult({
        status: 'invalid',
        message: 'Verification service temporarily unavailable. Please try again.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Receptionist-Assisted Registration</CardTitle>
            <CardDescription>
              Register a new patient into the Atlantis HMS system
            </CardDescription>
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <strong>Logged in as:</strong> {receptionistSession.fullName} (Receptionist)
            </div>
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
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  maxLength={128}
                  className={errors.fullName ? 'border-red-500' : ''}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                  aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
                />
                {errors.dateOfBirth && (
                  <p id="dateOfBirth-error" className="text-sm text-red-600">{errors.dateOfBirth}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  maxLength={256}
                  className={errors.email ? 'border-red-500' : ''}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className={errors.phone ? 'border-red-500' : ''}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Insurance Provider */}
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <select
                  id="insuranceProvider"
                  value={formData.insuranceProvider} 
                  onChange={(e) => {
                    handleInputChange('insuranceProvider', e.target.value);
                    // Reset verification when provider changes
                    setVerificationResult(null);
                    setPolicyNumber('');
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select insurance provider (optional)</option>
                  {MOCK_INSURANCE_PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>

              {/* Insurance Verification Section */}
              {formData.insuranceProvider && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      Insurance Verification
                    </CardTitle>
                    <CardDescription>
                      Verify patient's insurance information during registration to ensure coverage and reduce claim denials.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Policy Number */}
                    <div className="space-y-2">
                      <Label htmlFor="policyNumber">Policy Number *</Label>
                      <Input
                        id="policyNumber"
                        value={policyNumber}
                        onChange={(e) => {
                          setPolicyNumber(e.target.value);
                          setVerificationResult(null); // Reset verification when policy changes
                        }}
                        placeholder="Enter policy number"
                        className={errors.insurance ? 'border-red-500' : ''}
                      />
                      {errors.insurance && (
                        <p className="text-sm text-red-600">{errors.insurance}</p>
                      )}
                    </div>

                    {/* Verify Button */}
                    <Button
                      type="button"
                      onClick={handleInsuranceVerification}
                      disabled={isVerifying || !formData.insuranceProvider || !policyNumber}
                      className="w-full"
                      variant="outline"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Verify Insurance
                        </>
                      )}
                    </Button>

                    {/* Verification Result */}
                    {verificationResult && (
                      <Alert className={
                        verificationResult.status === 'active' 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }>
                        {verificationResult.status === 'active' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className={
                          verificationResult.status === 'active' ? 'text-green-800' : 'text-red-800'
                        }>
                          <div className="font-semibold mb-1">
                            Status: {verificationResult.status.toUpperCase()}
                          </div>
                          {verificationResult.message}
                          <div className="text-xs mt-2 opacity-75">
                            Verified at: {new Date(verificationResult.timestamp).toLocaleString()}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Alternative Options for Inactive/Invalid */}
                    {verificationResult && verificationResult.status !== 'active' && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <div className="font-semibold mb-1">Available Options:</div>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Re-enter insurance details and try verification again</li>
                            <li>Skip verification and proceed with registration</li>
                            <li>Patient can update insurance information after registration</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  maxLength={128}
                  className={errors.username ? 'border-red-500' : ''}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
                {errors.username && (
                  <p id="username-error" className="text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    maxLength={256}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    aria-describedby={errors.password ? 'password-error' : 'password-help'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Policy Checklist */}
                {formData.password && (
                  <div className="text-sm space-y-1">
                    <div className={`flex items-center gap-2 ${passwordAnalysis.checks[0] ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordAnalysis.checks[0] ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${passwordAnalysis.checks[1] ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordAnalysis.checks[1] ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordAnalysis.checks[2] ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordAnalysis.checks[2] ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordAnalysis.checks[3] ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordAnalysis.checks[3] ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      One number
                    </div>
                    <div className={`flex items-center gap-2 ${passwordAnalysis.checks[4] ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordAnalysis.checks[4] ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      One special character
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                {isSubmitting ? 'Creating Account...' : 'Register Patient'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}