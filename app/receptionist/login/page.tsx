'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  receptionistLoginSchema, 
  type ReceptionistLoginData,
  getFieldErrors 
} from '@/lib/epic3-validation';
import { 
  mockDataManager, 
  sessionManager 
} from '@/lib/epic3-mock-data';

export default function ReceptionistLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState<ReceptionistLoginData>({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lockoutMessage, setLockoutMessage] = useState('');
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');

  // Check for logout message or session expiry
  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'logged-out') {
      setSessionExpiredMessage('You have been logged out');
    } else if (message === 'session-expired') {
      setSessionExpiredMessage('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  // Check if already logged in
  useEffect(() => {
    const session = sessionManager.getSession();
    if (session?.role === 'receptionist') {
      router.push('/receptionist/dashboard'); // UD-REF: #Manage Appointment Calendar - will be implemented in future epic
    }
  }, [router]);

  const handleInputChange = (field: keyof ReceptionistLoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear submit error
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    const fieldErrors = getFieldErrors(receptionistLoginSchema, formData);
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setLockoutMessage('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find receptionist by username
      const receptionist = mockDataManager.getReceptionistByUsername(formData.username);
      
      if (!receptionist) {
        setSubmitError('Invalid username or password');
        return;
      }
      
      // Check if account is locked
      if (receptionist.lockedUntil && new Date(receptionist.lockedUntil) > new Date()) {
        const lockoutMinutes = Math.ceil((new Date(receptionist.lockedUntil).getTime() - Date.now()) / (1000 * 60));
        setLockoutMessage(`Account is locked due to too many failed login attempts. Please try again in ${lockoutMinutes} minute(s) or contact support for account recovery.`);
        return;
      }
      
      // Verify password (in real app, this would use hashed comparison)
      if (receptionist.password !== formData.password) {
        // Increment failed login attempts
        const newAttempts = receptionist.failedLoginAttempts + 1;
        mockDataManager.updateReceptionistFailedAttempts(formData.username, newAttempts);
        
        if (newAttempts >= 5) {
          setLockoutMessage('Account has been locked due to too many failed login attempts. Please contact support for account recovery.');
        } else {
          setSubmitError(`Invalid username or password. ${5 - newAttempts} attempt(s) remaining.`);
        }
        
        // Log failed login attempt
        mockDataManager.addAuditLogEntry({
          userId: receptionist.id,
          userRole: 'receptionist',
          action: 'FAILED_LOGIN',
          details: `Failed login attempt from username: ${formData.username}`
        });
        
        return;
      }
      
      // Successful login
      mockDataManager.updateReceptionistLastLogin(formData.username);
      
      // Create session
      const session = sessionManager.createSession(receptionist);
      sessionManager.saveSession(session);
      
      // Log successful login
      mockDataManager.addAuditLogEntry({
        userId: receptionist.id,
        userRole: 'receptionist',
        action: 'LOGIN',
        details: `Successful login for receptionist: ${receptionist.fullName}`
      });
      
      // Clear form
      setFormData({ username: '', password: '' });
      
      // Redirect to dashboard (placeholder for #Manage Appointment Calendar)
      // UD-REF: #Manage Appointment Calendar - will be implemented in future epic
      alert('Login successful! Redirecting to Appointment Calendar...');
      router.push('/receptionist/dashboard');
      
    } catch (error) {
      setSubmitError('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Session timeout warning simulation
  useEffect(() => {
    let timeoutWarning: NodeJS.Timeout;
    
    const session = sessionManager.getSession();
    if (session?.role === 'receptionist') {
      const timeUntilExpiry = new Date(session.expiresAt).getTime() - Date.now();
      const warningTime = timeUntilExpiry - (5 * 60 * 1000); // 5 minutes before expiry
      
      if (warningTime > 0) {
        timeoutWarning = setTimeout(() => {
          const confirmExtend = confirm('Your session will expire in 5 minutes. Do you want to extend your session?');
          if (confirmExtend) {
            // Extend session (in real app, this would make an API call)
            const extendedSession = sessionManager.createSession({
              id: session.userId,
              username: session.username,
              fullName: session.fullName,
              role: session.role
            } as any);
            sessionManager.saveSession(extendedSession);
          }
        }, warningTime);
      }
    }
    
    return () => {
      if (timeoutWarning) clearTimeout(timeoutWarning);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Atlantis HMS</h1>
          <p className="mt-2 text-gray-600">Healthcare Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Receptionist Login</CardTitle>
            <CardDescription className="text-center">
              Access the Atlantis HMS receptionist portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionExpiredMessage && (
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {sessionExpiredMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {lockoutMessage && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {lockoutMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {submitError && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  maxLength={128}
                  className={errors.username ? 'border-red-500' : ''}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  autoComplete="username"
                />
                {errors.username && (
                  <p id="username-error" className="text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    autoComplete="current-password"
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
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/account/recover" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Username:</strong> receptionist1</div>
                <div><strong>Password:</strong> Recept123!</div>
                <div className="text-gray-500 italic">
                  Use these credentials for testing purposes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}