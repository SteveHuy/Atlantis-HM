"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Shield, KeyRound } from "lucide-react";
import { 
  accountRecoverySchema, 
  type AccountRecoveryData 
} from "@/lib/epic3-validation";
import { mockDataManager } from "@/lib/epic3-mock-data";

export default function AccountRecovery() {
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountRecoveryData>({
    resolver: zodResolver(accountRecoverySchema),
  });

  const onSubmit = async (data: AccountRecoveryData) => {
    setIsLoading(true);
    setRecoveryError("");
    setRecoverySuccess("");

    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check against registered patient accounts
      const patients = mockDataManager.getPatients();
      let matchedPatient = null;

      // Match by email (required field)
      matchedPatient = patients.find(p => p.email === data.email);

      // Also check phone if provided
      if (!matchedPatient && data.phone) {
        matchedPatient = patients.find(p => p.phone === data.phone);
      }

      if (!matchedPatient) {
        setRecoveryError("No account found with the provided email address. Please check your email and try again.");
        return;
      }

      // Generate OAuth token with 15-minute expiry
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiryTime = new Date(Date.now() + 15 * 60000); // 15 minutes

      // Log password reset attempt
      mockDataManager.addAuditLogEntry({
        userId: matchedPatient.id,
        userRole: 'patient',
        action: 'PASSWORD_RESET_REQUEST',
        details: `Password reset requested for email: ${data.email}`
      });

      // Simulate secure password reset API & OAuth token creation
      console.log("Password reset process initiated:");
      console.log("- OAuth reset token created:", resetToken);
      console.log("- Token expires at:", expiryTime.toISOString());
      console.log("- Using HTTPS for secure communication");
      console.log("- Reset link/code sent to:", data.email);

      setRecoverySuccess(
        `A password reset link has been sent to ${data.email}. Please check your email and follow the instructions to reset your password. This link will expire in 15 minutes for security purposes.`
      );

      // Clear form
      reset();

    } catch (error) {
      console.error("Recovery error:", error);
      setRecoveryError("An error occurred while processing your request. Please try again.");
    } finally {
      setIsLoading(false);
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
              <KeyRound className="h-6 w-6 text-blue-600" />
              Account Recovery
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email address to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success Message */}
            {recoverySuccess && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {recoverySuccess}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error Message */}
            {recoveryError && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {recoveryError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? 'border-red-500' : ''}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  placeholder="Enter your registered email address"
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  This must match the email address associated with your account
                </p>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className={errors.phone ? 'border-red-500' : ''}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Alternative recovery method if email is not accessible
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Security Notice:</span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Reset links expire after 15 minutes for security</li>
                <li>• OAuth tokens are created for secure password reset</li>
                <li>• All communications use HTTPS encryption</li>
                <li>• Reset attempts are logged for security monitoring</li>
              </ul>
            </div>

            {/* Navigation Links */}
            <div className="mt-6 text-center space-y-2">
              <Link 
                href="/patient/login" 
                className="block text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Patient Login
              </Link>
              <Link 
                href="/" 
                className="block text-sm text-gray-600 hover:text-gray-500"
              >
                Return to Homepage
              </Link>
            </div>

            {/* Demo Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Recovery:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Test Email:</strong> john.doe@email.com</div>
                <div className="text-gray-500 italic">
                  Use this email for testing the recovery process
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}