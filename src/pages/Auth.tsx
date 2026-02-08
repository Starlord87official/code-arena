import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useAuth';
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';
import { AuthSignupForm } from '@/components/auth/AuthSignupForm';
import { Code2 } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading: authLoading, signIn, signUp } = useSupabaseAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      if (!profile.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, profile, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero with background image */}
      <AuthLeftPanel activeStep={tab === 'signup' ? 'create' : 'create'} />

      {/* Right Panel - Form */}
      <div className="flex-1 lg:w-[55%] flex flex-col justify-center items-center px-6 py-10 md:px-12 lg:px-16 xl:px-24 relative overflow-y-auto">
        {/* Subtle gradient background for right panel */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--arena-dark)) 50%, hsl(var(--background)) 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="relative">
              <Code2 className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-lg" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              CodeTrackX <span className="text-xs text-muted-foreground">(Private Beta)</span>
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-muted/30 border border-border/30 p-1 mb-8">
            <button
              onClick={() => setTab('login')}
              className={`
                flex-1 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300
                ${tab === 'login'
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Login
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`
                flex-1 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300
                ${tab === 'signup'
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Sign Up
            </button>
          </div>

          {/* Social Login - Google only (GitHub not supported on Lovable Cloud) */}
          <div className="mb-6">
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-border/40 bg-muted/20 text-muted-foreground text-sm font-medium hover:bg-muted/30 transition-all cursor-not-allowed opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google (Coming Soon)
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">or</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Forms */}
          {tab === 'login' ? (
            <AuthLoginForm signIn={signIn} onSwitchTab={() => setTab('signup')} />
          ) : (
            <AuthSignupForm signUp={signUp} onSwitchTab={() => setTab('login')} />
          )}

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8 opacity-60">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
