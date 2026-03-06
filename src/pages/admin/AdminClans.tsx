import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function AdminClans() {
  const queryClient = useQueryClient();

  const { data: clans, isLoading } = useQuery({
    queryKey: ['admin-clans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clans').select('*').order('total_xp', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const resetXP = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clans').update({ weekly_xp: 0 }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-clans'] }); toast({ title: 'Weekly XP reset' }); },
  });

  const deleteClan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-clans'] }); toast({ title: 'Clan deleted' }); },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">Clan <span className="text-primary neon-text">Management</span></h1>
        <div className="arena-card border border-border/50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !clans?.length ? (
            <div className="p-8 text-center text-muted-foreground">No clans yet.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Tag</TableHead><TableHead>Level</TableHead><TableHead>Weekly XP</TableHead><TableHead>Total XP</TableHead><TableHead>Privacy</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {clans.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant="outline">{c.tag}</Badge></TableCell>
                    <TableCell>{c.level}</TableCell>
                    <TableCell>{c.weekly_xp}</TableCell>
                    <TableCell>{c.total_xp}</TableCell>
                    <TableCell className="capitalize">{c.privacy}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resetXP.mutate(c.id)}><RotateCcw className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteClan.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
