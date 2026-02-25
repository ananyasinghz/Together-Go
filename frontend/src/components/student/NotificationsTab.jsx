import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Bell, Check } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function NotificationsTab({ notifications, onRefresh, onMarkRead, axiosConfig }) {
  const handleMarkRead = async (id) => {
    try {
      await axios.post(`${API}/notifications/${id}/read`, {}, axiosConfig);
      onMarkRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    return <Bell className="h-5 w-5" />;
  };

  const getNotificationColor = (type) => {
    if (type.includes('accepted')) return 'bg-green-50 border-green-200';
    if (type.includes('rejected')) return 'bg-red-50 border-red-200';
    if (type.includes('request')) return 'bg-blue-50 border-blue-200';
    if (type.includes('full')) return 'bg-purple-50 border-purple-200';
    return 'bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-6" data-testid="notifications-tab">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Notifications</h2>
          <p className="text-slate-600">Stay updated with your activities</p>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          data-testid="refresh-notifications-btn"
          className="border-slate-300"
        >
          Refresh
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">All Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {notifications.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No notifications yet</p>
            ) : (
              <div className="space-y-2 p-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    data-testid={`notification-${notification.id}`}
                    className={`p-4 rounded-lg border transition-all ${
                      notification.read ? 'bg-white border-slate-200' : getNotificationColor(notification.type)
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`mt-1 ${
                          notification.read ? 'text-slate-400' : 'text-slate-700'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${
                            notification.read ? 'text-slate-600' : 'text-slate-800 font-medium'
                          }`}>
                            {notification.content}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          onClick={() => handleMarkRead(notification.id)}
                          variant="ghost"
                          size="sm"
                          data-testid={`mark-read-${notification.id}`}
                          className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
