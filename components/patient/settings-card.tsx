import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Phone } from "lucide-react";
import Link from "next/link";
import { dashboardLogger } from "@/lib/logger";

export function SettingsCard() {
  const handleEmergencyContact = () => {
    dashboardLogger.logDashboardEvent('update_emergency_contact_click');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
        <Settings className="w-5 h-5 text-gray-600" />
      </div>

      <div className="space-y-3">
        <Link href="/patient/profile">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => dashboardLogger.logDashboardEvent('manage_profile_click')}
          >
            <User className="w-4 h-4 mr-2" />
            Manage Profile
          </Button>
        </Link>

        <Link href="/patient/emergency-contact">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleEmergencyContact}
          >
            <Phone className="w-4 h-4 mr-2" />
            Update Emergency Contact
          </Button>
        </Link>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Keep your profile and emergency contact information up to date 
          for better care coordination.
        </p>
      </div>
    </Card>
  );
}