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
