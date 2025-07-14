"use client";

import { useState, useEffect } from "react";
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
import { AlertCircle, Eye, EyeOff, Check, X, ArrowLeft } from "lucide-react";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*?]/, "Password must contain at least one special character (!@#$%^&*?)");

const profileSchema = z
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
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => {
    if (data.password && !data.confirmPassword) {
      return false;
    }
    if (!data.password && data.confirmPassword) {
      return false;
    }
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => {
    if (data.password) {
      return passwordSchema.safeParse(data.password).success;
    }
    return true;
  }, {
    message: "Password must meet security requirements",
    path: ["password"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;

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

interface UserSession {
  user: string;
  expiry: number;
}

export default function PatientProfile() {
  const [user, setUser] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  useEffect(() => {
    // Check for user session
    const sessionData = localStorage.getItem("atlantis_session") || 
                       sessionStorage.getItem("atlantis_session");
    
    if (sessionData) {
      try {
        const session: UserSession = JSON.parse(sessionData);
        if (session.expiry > Date.now()) {
          setUser(session.user);
          
          // Load mock user data (would come from API in real app)
          setValue("name", "John Doe");
          setValue("companyName", "Acme Healthcare");
          setValue("email", "john.doe@example.com");
        } else {
          // Session expired
          localStorage.removeItem("atlantis_session");
          sessionStorage.removeItem("atlantis_session");
          window.location.href = "/patient/login";
        }
      } catch (error) {
        console.error("Error parsing session:", error);
        window.location.href = "/patient/login";
      }
    } else {
      // No session found
      window.location.href = "/patient/login";
    }
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setUpdateError("");

    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock profile update
      console.log("Updating user profile:", {
        name: data.name,
        companyName: data.companyName || null,
        email: data.email,
        passwordChanged: !!data.password,
      });

      // Show success message
      alert("Profile updated successfully");

      // Redirect back to dashboard
      window.location.href = "/patient/dashboard";

    } catch {
      setUpdateError("An error occurred while updating your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/patient/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Profile</h1>
          <p className="mt-2 text-gray-600">
            Update your personal information and account settings
          </p>
        </div>

        <Card className="p-8">
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
              <div className="mt-1">
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
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change Password (Optional)
              </h3>
              
              {/* New Password Field */}
              <div className="mb-4">
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
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

                {password && (
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
                )}

                {errors.password && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
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
            </div>

            {/* Error Message */}
            {updateError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving Changes..." : "Save Changes"}
              </Button>
              <Link href="/patient/dashboard">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}