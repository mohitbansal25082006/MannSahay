// E:\mannsahay\src\app\dashboard\settings\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Globe, 
  Camera, 
  Save,
  Trash2,
  Download,
  Upload,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    language: 'en',
    interests: [] as string[],
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    forumUpdates: true,
    resourceRecommendations: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowMessages: true,
    dataSharing: false,
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profileData.name,
        },
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Notification settings updated!');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Privacy settings updated!');
    } catch (error) {
      toast.error('Failed to update privacy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Account deletion requested. You will receive a confirmation email.');
    } catch (error) {
      toast.error('Failed to request account deletion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a dummy data export
      const data = {
        profile: profileData,
        notifications: notificationSettings,
        privacy: privacySettings,
        exportDate: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mannsahay-data-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const interestOptions = [
    'Anxiety', 'Depression', 'Stress Management', 'Relationships', 
    'Academic Pressure', 'Career Guidance', 'Self-Esteem', 'Mindfulness',
    'Sleep Issues', 'Social Anxiety', 'Family Issues', 'Personal Growth'
  ];

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account, privacy, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                  <AvatarFallback className="text-lg">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, GIF or PNG. Max size of 5MB.
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <select
                    id="language"
                    value={profileData.language}
                    onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>

                <div>
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interestOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={profileData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-reminders" className="text-base">Session Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminded about upcoming counseling sessions</p>
                  </div>
                  <Switch
                    id="session-reminders"
                    checked={notificationSettings.sessionReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, sessionReminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="forum-updates" className="text-base">Forum Updates</Label>
                    <p className="text-sm text-gray-500">Get notified about replies to your forum posts</p>
                  </div>
                  <Switch
                    id="forum-updates"
                    checked={notificationSettings.forumUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, forumUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="resource-recommendations" className="text-base">Resource Recommendations</Label>
                    <p className="text-sm text-gray-500">Receive personalized resource recommendations</p>
                  </div>
                  <Switch
                    id="resource-recommendations"
                    checked={notificationSettings.resourceRecommendations}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, resourceRecommendations: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleNotificationUpdate} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Manage your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Profile Visibility</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="public"
                        name="profile-visibility"
                        value="public"
                        checked={privacySettings.profileVisibility === 'public'}
                        onChange={() => setPrivacySettings(prev => ({ ...prev, profileVisibility: 'public' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="public">Public - Anyone can view your profile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="private"
                        name="profile-visibility"
                        value="private"
                        checked={privacySettings.profileVisibility === 'private'}
                        onChange={() => setPrivacySettings(prev => ({ ...prev, profileVisibility: 'private' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="private">Private - Only counselors can view your profile</Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="online-status" className="text-base">Show Online Status</Label>
                    <p className="text-sm text-gray-500">Let others see when you're online</p>
                  </div>
                  <Switch
                    id="online-status"
                    checked={privacySettings.showOnlineStatus}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-messages" className="text-base">Allow Messages</Label>
                    <p className="text-sm text-gray-500">Let other users send you messages</p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={privacySettings.allowMessages}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, allowMessages: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing" className="text-base">Data Sharing for Research</Label>
                    <p className="text-sm text-gray-500">Allow anonymized data usage for improving our services</p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, dataSharing: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handlePrivacyUpdate} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
                <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Key className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-red-800 font-medium">Delete Account</h4>
                      <p className="text-red-700 text-sm mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}