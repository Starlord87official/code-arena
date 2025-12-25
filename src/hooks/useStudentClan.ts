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

export interface CooldownInfo {
  isInCooldown: boolean;
  cooldownEndsAt: Date | null;
  remainingDays: number;
  remainingHours: number;
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

// Check cooldown status for a user
export function useClanCooldown(userId: string | undefined) {
  return useQuery({
    queryKey: ['clan-cooldown', userId],
    queryFn: async (): Promise<CooldownInfo> => {
      if (!userId) {
        return { isInCooldown: false, cooldownEndsAt: null, remainingDays: 0, remainingHours: 0 };
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('left_clan_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (!data?.left_clan_at) {
        return { isInCooldown: false, cooldownEndsAt: null, remainingDays: 0, remainingHours: 0 };
      }
      
      const leftAt = new Date(data.left_clan_at);
      const cooldownEndsAt = new Date(leftAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const now = new Date();
      
      if (cooldownEndsAt <= now) {
        return { isInCooldown: false, cooldownEndsAt: null, remainingDays: 0, remainingHours: 0 };
      }
      
      const remainingMs = cooldownEndsAt.getTime() - now.getTime();
      const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
      const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      
      return {
        isInCooldown: true,
        cooldownEndsAt,
        remainingDays,
        remainingHours,
      };
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
      // First, add as clan member (backend trigger enforces one-clan-per-student and cooldown)
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
        // Check for cooldown constraint
        if (memberError.message?.includes('You must wait until')) {
          throw new Error(memberError.message);
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
      queryClient.invalidateQueries({ queryKey: ['clan-cooldown', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-role', variables.userId, variables.clanId] });
      toast.success('Successfully joined the clan!');
    },
    onError: (error) => {
      console.error('Failed to join clan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to join clan');
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
      // Remove clan membership (trigger will update left_clan_at)
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-clan', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['clan-cooldown', variables.userId] });
      toast.success('You have left the clan. You can join a new clan in 7 days.');
    },
    onError: (error) => {
      console.error('Failed to leave clan:', error);
      toast.error('Failed to leave clan');
    },
  });
}
