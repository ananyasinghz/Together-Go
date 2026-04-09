import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';
import { Upload, Users, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/users`, axiosConfig);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/upload-students`, formData, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message);
      setUploadFile(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (registrationNo) => {
    try {
      await axios.post(
        `${API}/admin/reset-password?registration_no=${registrationNo}`,
        {},
        axiosConfig
      );
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">TG</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">TogetherGo Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-slate-700 text-white">AD</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                data-testid="admin-logout-btn"
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
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="upload" data-testid="admin-tab-upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Students
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="admin-tab-users">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-800">Upload Student List</CardTitle>
                <CardDescription className="text-slate-600">
                  Upload an Excel file (.xls or .xlsx) with student data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-slate-700">Select File</Label>
                  <Input
                    id="file-upload"
                    data-testid="file-upload-input"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="border-slate-300"
                  />
                  {uploadFile && (
                    <p className="text-sm text-slate-600">Selected: {uploadFile.name}</p>
                  )}
                </div>
                <Button
                  onClick={handleFileUpload}
                  disabled={loading || !uploadFile}
                  data-testid="upload-btn"
                  className="bg-slate-700 hover:bg-slate-800 text-white"
                >
                  {loading ? 'Uploading...' : 'Upload Students'}
                </Button>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-slate-700 font-medium mb-2">Required columns:</p>
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Reg. No. (Registration Number)</li>
                    <li>Name (Student Name)</li>
                  </ul>
                  <p className="text-sm text-slate-600 mt-3">
                    Default password format: <code className="bg-slate-100 px-2 py-0.5 rounded">firstname + last 4 digits</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-slate-800">User Management</CardTitle>
                    <CardDescription className="text-slate-600">
                      View and manage registered students
                    </CardDescription>
                  </div>
                  <Button
                    onClick={fetchUsers}
                    disabled={loading}
                    data-testid="refresh-users-btn"
                    variant="outline"
                    size="sm"
                    className="border-slate-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {users.length === 0 && !loading ? (
                  <p className="text-center text-slate-500 py-8">No users found. Upload students to get started.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="users-table">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Reg. No.</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">First Login</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Admin</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.registration_no} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-800">{u.registration_no}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{u.name}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${u.first_login ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {u.first_login ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${u.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                {u.is_admin ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {!u.is_admin && (
                                <Button
                                  onClick={() => handleResetPassword(u.registration_no)}
                                  variant="outline"
                                  size="sm"
                                  data-testid={`reset-password-${u.registration_no}`}
                                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                                >
                                  Reset Password
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
