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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function PatientLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const rememberMe = watch("rememberMe") || false;

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError("");

    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation - for demo purposes
      if (data.username === "patient" && data.password === "Password123!") {
        // Mock successful login
        console.log("Login successful, user activity logged");
        
        // Mock session creation
        if (data.rememberMe === true) {
          localStorage.setItem("atlantis_session", JSON.stringify({
            user: data.username,
            expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
          }));
        } else {
          sessionStorage.setItem("atlantis_session", JSON.stringify({
            user: data.username,
            expiry: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
          }));
        }

        // UD-REF: #Patient Dashboard - will be implemented in future epic
        alert("Login successful! Patient Dashboard will be available in a future update.");
      } else {
        setLoginError("Invalid username or password");
      }
    } catch {
      setLoginError("An error occurred during login. Please try again.");
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
          Login to Atlantis HMS
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/patient/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      {/* Login Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
            {/* Username Field */}
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </Label>
              <div className="mt-1">
                <Input
                  id="username"
                  type="text"
                  {...register("username")}
                  className={`block w-full ${
                    errors.username ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  aria-describedby={errors.username ? "username-error" : undefined}
                  autoComplete="off"
                />
                {errors.username && (
                  <p id="username-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.username.message}
                  </p>
                )}
              </div>
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
                  aria-describedby={errors.password ? "password-error" : undefined}
                  autoComplete="off"
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
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked: boolean) => setValue("rememberMe", checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember Me (keeps you logged in for 30 days)
              </Label>
            </div>

            {/* Error Message */}
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </div>

            {/* Additional Links */}
            <div className="flex flex-col space-y-2 text-center">
              <Link
                href="/account/recover"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot Password?
              </Link>
              <Link
                href="/patient/register"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Sign Up
              </Link>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-700">Username: patient</p>
            <p className="text-xs text-blue-700">Password: Password123!</p>
          </div>
        </Card>
      </div>
    </div>
  );
}