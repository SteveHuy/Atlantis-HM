"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const insuranceProviders = [
  "Aetna",
  "Blue Cross Blue Shield",
  "Cigna",
  "Humana",
  "Kaiser Permanente",
  "Medicare",
  "Medicaid",
  "UnitedHealthcare"
];

const insuranceSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  policyNumber: z.string().min(1, "Policy number is required").min(3, "Policy number must be at least 3 characters")
});

type InsuranceForm = z.infer<typeof insuranceSchema>;

export default function InsuranceDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<InsuranceForm>({
    provider: "",
    policyNumber: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InsuranceForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    try {
      insuranceSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof InsuranceForm, string>> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0] as keyof InsuranceForm;
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to submit insurance details
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowSuccess(true);

      // Redirect to Patient Dashboard after showing success message
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting insurance details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof InsuranceForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Insurance details submitted for verification
              </h2>
              <p className="text-gray-600 mb-4">
                Your insurance information has been successfully submitted. You will be redirected to your dashboard shortly.
              </p>
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
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
            <div className="flex items-center space-x-4">
              <Link
                href="/patient/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Insurance Details</h1>
          </div>
          <p className="text-gray-600">
            Submit your insurance information to verify your coverage for medical services.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Insurance Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="provider">Insurance Provider *</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => handleFieldChange('provider', value)}
                >
                  <SelectTrigger className={errors.provider ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your insurance provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.provider && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.provider}
                  </p>
                )}
              </div>

              {/* Policy Number */}
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number *</Label>
                <Input
                  id="policyNumber"
                  type="text"
                  value={formData.policyNumber}
                  onChange={(e) => handleFieldChange('policyNumber', e.target.value)}
                  placeholder="Enter your policy number"
                  className={errors.policyNumber ? "border-red-500" : ""}
                />
                {errors.policyNumber && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.policyNumber}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Submit Insurance Details
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Information Alert */}
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your insurance information will be verified with your provider. This process may take 24-48 hours to complete.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
