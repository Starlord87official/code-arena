import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminBattles() {
  const { data: battles, isLoading } = useQuery({
    queryKey: ['admin-battles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('battle_matches').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const statusColor = (s: string) => s === 'active' ? 'bg-green-500/20 text-green-400' : s === 'completed' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">Battle <span className="text-primary neon-text">Management</span></h1>
        <div className="arena-card border border-border/50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !battles?.length ? (
            <div className="p-8 text-center text-muted-foreground">No battles recorded yet.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Match ID</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Duration</TableHead><TableHead>Problems</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
              <TableBody>
                {battles.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id.slice(0, 8)}...</TableCell>
                    <TableCell className="capitalize">{b.mode}</TableCell>
                    <TableCell><Badge className={`${statusColor(b.status)} text-xs capitalize`}>{b.status}</Badge></TableCell>
                    <TableCell>{b.duration_minutes}m</TableCell>
                    <TableCell>{b.problem_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</TableCell>
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
