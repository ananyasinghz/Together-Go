import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Send } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ChatTab({ user, carpools, eventPools, axiosConfig, wsRef }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  const myGroups = [
    ...carpools.filter(c => c.members.some(m => m.id === user.registration_no)).map(c => ({ ...c, type: 'carpool', displayName: `${c.source} → ${c.destination}` })),
    ...eventPools.filter(e => e.members.some(m => m.id === user.registration_no)).map(e => ({ ...e, type: 'event', displayName: e.event_name }))
  ];

  useEffect(() => {
    if (selectedGroup && selectedType) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedGroup, selectedType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages/${selectedGroup}`, axiosConfig);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API}/messages`, {
        group_id: selectedGroup,
        group_type: selectedType,
        message: newMessage,
      }, axiosConfig);
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectGroup = (groupId, groupType) => {
    setSelectedGroup(groupId);
    setSelectedType(groupType);
    setMessages([]);
  };

  return (
    <div className="space-y-6" data-testid="chat-tab">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Chat</h2>
        <p className="text-slate-600">Message your group members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Group List */}
        <Card className="border-slate-200 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-800">Your Groups</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {myGroups.length === 0 ? (
                <p className="text-center text-slate-500 py-8 px-4">Join a carpool or event to start chatting</p>
              ) : (
                <div className="space-y-1 p-4">
                  {myGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => selectGroup(group.id, group.type)}
                      data-testid={`chat-group-${group.id}`}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedGroup === group.id
                          ? 'bg-slate-700 text-white'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{group.displayName}</p>
                      <p className={`text-xs mt-1 ${
                        selectedGroup === group.id ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {group.members.length} members
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="border-slate-200 lg:col-span-2">
          {!selectedGroup ? (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-slate-500">Select a group to start chatting</p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-800">
                  {myGroups.find(g => g.id === selectedGroup)?.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col h-[500px]">
                <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-3 ${
                          msg.sender_id === user.registration_no ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                        data-testid={`message-${msg.id}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                            {msg.sender_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 max-w-[70%] ${
                          msg.sender_id === user.registration_no ? 'items-end' : ''
                        }`}>
                          <p className={`text-xs text-slate-500 mb-1 ${
                            msg.sender_id === user.registration_no ? 'text-right' : ''
                          }`}>
                            {msg.sender_id === user.registration_no ? 'You' : msg.sender_name}
                          </p>
                          <div className={`rounded-lg p-3 ${
                            msg.sender_id === user.registration_no
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className={`text-xs text-slate-400 mt-1 ${
                            msg.sender_id === user.registration_no ? 'text-right' : ''
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-200">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    data-testid="message-input"
                    className="flex-1 border-slate-300"
                  />
                  <Button type="submit" size="icon" className="bg-slate-700 hover:bg-slate-800 text-white" data-testid="send-message-btn">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
