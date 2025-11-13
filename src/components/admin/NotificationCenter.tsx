import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export const NotificationCenter = () => {
  const { unreadCount } = useRealtimeNotifications();

  return (
    <div className="relative">
      <Button variant="outline" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};
