import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { User, Lock, Car, Calendar } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProfileTab({ user, axiosConfig, carpools, eventPools }) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const myCarpools = carpools.filter(c => c.members.some(m => m.id === user.registration_no));
  const myEvents = eventPools.filter(e => e.members.some(m => m.id === user.registration_no));
  const createdCarpools = carpools.filter(c => c.creator_id === user.registration_no);
  const createdEvents = eventPools.filter(e => e.creator_id === user.registration_no);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.post(
        `${API}/auth/change-password`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        axiosConfig
      );
      toast.success('Password changed successfully!');
      setShowPasswordDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-6" data-testid="profile-tab">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Profile Settings</h2>
        <p className="text-slate-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-700">Name</Label>
              <p className="text-slate-800 font-medium mt-1">{user.name}</p>
            </div>
            <div>
              <Label className="text-slate-700">Registration Number</Label>
              <p className="text-slate-800 font-medium mt-1">{user.registration_no}</p>
            </div>
            <div>
              <Label className="text-slate-700">Account Status</Label>
              <p className="text-slate-800 font-medium mt-1">
                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-sm">Active</span>
              </p>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button className="bg-slate-700 hover:bg-slate-800 text-white" data-testid="change-password-btn">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">Change Password</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Enter your current password and a new password
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old-password" className="text-slate-700">Current Password</Label>
                    <Input
                      id="old-password"
                      data-testid="old-password-input"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-slate-700">New Password</Label>
                    <Input
                      id="new-password"
                      data-testid="profile-new-password-input"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-700">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      data-testid="profile-confirm-password-input"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-slate-300"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white" data-testid="submit-password-change-btn">
                    Change Password
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-slate-500" />
                <span className="text-sm text-slate-700">Carpools Joined</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">{myCarpools.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                <span className="text-sm text-slate-700">Events Joined</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">{myEvents.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-slate-500" />
                <span className="text-sm text-slate-700">Carpools Created</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">{createdCarpools.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                <span className="text-sm text-slate-700">Events Created</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">{createdEvents.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
