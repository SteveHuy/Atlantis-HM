import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar, 
  Bell, 
  Shield,
  CreditCard,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { dashboardLogger } from "@/lib/logger";

export const iconMap = {
  FileText,
  Calendar,
  Bell,
  Shield,
  CreditCard,
  User,
  Settings,
  LogOut
};

export const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600", 
  yellow: "bg-yellow-100 text-yellow-600",
  purple: "bg-purple-100 text-purple-600",
  red: "bg-red-100 text-red-600",
  gray: "bg-gray-100 text-gray-600"
};

export type IconName = keyof typeof iconMap;
export type ColorName = keyof typeof colorClasses;

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  color: ColorName;
  onClick?: () => void;
  requirementRef?: string;
}

export function FeatureCard({ 
  id, 
  title, 
  description, 
  icon, 
  color, 
  onClick,
  requirementRef 
}: FeatureCardProps) {
  const IconComponent = iconMap[icon];
  const colorClass = colorClasses[color];

  const handleClick = () => {
    // Log the interaction
    dashboardLogger.logDashboardEvent('feature_card_click', {
      featureId: id,
      featureTitle: title,
      requirementRef
    });

    if (onClick) {
      onClick();
    } else if (requirementRef) {
      // Show placeholder message for features not yet implemented
      alert(`UD-REF: ${requirementRef} - will be implemented in future epic`);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-4">
        <Button 
          className="w-full" 
          onClick={handleClick}
          aria-label={`Navigate to ${title}`}
        >
          Access {title}
        </Button>
      </div>
    </Card>
  );
}