import { useState } from 'react';
import { 
  User, Bell, Shield, Palette, Code2, Globe, 
  Moon, Sun, Volume2, VolumeX, Save, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockUser } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [username, setUsername] = useState(mockUser.username);
  const [email, setEmail] = useState(mockUser.email);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    contests: true,
    streaks: true,
    xp: true,
    rank: true,
    duels: true,
    email: false,
  });

  // Appearance settings
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sounds, setSounds] = useState(true);

  // Editor settings
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    autoComplete: true,
    lineNumbers: true,
    wordWrap: false,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            SETTINGS
          </h1>
          <p className="text-muted-foreground">
            Configure your CodeLock experience
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="w-full justify-start bg-card border border-border p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary/20">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary/20">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-primary/20">
              <Code2 className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-primary/20">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="m-0">
            <div className="arena-card p-6 space-y-6">
              <h2 className="font-display text-xl font-bold text-foreground">Profile Settings</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarFallback className="bg-card text-2xl font-display font-bold text-foreground">
                      {username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full hover:bg-primary/80 transition-colors">
                    <Camera className="h-4 w-4 text-primary-foreground" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{username}</h3>
                  <p className="text-sm text-muted-foreground">Upload a new avatar</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full h-24 px-3 py-2 bg-background border border-border rounded-md text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell other warriors about yourself..."
                  defaultValue="Climbing the ranks. There is only one #1."
                />
              </div>

              <div className="space-y-2">
                <Label>Social Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Website URL" className="bg-background" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="GitHub username" className="bg-background" />
                  </div>
                </div>
              </div>

              <Button variant="arena" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="m-0">
            <div className="arena-card p-6 space-y-6">
              <h2 className="font-display text-xl font-bold text-foreground">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'contests', label: 'Contest Announcements', desc: 'Get notified about upcoming contests' },
                  { key: 'streaks', label: 'Streak Reminders', desc: 'Remind me to maintain my streak' },
                  { key: 'xp', label: 'XP Earned', desc: 'Notify when I earn XP' },
                  { key: 'rank', label: 'Rank Changes', desc: 'Notify on division promotions or demotions' },
                  { key: 'duels', label: 'Duel Challenges', desc: 'Get notified when someone challenges me' },
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Button variant="arena" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="m-0">
            <div className="arena-card p-6 space-y-6">
              <h2 className="font-display text-xl font-bold text-foreground">Appearance</h2>
              
              {/* Theme */}
              <div className="space-y-4">
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Moon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Perfect for the arena</p>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Sun className="h-8 w-8 mx-auto mb-2 text-status-warning" />
                    <p className="font-medium text-foreground">Light Mode</p>
                    <p className="text-xs text-muted-foreground">For the brave</p>
                  </button>
                </div>
              </div>

              {/* Sounds */}
              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  {sounds ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium text-foreground">Sound Effects</p>
                    <p className="text-sm text-muted-foreground">Play sounds for achievements and notifications</p>
                  </div>
                </div>
                <Switch checked={sounds} onCheckedChange={setSounds} />
              </div>

              <Button variant="arena" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Editor Settings */}
          <TabsContent value="editor" className="m-0">
            <div className="arena-card p-6 space-y-6">
              <h2 className="font-display text-xl font-bold text-foreground">Editor Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    value={editorSettings.fontSize}
                    onChange={(e) => setEditorSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    min={10}
                    max={24}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tab Size</Label>
                  <Input
                    type="number"
                    value={editorSettings.tabSize}
                    onChange={(e) => setEditorSettings(prev => ({ ...prev, tabSize: parseInt(e.target.value) }))}
                    min={2}
                    max={8}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'autoComplete', label: 'Auto Complete', desc: 'Show code suggestions while typing' },
                  { key: 'lineNumbers', label: 'Line Numbers', desc: 'Show line numbers in the editor' },
                  { key: 'wordWrap', label: 'Word Wrap', desc: 'Wrap long lines to fit the editor width' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={editorSettings[item.key as keyof typeof editorSettings] as boolean}
                      onCheckedChange={(checked) => 
                        setEditorSettings(prev => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Button variant="arena" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="m-0">
            <div className="arena-card p-6 space-y-6">
              <h2 className="font-display text-xl font-bold text-foreground">Privacy & Security</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Public Profile</p>
                    <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Show on Leaderboard</p>
                    <p className="text-sm text-muted-foreground">Display your rank publicly</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Allow Duel Challenges</p>
                    <p className="text-sm text-muted-foreground">Let others challenge you to duels</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-foreground">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive border-destructive/50 hover:bg-destructive/10">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
