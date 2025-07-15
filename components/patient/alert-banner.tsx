import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  X, 
  Mail,
  MessageSquare
} from "lucide-react";
import { mockNotifications } from "@/lib/mockDashboardData";
import { dashboardLogger } from "@/lib/logger";
import { useRouter } from "next/navigation";

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  error: XCircle
};

const colorClasses = {
  warning: "border-yellow-200 bg-yellow-50",
  info: "border-blue-200 bg-blue-50",
  success: "border-green-200 bg-green-50", 
  error: "border-red-200 bg-red-50"
};

export function AlertBanner() {
  const router = useRouter();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  const visibleNotifications = mockNotifications.filter(
    notification => !dismissedAlerts.includes(notification.id)
  );

  const handleDismiss = (notificationId: string) => {
    setDismissedAlerts(prev => [...prev, notificationId]);
    dashboardLogger.logDashboardEvent('notification_dismissed', { notificationId });
  };

  const handleNotificationClick = (notification: { id: string; type: string; title: string; message: string }) => {
    dashboardLogger.logDashboardEvent('notification_clicked', { 
      notificationId: notification.id,
      type: notification.type 
    });

    if (notification.title === "Unread Messages") {
      router.push('/patient/messages');
    } else if (notification.title === "Verify Your Email") {
      alert("Email verification will be implemented in future epic");
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {visibleNotifications.map((notification) => {
        const IconComponent = iconMap[notification.type];
        const colorClass = colorClasses[notification.type];
        
        return (
          <Alert 
            key={notification.id} 
            className={`${colorClass} cursor-pointer`}
            onClick={() => handleNotificationClick(notification)}
          >
            <IconComponent className="h-4 w-4" />
            <div className="flex-1">
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong className="font-medium">{notification.title}</strong>
                  <p className="mt-1 text-sm">{notification.message}</p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {notification.title === "Unread Messages" && (
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  )}
                  {notification.title === "Verify Your Email" && (
                    <Mail className="h-4 w-4 text-yellow-600" />
                  )}
                  
                  {notification.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notification.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}