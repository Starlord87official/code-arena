import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Swords, User, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters');
const inviteCodeSchema = z.string().min(1, 'Invite code is required for Closed Beta');

interface AuthSignupFormProps {
  signUp: (email: string, password: string, username: string) => Promise<{ data: any; error: any }>;
  onSwitchTab: () => void;
}

export function AuthSignupForm({ signUp, onSwitchTab }: AuthSignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    const usernameResult = usernameSchema.safeParse(username);
    if (!usernameResult.success) newErrors.username = usernameResult.error.errors[0].message;
    const inviteCodeResult = inviteCodeSchema.safeParse(inviteCode.trim());
    if (!inviteCodeResult.success) newErrors.inviteCode = inviteCodeResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateInviteCode = async (): Promise<boolean> => {
    setIsValidatingCode(true);
    try {
      const { data, error } = await supabase.rpc('validate_invite_code', { p_code: inviteCode.trim() });
      if (error) { setErrors(prev => ({ ...prev, inviteCode: 'Failed to validate invite code' })); return false; }
      const result = data as { valid: boolean; message: string };
      if (!result.valid) { setErrors(prev => ({ ...prev, inviteCode: result.message })); return false; }
      return true;
    } catch {
      setErrors(prev => ({ ...prev, inviteCode: 'Failed to validate invite code' }));
      return false;
    } finally {
      setIsValidatingCode(false);
    }
  };

  const claimInviteCode = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('claim_invite_code', { p_code: inviteCode.trim(), p_user_id: userId });
      if (error) { console.error('Error claiming invite code:', error); return false; }
      const result = data as { success: boolean; message: string };
      return result.success;
    } catch (err) {
      console.error('Error claiming invite code:', err);
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const isValidCode = await validateInviteCode();
    if (!isValidCode) { setIsLoading(false); return; }

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

    if (data?.user?.id) {
      const claimed = await claimInviteCode(data.user.id);
      if (!claimed) console.warn('Invite code claim failed after user creation');
    }

    setIsLoading(false);
    toast.success('Account created! Welcome to CodeTrackX!');
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {/* Closed Beta Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-1">
        <p className="text-xs text-primary text-center font-medium tracking-wide">
          🔒 Closed Beta — Invite code required
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-invite-code" className="text-xs uppercase tracking-wider text-muted-foreground">
          Invite Code
        </Label>
        <div className="relative">
          <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-invite-code"
            type="text"
            placeholder="Enter your invite code"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value.toUpperCase());
              if (errors.inviteCode) setErrors(prev => ({ ...prev, inviteCode: '' }));
            }}
            className="pl-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:border-primary/60 focus:ring-primary/30 uppercase tracking-wider transition-all"
          />
        </div>
        {errors.inviteCode && <p className="text-xs text-destructive">{errors.inviteCode}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-username" className="text-xs uppercase tracking-wider text-muted-foreground">
          Username
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-username"
            type="text"
            placeholder="CodeNinja"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:border-primary/60 focus:ring-primary/30 transition-all"
          />
        </div>
        {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-email" className="text-xs uppercase tracking-wider text-muted-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:border-primary/60 focus:ring-primary/30 transition-all"
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="signup-password" className="text-xs uppercase tracking-wider text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:border-primary/60 focus:ring-primary/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-confirm-password" className="text-xs uppercase tracking-wider text-muted-foreground">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:border-primary/60 focus:ring-primary/30 transition-all"
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || isValidatingCode}
        className="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-wider bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:-translate-y-0.5 transition-all duration-300"
      >
        {isLoading || isValidatingCode ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Swords className="h-4 w-4 mr-2" />
        )}
        {isValidatingCode ? 'Validating code...' : isLoading ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchTab} className="text-primary hover:text-primary/80 font-medium transition-colors">
          Log in
        </button>
      </p>
    </form>
  );
}
