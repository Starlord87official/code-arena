import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PublicProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  division: string | null;
  xp: number;
  streak: number;
  college_name: string | null;
  college_year: string | null;
  occupation_type: string | null;
  years_of_experience: number | null;
  joined_at: string;
  battles_played: number;
  battles_won: number;
}

export interface FriendshipStatus {
  status: 'none' | 'friends' | 'pending_sent' | 'pending_received' | 'self' | 'not_logged_in';
  request_id?: string;
}

export function usePublicProfile(username: string | undefined) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>({ status: 'none' });
  const { user } = useAuth();

  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      setError('No username provided');
      return;
    }

    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile?.id && user) {
      fetchFriendshipStatus(profile.id);
    }
  }, [profile?.id, user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_public_profile', {
        p_username: username
      });

      if (rpcError) throw rpcError;

      const result = data as unknown as { success: boolean; error?: string; profile?: PublicProfile };
      
      if (!result.success) {
        setError(result.error || 'Failed to load profile');
        setProfile(null);
      } else {
        setProfile(result.profile || null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriendshipStatus = async (profileId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_friendship_status', {
        p_other_user_id: profileId
      });

      if (error) throw error;

      const result = data as unknown as FriendshipStatus;
      setFriendshipStatus(result);
    } catch (err) {
      console.error('Error fetching friendship status:', err);
    }
  };

  const sendFriendRequest = async () => {
    if (!profile?.id) return { success: false, error: 'No profile loaded' };

    try {
      const { data, error } = await supabase.rpc('send_friend_request', {
        p_receiver_id: profile.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result.success) {
        setFriendshipStatus({ status: 'pending_sent' });
      }
      
      return result;
    } catch (err) {
      console.error('Error sending friend request:', err);
      return { success: false, error: 'Failed to send friend request' };
    }
  };

  const respondToRequest = async (accept: boolean) => {
    if (!friendshipStatus.request_id) return { success: false, error: 'No pending request' };

    try {
      const { data, error } = await supabase.rpc('respond_friend_request', {
        p_request_id: friendshipStatus.request_id,
        p_accept: accept
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result.success) {
        setFriendshipStatus({ status: accept ? 'friends' : 'none' });
      }
      
      return result;
    } catch (err) {
      console.error('Error responding to friend request:', err);
      return { success: false, error: 'Failed to respond to request' };
    }
  };

  return {
    profile,
    isLoading,
    error,
    friendshipStatus,
    sendFriendRequest,
    respondToRequest,
    refetch: fetchProfile
  };
}
