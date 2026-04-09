import { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
// import { toast } from 'sonner';
import { toast } from 'sonner';
import { Toaster } from 'sonner';



const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ onLogin }) {
  const [registrationNo, setRegistrationNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [tempUser, setTempUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        registration_no: registrationNo,
        password: password,
      });

      const { access_token, user } = response.data;

      if (user.first_login) {
        setTempToken(access_token);
        setTempUser(user);
        setShowPasswordChange(true);
        toast.info('Please change your password on first login');
      } else {
        onLogin(user, access_token);
        toast.success('Login successful!');
      }
    } catch (error) {
      // toast.error(error.response?.data?.detail || 'Login failed');
      console.error("Login error:", error);

  const msg =
    error.response?.data?.detail || // this matches your backend's {detail: 'Invalid credentials'}
    (error.response?.status === 401 ? "Invalid credentials" : null) ||
    "Login failed. Please try again.";

  toast.error(msg);
    } finally {
      setLoading(false);
    }
  
  };

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

    setLoading(true);

    try {
      await axios.post(
        `${API}/auth/change-password`,
        {
          old_password: password,
          new_password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${tempToken}` },
        }
      );

      toast.success('Password changed successfully!');
      onLogin({ ...tempUser, first_login: false }, tempToken);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
    
  };

  if (showPasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md" data-testid="password-change-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-slate-800">Change Password</CardTitle>
            <CardDescription className="text-slate-600">
              Please set a new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-slate-700">New Password</Label>
                <Input
                  id="new-password"
                  data-testid="new-password-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-slate-700">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  data-testid="confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-slate-300"
                />
              </div>
              <Button
                type="submit"
                data-testid="change-password-btn"
                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Toaster
        position="top-right"
        richColors
        closeButton
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">TogetherGo</h1>
          <p className="text-slate-600">Carpool & Event Pool Platform</p>
        </div>
        
        <Card data-testid="login-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-slate-800">Login</CardTitle>
            <CardDescription className="text-slate-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registration-no" className="text-slate-700">Registration Number</Label>
                <Input
                  id="registration-no"
                  data-testid="registration-no-input"
                  type="text"
                  placeholder="e.g., 23bps1125"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-slate-300"
                />
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-slate-700">
                  <strong>First time?</strong> Your default password is: firstname + last 4 digits of reg. no.
                </AlertDescription>
              </Alert>
              <Button
                type="submit"
                data-testid="login-btn"
                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
