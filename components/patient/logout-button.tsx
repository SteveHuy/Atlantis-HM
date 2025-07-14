import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { dashboardLogger } from "@/lib/logger";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Log the logout event
      dashboardLogger.logDashboardEvent('patient_logout');
      
      // Clear session
      localStorage.removeItem("atlantis_session");
      sessionStorage.removeItem("atlantis_session");
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to login
      window.location.href = "/patient/login";
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Card className="p-6 border-red-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Session</h3>
        <LogOut className="w-5 h-5 text-red-600" />
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Securely log out of your account when you&apos;re finished.
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </Button>
        </AlertDialogTrigger>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You&apos;ll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Yes, Log Out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}