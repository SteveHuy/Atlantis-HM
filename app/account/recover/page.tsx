"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

const recoverySchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine((phone) => !phone || /^[\d\s\-\+\(\)]+$/.test(phone), {
      message: "Please enter a valid phone number",
    }),
}).refine((data) => data.email || data.phone, {
  message: "Please provide either email or phone number",
  path: ["email"],
});

type RecoveryFormData = z.infer<typeof recoverySchema>;

export default function AccountRecovery() {
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
  });

  const onSubmit = async (data: RecoveryFormData) => {
    setIsLoading(true);
    setRecoveryError("");
    setRecoverySuccess("");

    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock validation - check against registered accounts
      const validEmails = ["patient@example.com", "user@demo.com"];
      const validPhones = ["+1234567890", "555-0123"];

      const emailMatches = data.email && validEmails.includes(data.email);
      const phoneMatches = data.phone && validPhones.some(p => 
        data.phone?.replace(/\D/g, '').includes(p.replace(/\D/g, ''))
      );

      if (!emailMatches && !phoneMatches) {
        setRecoveryError("Provided details do not match our records");
        return;
      }

      // Mock password reset process
      console.log("Generating password reset token with 15-minute expiry");
      console.log("Sending password reset link/code to:", data.email || data.phone);

      // Mock OAuth token creation (would be handled by backend)
      const mockToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log("OAuth reset token created:", mockToken);

      // Simulate secure API communication
      console.log("Using HTTPS for secure API communication");
      console.log("Token expires in 15 minutes");

      setRecoverySuccess(
        `A reset link has been sent to your provided contact${
          data.email ? ` (${data.email})` : data.phone ? ` (${data.phone})` : ""
        }. Please check your ${data.email ? "email" : "messages"} and follow the instructions to reset your password. This link will expire in 15 minutes.`
      );

      // Clear form
      reset();

    } catch {
      setRecoveryError("An error occurred while processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/atlantis-logo.svg"
              alt="Atlantis HMS Logo"
              width={150}
              height={40}
              priority
            />
          </Link>
        </div>
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Account Recovery
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email or phone number to reset your password
        </p>
      </div>

      {/* Recovery Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`block w-full ${
                    errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-describedby={errors.email ? "email-error" : "email-help"}
                  placeholder="Enter your registered email address"
                />
                <p id="email-help" className="mt-2 text-xs text-gray-500">
                  This must match the email address associated with your account
                </p>
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </Label>
              <div className="mt-1">
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className={`block w-full ${
                    errors.phone ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-describedby={errors.phone ? "phone-error" : "phone-help"}
                  placeholder="Enter your registered phone number"
                />
                <p id="phone-help" className="mt-2 text-xs text-gray-500">
                  Alternative recovery method if email is not accessible
                </p>
                {errors.phone && (
                  <p id="phone-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Success Message */}
            {recoverySuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {recoverySuccess}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {recoveryError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{recoveryError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Submit"}
              </Button>
            </div>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                href="/patient/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Login
              </Link>
            </div>
          </form>

          {/* Demo Information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Demo Recovery Details:</p>
            <p className="text-xs text-blue-700">Email: patient@example.com or user@demo.com</p>
            <p className="text-xs text-blue-700">Phone: +1234567890 or 555-0123</p>
          </div>
        </Card>
      </div>
    </div>
  );
}