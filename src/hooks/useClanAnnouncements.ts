import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClanAnnouncement {
  id: string;
  clan_id: string;
  mentor_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch announcements for a clan
export function useClanAnnouncements(clanId: string) {
  return useQuery({
    queryKey: ['clan-announcements', clanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clan_announcements')
        .select('*')
        .eq('clan_id', clanId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClanAnnouncement[];
    },
    enabled: !!clanId,
  });
}

// Create announcement
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clanId,
      mentorId,
      title,
      content,
      isPinned = false,
    }: {
      clanId: string;
      mentorId: string;
      title: string;
      content: string;
      isPinned?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('clan_announcements')
        .insert({
          clan_id: clanId,
          mentor_id: mentorId,
          title,
          content,
          is_pinned: isPinned,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clan-announcements', variables.clanId] });
      toast.success('Announcement posted successfully');
    },
    onError: (error) => {
      console.error('Failed to create announcement:', error);
      toast.error('Failed to post announcement');
    },
  });
}

// Update announcement
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      clanId,
      title,
      content,
      isPinned,
    }: {
      id: string;
      clanId: string;
      title?: string;
      content?: string;
      isPinned?: boolean;
    }) => {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (isPinned !== undefined) updateData.is_pinned = isPinned;

      const { data, error } = await supabase
        .from('clan_announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clan-announcements', variables.clanId] });
      toast.success('Announcement updated');
    },
    onError: (error) => {
      console.error('Failed to update announcement:', error);
      toast.error('Failed to update announcement');
    },
  });
}

// Delete announcement
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clanId }: { id: string; clanId: string }) => {
      const { error } = await supabase
        .from('clan_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clan-announcements', variables.clanId] });
      toast.success('Announcement deleted');
    },
    onError: (error) => {
      console.error('Failed to delete announcement:', error);
      toast.error('Failed to delete announcement');
    },
  });
}

// Toggle pin status
export function useToggleAnnouncementPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clanId, isPinned }: { id: string; clanId: string; isPinned: boolean }) => {
      const { data, error } = await supabase
        .from('clan_announcements')
        .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clan-announcements', variables.clanId] });
      toast.success(variables.isPinned ? 'Announcement pinned' : 'Announcement unpinned');
    },
    onError: (error) => {
      console.error('Failed to toggle pin:', error);
      toast.error('Failed to update announcement');
    },
  });
}
