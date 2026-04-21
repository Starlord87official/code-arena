import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminBattles() {
  const [tab, setTab] = useState('matches');
  const queryClient = useQueryClient();

  const { data: battles, isLoading } = useQuery({
    queryKey: ['admin-battles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('battle_matches').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: flags, isLoading: flagsLoading } = useQuery({
    queryKey: ['admin-anticheat-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anticheat_flags')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: similarity, isLoading: simLoading } = useQuery({
    queryKey: ['admin-similarity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submission_similarity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const statusColor = (s: string) =>
    s === 'active' ? 'bg-green-500/20 text-green-400'
      : s === 'completed' ? 'bg-primary/20 text-primary'
      : 'bg-muted text-muted-foreground';

  const sevColor = (n: number) =>
    n >= 4 ? 'bg-destructive/20 text-destructive'
      : n >= 3 ? 'bg-orange-500/20 text-orange-400'
      : n >= 2 ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-muted text-muted-foreground';

  const handleAction = async (flagId: string, action: 'dismiss' | 'warn' | 'invalidate_match' | 'forfeit_user') => {
    const { error } = await (supabase.rpc as any)('apply_integrity_review', {
      p_flag_id: flagId,
      p_action: action,
    });
    if (error) {
      toast.error(error.message || 'Action failed');
      return;
    }
    toast.success(`Flag ${action.replace('_', ' ')}d`);
    queryClient.invalidateQueries({ queryKey: ['admin-anticheat-flags'] });
    queryClient.invalidateQueries({ queryKey: ['admin-battles'] });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">
          Battle <span className="text-primary neon-text">Management</span>
        </h1>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="integrity">Integrity Flags</TabsTrigger>
            <TabsTrigger value="similarity">Code Similarity</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-6">
            <div className="arena-card border border-border/50 overflow-hidden">
              {isLoading ? (
                <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : !battles?.length ? (
                <div className="p-8 text-center text-muted-foreground">No battles recorded yet.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Match ID</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Duration</TableHead><TableHead>Problems</TableHead><TableHead>Invalidated</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {battles.map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs">{b.id.slice(0, 8)}…</TableCell>
                        <TableCell className="capitalize">{b.mode}</TableCell>
                        <TableCell><Badge className={`${statusColor(b.status)} text-xs capitalize`}>{b.status}</Badge></TableCell>
                        <TableCell>{b.duration_minutes}m</TableCell>
                        <TableCell>{b.problem_count}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{b.invalidated_reason || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="integrity" className="mt-6">
            <div className="arena-card border border-border/50 overflow-hidden">
              {flagsLoading ? (
                <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : !flags?.length ? (
                <div className="p-8 text-center text-muted-foreground">No integrity flags raised.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Kind</TableHead><TableHead>Severity</TableHead><TableHead>User</TableHead><TableHead>Match</TableHead><TableHead>Status</TableHead><TableHead>Evidence</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {flags.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-xs">{f.kind}</TableCell>
                        <TableCell><Badge className={`${sevColor(f.severity)} text-xs`}>S{f.severity}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{f.user_id?.slice(0, 8)}…</TableCell>
                        <TableCell className="font-mono text-xs">{f.match_id ? `${f.match_id.slice(0, 8)}…` : '—'}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs capitalize">{f.status?.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="font-mono text-[10px] max-w-[220px] truncate text-muted-foreground">{JSON.stringify(f.evidence)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {f.status === 'pending_review' ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleAction(f.id, 'dismiss')}>Dismiss</Button>
                              <Button size="sm" variant="outline" onClick={() => handleAction(f.id, 'warn')}>Warn</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction(f.id, 'invalidate_match')}>Invalidate</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction(f.id, 'forfeit_user')}>Forfeit</Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="similarity" className="mt-6">
            <div className="arena-card border border-border/50 overflow-hidden">
              {simLoading ? (
                <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : !similarity?.length ? (
                <div className="p-8 text-center text-muted-foreground">No suspicious code-similarity pairs detected.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Match</TableHead><TableHead>Similarity</TableHead><TableHead>Algorithm</TableHead><TableHead>Submission A</TableHead><TableHead>Submission B</TableHead><TableHead>Detected</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {similarity.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.match_id?.slice(0, 8)}…</TableCell>
                        <TableCell><Badge className="bg-orange-500/20 text-orange-400 text-xs">{(Number(s.similarity) * 100).toFixed(1)}%</Badge></TableCell>
                        <TableCell className="text-xs">{s.algorithm}</TableCell>
                        <TableCell className="font-mono text-xs">{s.submission_a?.slice(0, 8)}…</TableCell>
                        <TableCell className="font-mono text-xs">{s.submission_b?.slice(0, 8)}…</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
