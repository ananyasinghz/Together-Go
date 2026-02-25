import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, Calendar, Users, Trash2, UserPlus, Check, X, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EventPoolTab({ user, eventPools, onRefresh, axiosConfig }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    event_link: '',
    members_needed: 2,
    requirements: '',
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/event-pools`, formData, axiosConfig);
      toast.success('Event pool created successfully!');
      setShowCreateDialog(false);
      setFormData({ event_name: '', event_date: '', event_link: '', members_needed: 2, requirements: '' });
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create event pool');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/event-pools/${id}`, axiosConfig);
      toast.success('Event pool deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete event pool');
    }
  };

  const handleJoin = async (id) => {
    try {
      await axios.post(`${API}/event-pools/join`, { group_id: id }, axiosConfig);
      toast.success('Join request sent!');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to join');
    }
  };

  const handleRequestAction = async (eventId, userId, action) => {
    try {
      await axios.post(`${API}/event-pools/request-action`, {
        group_id: eventId,
        user_id: userId,
        action: action,
      }, axiosConfig);
      toast.success(`Request ${action}ed`);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Action failed');
    }
  };

  const isCreator = (event) => event.creator_id === user.registration_no;
  const isMember = (event) => event.members.some(m => m.id === user.registration_no);
  const hasRequested = (event) => event.requests.some(r => r.id === user.registration_no);
  const isFull = (event) => event.members.length >= event.members_needed;

  return (
    <div className="space-y-6" data-testid="event-pool-tab">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Event Pools</h2>
          <p className="text-slate-600">Find groups to register for events together</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-slate-700 hover:bg-slate-800 text-white" data-testid="create-event-btn">
              <Plus className="h-4 w-4 mr-2" />
              Create Event Pool
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Create New Event Pool</DialogTitle>
              <DialogDescription className="text-slate-600">
                Create a group to register for an event together
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event_name" className="text-slate-700">Event Name</Label>
                <Input
                  id="event_name"
                  data-testid="event-name-input"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  placeholder="e.g., Tech Hackathon 2025"
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_date" className="text-slate-700">Event Date</Label>
                <Input
                  id="event_date"
                  data-testid="event-date-input"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_link" className="text-slate-700">Event Link (Optional)</Label>
                <Input
                  id="event_link"
                  data-testid="event-link-input"
                  type="url"
                  value={formData.event_link}
                  onChange={(e) => setFormData({ ...formData, event_link: e.target.value })}
                  placeholder="https://..."
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="members_needed" className="text-slate-700">Members Needed</Label>
                <Input
                  id="members_needed"
                  data-testid="members-needed-input"
                  type="number"
                  min="2"
                  max="20"
                  value={formData.members_needed}
                  onChange={(e) => setFormData({ ...formData, members_needed: parseInt(e.target.value) })}
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-slate-700">Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  data-testid="requirements-input"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Any specific requirements or details..."
                  className="border-slate-300"
                />
              </div>
              <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white" data-testid="submit-event-btn">
                Create Event Pool
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {eventPools.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-center text-slate-500 py-8">No event pools available. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {eventPools.map((event) => (
            <Card key={event.id} className="border-slate-200 card-hover" data-testid={`event-${event.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-slate-800">
                      {event.event_name}
                      {isFull(event) && (
                        <CheckCircle2 className="inline h-5 w-5 ml-2 text-green-500" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">By {event.creator_name}</p>
                  </div>
                  {isCreator(event) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      data-testid={`delete-event-${event.id}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-slate-700">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                  {new Date(event.event_date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <Users className="h-4 w-4 mr-2 text-slate-500" />
                  {event.members.length} / {event.members_needed} members
                </div>
                {event.event_link && (
                  <a
                    href={event.event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Event Link
                  </a>
                )}
                {event.requirements && (
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{event.requirements}</p>
                )}
                
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-700 mb-2">Members:</p>
                  <div className="flex flex-wrap gap-1">
                    {event.members.map((member) => (
                      <span key={member.id} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>

                {isFull(event) && isMember(event) && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm font-medium text-green-700">🎉 Group is complete!</p>
                    <p className="text-xs text-green-600 mt-1">You can now proceed with registration</p>
                  </div>
                )}

                {isCreator(event) && event.requests.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-2">Join Requests:</p>
                    <div className="space-y-2">
                      {event.requests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                          <span className="text-sm text-slate-700">{request.name}</span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRequestAction(event.id, request.id, 'accept')}
                              data-testid={`accept-event-${request.id}`}
                              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRequestAction(event.id, request.id, 'reject')}
                              data-testid={`reject-event-${request.id}`}
                              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isMember(event) && !hasRequested(event) && !isCreator(event) && (
                  <Button
                    onClick={() => handleJoin(event.id)}
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                    data-testid={`join-event-${event.id}`}
                    disabled={isFull(event)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isFull(event) ? 'Group Full' : 'Request to Join'}
                  </Button>
                )}

                {hasRequested(event) && !isMember(event) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                    <p className="text-sm text-yellow-700">Request pending</p>
                  </div>
                )}

                {isMember(event) && !isCreator(event) && !isFull(event) && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                    <p className="text-sm text-blue-700">You're in this group</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
