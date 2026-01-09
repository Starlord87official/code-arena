import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// This page redirects to the user's public profile
export default function Profile() {
  const navigate = useNavigate();
  const { profile, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && profile?.username) {
        // Redirect to public profile
        navigate(`/profile/${profile.username}`, { replace: true });
      } else if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/auth', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, profile, navigate]);

  // Show loading while determining redirect
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  );
}
