import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';
import DashboardTab from '../components/student/DashboardTab';
import CarpoolTab from '../components/student/CarpoolTab';
import EventPoolTab from '../components/student/EventPoolTab';
import ChatTab from '../components/student/ChatTab';
import NotificationsTab from '../components/student/NotificationsTab';
import ProfileTab from '../components/student/ProfileTab';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [carpools, setCarpools] = useState([]);
  const [eventPools, setEventPools] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchCarpools();
    fetchEventPools();
    fetchNotifications();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket(`${WS_URL}/ws/${user.registration_no}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        setNotifications(prev => [data.data, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.info(data.data.content);
      } else if (data.type === 'message') {
        // Handle real-time messages in chat component
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current = ws;
  };

  const fetchCarpools = async () => {
    try {
      const response = await axios.get(`${API}/carpools`, axiosConfig);
      setCarpools(response.data);
    } catch (error) {
      console.error('Error fetching carpools:', error);
    }
  };

  const fetchEventPools = async () => {
    try {
      const response = await axios.get(`${API}/event-pools`, axiosConfig);
      setEventPools(response.data);
    } catch (error) {
      console.error('Error fetching event pools:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`, axiosConfig);
      setNotifications(response.data);
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    onLogout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="student-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">TG</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">TogetherGo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.registration_no}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-slate-200 text-slate-700">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="logout-btn"
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="carpool" data-testid="tab-carpool">Carpool</TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">Event Pool</TabsTrigger>
            <TabsTrigger value="chat" data-testid="tab-chat">Chat</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab
              user={user}
              carpools={carpools}
              eventPools={eventPools}
              onNavigate={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="carpool">
            <CarpoolTab
              user={user}
              carpools={carpools}
              onRefresh={fetchCarpools}
              axiosConfig={axiosConfig}
            />
          </TabsContent>

          <TabsContent value="events">
            <EventPoolTab
              user={user}
              eventPools={eventPools}
              onRefresh={fetchEventPools}
              axiosConfig={axiosConfig}
            />
          </TabsContent>

          <TabsContent value="chat">
            <ChatTab
              user={user}
              carpools={carpools}
              eventPools={eventPools}
              axiosConfig={axiosConfig}
              wsRef={wsRef}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab
              notifications={notifications}
              onRefresh={fetchNotifications}
              onMarkRead={(id) => {
                setNotifications(prev =>
                  prev.map(n => n.id === id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
              }}
              axiosConfig={axiosConfig}
            />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab user={user} axiosConfig={axiosConfig} carpools={carpools} eventPools={eventPools} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
