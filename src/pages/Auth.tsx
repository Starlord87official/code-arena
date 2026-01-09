import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { 
  Code2, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Loader2,
  ArrowRight,
  Swords,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters');
const inviteCodeSchema = z.string().min(1, 'Invite code is required for Closed Beta');

export default function Auth() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading: authLoading, signIn, signUp } = useSupabaseAuth();
  
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect based on onboarding status after auth
  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      if (!profile.onboarding_completed) {
        // New user or incomplete onboarding - go to onboarding
        navigate('/onboarding', { replace: true });
      } else {
        // Returning user - go to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, profile, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (tab === 'signup') {
      const usernameResult = usernameSchema.safeParse(username);
      if (!usernameResult.success) {
        newErrors.username = usernameResult.error.errors[0].message;
      }
      
      const inviteCodeResult = inviteCodeSchema.safeParse(inviteCode.trim());
      if (!inviteCodeResult.success) {
        newErrors.inviteCode = inviteCodeResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateInviteCode = async (): Promise<boolean> => {
    setIsValidatingCode(true);
    try {
      const { data, error } = await supabase.rpc('validate_invite_code', {
        p_code: inviteCode.trim()
      });

      if (error) {
        setErrors(prev => ({ ...prev, inviteCode: 'Failed to validate invite code' }));
        return false;
      }

      const result = data as { valid: boolean; message: string };
      if (!result.valid) {
        setErrors(prev => ({ ...prev, inviteCode: result.message }));
        return false;
      }

      return true;
    } catch (err) {
      setErrors(prev => ({ ...prev, inviteCode: 'Failed to validate invite code' }));
      return false;
    } finally {
      setIsValidatingCode(false);
    }
  };

  const claimInviteCode = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('claim_invite_code', {
        p_code: inviteCode.trim(),
        p_user_id: userId
      });

      if (error) {
        console.error('Error claiming invite code:', error);
        return false;
      }

      const result = data as { success: boolean; message: string };
      return result.success;
    } catch (err) {
      console.error('Error claiming invite code:', err);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email before logging in');
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success('Welcome back!');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Step 1: Validate invite code before signup
    const isValidCode = await validateInviteCode();
    if (!isValidCode) {
      setIsLoading(false);
      return;
    }

    // Step 2: Create the account
    const { data, error } = await signUp(email, password, username);

    if (error) {
      setIsLoading(false);
      if (error.message.includes('already registered')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Step 3: Claim the invite code
    if (data?.user?.id) {
      const claimed = await claimInviteCode(data.user.id);
      if (!claimed) {
        // The user was created but code claim failed - this is an edge case
        // The code should still work since we validated first
        console.warn('Invite code claim failed after user creation');
      }
    }

    setIsLoading(false);
    toast.success('Account created! Welcome to CodeLock!');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative">
            <Code2 className="h-10 w-10 text-primary transition-all group-hover:scale-110" />
            <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-2xl font-bold text-gradient-electric">
            CodeLock
          </span>
        </Link>

        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-arena">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-2xl">
              {tab === 'login' ? 'Welcome Back' : 'Join the Arena'}
            </CardTitle>
            <CardDescription>
              {tab === 'login' 
                ? 'Enter your credentials to continue' 
                : 'Create an account to start your journey'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Closed Beta Banner */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-2">
                    <p className="text-sm text-primary text-center font-medium">
                      🔒 Closed Beta — Invite code required
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-invite-code">Invite Code</Label>
                    <div className="relative">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-invite-code"
                        type="text"
                        placeholder="Enter your invite code"
                        value={inviteCode}
                        onChange={(e) => {
                          setInviteCode(e.target.value.toUpperCase());
                          if (errors.inviteCode) {
                            setErrors(prev => ({ ...prev, inviteCode: '' }));
                          }
                        }}
                        className="pl-10 uppercase tracking-wider"
                      />
                    </div>
                    {errors.inviteCode && (
                      <p className="text-sm text-destructive">{errors.inviteCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="CodeNinja"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-sm text-destructive">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || isValidatingCode}>
                    {isLoading || isValidatingCode ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Swords className="h-4 w-4 mr-2" />
                    )}
                    {isValidatingCode ? 'Validating code...' : isLoading ? 'Creating account...' : 'Enter the Arena'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
