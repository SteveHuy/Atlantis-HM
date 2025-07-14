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
import { AlertCircle, Eye, EyeOff, Check, X } from "lucide-react";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*?]/, "Password must contain at least one special character (!@#$%^&*?)");

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(128, "Name must be 128 characters or less"),
    companyName: z
      .string()
      .max(256, "Company name must be 256 characters or less")
      .optional(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(256, "Email must be 256 characters or less"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "Minimum 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "At least one uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "At least one lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "At least one number", test: (pwd) => /\d/.test(pwd) },
  { label: "At least one special character (!@#$%^&*?)", test: (pwd) => /[!@#$%^&*?]/.test(pwd) },
];

export default function PatientRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");
  const email = watch("email", "");

  const checkEmailUniqueness = async (email: string) => {
    if (!email || !email.includes("@")) return;
    
    setIsCheckingEmail(true);
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock existing email check
      if (email === "existing@example.com") {
        setError("email", { message: "This email is already registered" });
      }
    } catch (err) {
      console.error("Error checking email:", err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Debounce email check
  useState(() => {
    const timeoutId = setTimeout(() => {
      if (email && !errors.email) {
        checkEmailUniqueness(email);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setRegistrationError("");

    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock registration process
      console.log("Creating patient account:", {
        name: data.name,
        companyName: data.companyName || null,
        email: data.email,
        // Password would be hashed on server
      });

      // Mock verification email
      console.log("Sending verification email to:", data.email);

      // Show success message
      alert("Registration successful, please verify your email");

      // UD-REF: #Schedule Appointment - will be implemented in future epic
      alert("Schedule Appointment feature will be available in a future update.");

    } catch {
      setRegistrationError("An error occurred during registration. Please try again.");
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
          Patient Registration
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/patient/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Registration Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </Label>
              <div className="mt-1">
                <Input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`block w-full ${
                    errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  maxLength={128}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Company Name Field */}
            <div>
              <Label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name (Optional)
              </Label>
              <div className="mt-1">
                <Input
                  id="companyName"
                  type="text"
                  {...register("companyName")}
                  className={`block w-full ${
                    errors.companyName ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-describedby={errors.companyName ? "company-error" : undefined}
                  maxLength={256}
                />
                {errors.companyName && (
                  <p id="company-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.companyName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`block w-full ${
                    errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  maxLength={256}
                />
                {isCheckingEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`block w-full pr-10 ${
                    errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-describedby="password-requirements"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div id="password-requirements" className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => {
                    const isValid = req.test(password);
                    return (
                      <li key={index} className="flex items-center text-xs">
                        {isValid ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" aria-hidden="true" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-2" aria-hidden="true" />
                        )}
                        <span className={isValid ? "text-green-700" : "text-red-600"}>
                          {req.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {errors.password && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`block w-full pr-10 ${
                    errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {registrationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{registrationError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <Link
                href="/patient/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}