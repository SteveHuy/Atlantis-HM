import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink, DollarSign } from "lucide-react";
import { mockInsuranceClaims } from "@/lib/mockDashboardData";
import { dashboardLogger } from "@/lib/logger";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Processing: "bg-blue-100 text-blue-800 border-blue-200", 
  Approved: "bg-green-100 text-green-800 border-green-200",
  Denied: "bg-red-100 text-red-800 border-red-200"
};

export function ClaimStatus() {
  const recentClaims = mockInsuranceClaims.slice(0, 3);

  const handleViewClaim = (claimId: string) => {
    dashboardLogger.logDashboardEvent('view_insurance_claim', { claimId });
    alert("UD-REF: #View Insurance Claims - will be implemented in future epic");
  };

  const handleViewAllClaims = () => {
    dashboardLogger.logDashboardEvent('view_all_insurance_claims');
    alert("UD-REF: #View Insurance Claims - will be implemented in future epic");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Insurance Claims</h3>
        <Shield className="w-5 h-5 text-purple-600" />
      </div>

      <div className="space-y-4">
        {recentClaims.map((claim) => (
          <div 
            key={claim.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleViewClaim(claim.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {claim.claimNumber}
                  </span>
                  <Badge 
                    className={statusColors[claim.status]}
                    variant="outline"
                  >
                    {claim.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {claim.description}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>${claim.amount.toFixed(2)}</span>
              </div>
              <span className="text-gray-500">
                Submitted {new Date(claim.submittedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {recentClaims.length === 0 && (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No insurance claims</p>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={() => alert("UD-REF: #Submit Insurance Details - will be implemented in future epic")}
          >
            Submit New Claim
          </Button>
        </div>
      )}

      {recentClaims.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleViewAllClaims}
          >
            View All Claims
          </Button>
        </div>
      )}
    </Card>
  );
}