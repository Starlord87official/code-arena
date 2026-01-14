import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FriendRequest {
  id: string;
  sender_id?: string;
  receiver_id?: string;
  username: string;
  avatar_url: string | null;
  division: string | null;
  created_at: string;
}

export interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  division: string | null;
  xp: number;
  streak: number;
  last_active: string | null;
}

// Helper function to determine if a user is online (active within last 5 minutes)
export function isUserOnline(lastActive: string | null): boolean {
  if (!lastActive) return false;
  const lastActiveDate = new Date(lastActive);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return lastActiveDate > fiveMinutesAgo;
}

// Helper function to format last seen time
export function formatLastSeen(lastActive: string | null): string {
  if (!lastActive) return 'Offline';
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const diffMs = now.getTime() - lastActiveDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 5) return 'Online';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return 'Long time ago';
}

export function useFriendRequests() {
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
      fetchFriends();
    } else {
      setIncoming([]);
      setOutgoing([]);
      setFriends([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchFriendRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_friend_requests');

      if (error) throw error;

      const result = data as unknown as { success: boolean; incoming?: FriendRequest[]; outgoing?: FriendRequest[] };
      
      if (result.success) {
        setIncoming(result.incoming || []);
        setOutgoing(result.outgoing || []);
      }
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase.rpc('get_friends');

      if (error) throw error;

      const result = data as unknown as { success: boolean; friends?: Friend[] };
      
      if (result.success) {
        setFriends(result.friends || []);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { data, error } = await supabase.rpc('respond_friend_request', {
        p_request_id: requestId,
        p_accept: accept
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        // Refresh the lists
        await fetchFriendRequests();
        if (accept) {
          await fetchFriends();
        }
      }
      
      return result;
    } catch (err) {
      console.error('Error responding to request:', err);
      return { success: false, error: 'Failed to respond to request' };
    }
  };

  return {
    incoming,
    outgoing,
    friends,
    isLoading,
    incomingCount: incoming.length,
    respondToRequest,
    refetch: () => {
      fetchFriendRequests();
      fetchFriends();
    }
  };
}
