import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  CreditCard, 
  FileText, 
  User, 
  Shield,
  Activity
} from "lucide-react";
import { mockRecentActivity } from "@/lib/mockDashboardData";

const iconMap = {
  Calendar,
  CreditCard,
  FileText,
  User,
  Shield,
  Activity
};

export function RecentActivity() {
  const recentActivities = mockRecentActivity.slice(0, 5);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Activity className="w-5 h-5 text-green-600" />
      </div>

      <div className="space-y-4">
        {recentActivities.map((activity) => {
          const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Activity;
          
          return (
            <div 
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-4 h-4 text-green-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {recentActivities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </Card>
  );
}