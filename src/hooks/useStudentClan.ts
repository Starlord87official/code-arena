import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentClanMembership {
  id: string;
  clan_id: string;
  user_id: string;
  username: string;
  avatar: string | null;
  xp: number;
  streak: number;
  joined_at: string;
  last_active: string;
}

// Fetch student's clan membership
export function useStudentClan(userId: string | undefined) {
  return useQuery({
    queryKey: ['student-clan', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('clan_members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as StudentClanMembership | null;
    },
    enabled: !!userId,
  });
}

// Join a clan as a student
export function useJoinClan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      clanId,
      username,
    }: {
      userId: string;
      clanId: string;
      username: string;
    }) => {
      // First, add as clan member (backend trigger enforces one-clan-per-student)
      const { data: member, error: memberError } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clanId,
          user_id: userId,
          username,
          xp: 0,
          streak: 0,
        })
        .select()
        .single();

      if (memberError) {
        // Check for the one-clan-per-student constraint
        if (memberError.message?.includes('Students can only join one clan')) {
          throw new Error('You can only be a member of one clan at a time');
        }
        throw memberError;
      }

      // Then, assign student role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          clan_id: clanId,
          role: 'student',
        }, {
          onConflict: 'user_id,clan_id',
        });

      if (roleError) throw roleError;

      return member;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-clan', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-role', variables.userId, variables.clanId] });
      toast.success('Successfully joined the clan!');
    },
    onError: (error) => {
      console.error('Failed to join clan:', error);
      toast.error('Failed to join clan');
    },
  });
}

// Leave a clan
export function useLeaveClan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      userId,
      clanId,
    }: {
      memberId: string;
      userId: string;
      clanId: string;
    }) => {
      // Remove clan membership (role will be handled separately if needed)
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-clan', variables.userId] });
      toast.success('Left the clan');
    },
    onError: (error) => {
      console.error('Failed to leave clan:', error);
      toast.error('Failed to leave clan');
    },
  });
}
