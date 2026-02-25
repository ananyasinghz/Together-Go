import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, MapPin, Calendar, Users, Trash2, UserPlus, Check, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CarpoolTab({ user, carpools, onRefresh, axiosConfig }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date_time: '',
    seats: 4,
    notes: '',
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/carpools`, formData, axiosConfig);
      toast.success('Carpool created successfully!');
      setShowCreateDialog(false);
      setFormData({ source: '', destination: '', date_time: '', seats: 4, notes: '' });
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create carpool');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/carpools/${id}`, axiosConfig);
      toast.success('Carpool deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete carpool');
    }
  };

  const handleJoin = async (id) => {
    try {
      await axios.post(`${API}/carpools/join`, { group_id: id }, axiosConfig);
      toast.success('Join request sent!');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to join');
    }
  };

  const handleRequestAction = async (carpoolId, userId, action) => {
    try {
      await axios.post(`${API}/carpools/request-action`, {
        group_id: carpoolId,
        user_id: userId,
        action: action,
      }, axiosConfig);
      toast.success(`Request ${action}ed`);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Action failed');
    }
  };

  const isCreator = (carpool) => carpool.creator_id === user.registration_no;
  const isMember = (carpool) => carpool.members.some(m => m.id === user.registration_no);
  const hasRequested = (carpool) => carpool.requests.some(r => r.id === user.registration_no);

  return (
    <div className="space-y-6" data-testid="carpool-tab">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Carpools</h2>
          <p className="text-slate-600">Find or create carpool groups</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-slate-700 hover:bg-slate-800 text-white" data-testid="create-carpool-btn">
              <Plus className="h-4 w-4 mr-2" />
              Create Carpool
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Create New Carpool</DialogTitle>
              <DialogDescription className="text-slate-600">
                Fill in the details for your carpool
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-slate-700">Source Location</Label>
                <Input
                  id="source"
                  data-testid="carpool-source-input"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g., Campus Main Gate"
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-slate-700">Destination</Label>
                <Input
                  id="destination"
                  data-testid="carpool-destination-input"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g., Railway Station"
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_time" className="text-slate-700">Date & Time</Label>
                <Input
                  id="date_time"
                  data-testid="carpool-datetime-input"
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats" className="text-slate-700">Available Seats</Label>
                <Input
                  id="seats"
                  data-testid="carpool-seats-input"
                  type="number"
                  min="2"
                  max="10"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  data-testid="carpool-notes-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                  className="border-slate-300"
                />
              </div>
              <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white" data-testid="submit-carpool-btn">
                Create Carpool
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {carpools.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-center text-slate-500 py-8">No carpools available. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {carpools.map((carpool) => (
            <Card key={carpool.id} className="border-slate-200 card-hover " data-testid={`carpool-${carpool.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-slate-800 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-slate-500" />
                      {carpool.source} → {carpool.destination}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">By {carpool.creator_name}</p>
                  </div>
                  {isCreator(carpool) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(carpool.id)}
                      data-testid={`delete-carpool-${carpool.id}`}
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
                  {new Date(carpool.date_time).toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <Users className="h-4 w-4 mr-2 text-slate-500" />
                  {carpool.members.length} / {carpool.seats} seats filled
                </div>
                {carpool.notes && (
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{carpool.notes}</p>
                )}
                
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-700 mb-2">Members:</p>
                  <div className="flex flex-wrap gap-1">
                    {carpool.members.map((member) => (
                      <span key={member.id} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>

                {isCreator(carpool) && carpool.requests.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-2">Join Requests:</p>
                    <div className="space-y-2">
                      {carpool.requests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                          <span className="text-sm text-slate-700">{request.name}</span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRequestAction(carpool.id, request.id, 'accept')}
                              data-testid={`accept-${request.id}`}
                              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRequestAction(carpool.id, request.id, 'reject')}
                              data-testid={`reject-${request.id}`}
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

                {!isMember(carpool) && !hasRequested(carpool) && !isCreator(carpool) && (
                  <Button
                    onClick={() => handleJoin(carpool.id)}
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                    data-testid={`join-carpool-${carpool.id}`}
                    disabled={carpool.members.length >= carpool.seats}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {carpool.members.length >= carpool.seats ? 'Full' : 'Request to Join'}
                  </Button>
                )}

                {hasRequested(carpool) && !isMember(carpool) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                    <p className="text-sm text-yellow-700">Request pending</p>
                  </div>
                )}

                {isMember(carpool) && !isCreator(carpool) && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <p className="text-sm text-green-700">You're in this carpool</p>
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
