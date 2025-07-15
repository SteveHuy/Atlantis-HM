'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { 
  serviceProviderLoginSchema, 
  type ServiceProviderLoginData,
  getFieldErrors 
} from '@/lib/epic3-validation';
import { 
  mockDataManager, 
  sessionManager 
} from '@/lib/epic3-mock-data';

export default function ServiceProviderLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState<ServiceProviderLoginData>({
    username: '',
    password: '',
    rememberMe: false
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
    if (session?.role === 'provider') {
      router.push('/provider/dashboard');
    }
  }, [router]);

  const handleInputChange = (field: keyof ServiceProviderLoginData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (typeof value === 'string' && errors[field]) {
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
    const fieldErrors = getFieldErrors(serviceProviderLoginSchema, formData);
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
      
      // Find provider by username
      const provider = mockDataManager.getProviderByUsername(formData.username);
      
      if (!provider) {
        setSubmitError('Invalid username or password');
        return;
      }
      
      // Check if account is locked
      if (provider.lockedUntil && new Date(provider.lockedUntil) > new Date()) {
        const lockoutMinutes = Math.ceil((new Date(provider.lockedUntil).getTime() - Date.now()) / (1000 * 60));
        setLockoutMessage(`Account is locked due to too many failed login attempts. Please try again in ${lockoutMinutes} minute(s) or contact support for account recovery.`);
        return;
      }
      
      // Verify password (in real app, this would use hashed comparison)
      if (provider.password !== formData.password) {
        // Increment failed login attempts
        const newAttempts = provider.failedLoginAttempts + 1;
        mockDataManager.updateProviderFailedAttempts(formData.username, newAttempts);
        
        if (newAttempts >= 5) {
          setLockoutMessage('Account has been locked due to too many failed login attempts. Please contact support for account recovery.');
        } else {
          setSubmitError(`Invalid username or password. ${5 - newAttempts} attempt(s) remaining.`);
        }
        
        // Log failed login attempt
        mockDataManager.addAuditLogEntry({
          userId: provider.id,
          userRole: 'provider',
          action: 'FAILED_LOGIN',
          details: `Failed login attempt from username: ${formData.username}`
        });
        
        return;
      }
      
      // Successful login
      mockDataManager.updateProviderLastLogin(formData.username);
      
      // Create session (honor Remember Me for 30 days)
      const session = sessionManager.createSession(provider, formData.rememberMe);
      sessionManager.saveSession(session);
      
      // Log successful login in User Activity Logs Table
      mockDataManager.addAuditLogEntry({
        userId: provider.id,
        userRole: 'provider',
        action: 'LOGIN',
        details: `Successful login for service provider: ${provider.fullName} ${formData.rememberMe ? '(Remember Me enabled)' : ''}`
      });
      
      // Clear form
      setFormData({ username: '', password: '', rememberMe: false });
      
      // Redirect to provider dashboard with access to all features
      router.push('/provider/dashboard');
      
    } catch (error) {
      setSubmitError('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Atlantis HMS</h1>
          <p className="mt-2 text-gray-600">Healthcare Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              Login to Atlantis HMS for Service Providers
            </CardTitle>
            <CardDescription className="text-center">
              Access patient EHR and manage healthcare needs securely
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

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                />
                <Label 
                  htmlFor="rememberMe" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </Label>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/account/recover" 
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                Forgot Password?
              </Link>
            </div>

            {/* HIPAA Compliance Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <strong>HIPAA Compliance:</strong> This system maintains secure authentication procedures compliant with HIPAA standards. All login activities are recorded for security and audit purposes.
                </div>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Username:</strong> drsmith</div>
                <div><strong>Password:</strong> Doctor123!</div>
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