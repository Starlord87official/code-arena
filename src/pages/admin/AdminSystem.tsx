import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, Server, Trophy, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export default function AdminSystem() {
  const qc = useQueryClient();
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [seasonName, setSeasonName] = useState('');
  const [seasonStart, setSeasonStart] = useState('');
  const [seasonEnd, setSeasonEnd] = useState('');
  const [resetting, setResetting] = useState(false);

  const { data: health } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const start = Date.now();
      const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const latency = Date.now() - start;
      return { connected: !error, latency, serverTime: new Date().toISOString() };
    },
    refetchInterval: 30000,
  });

  const { data: currentSeason } = useQuery({
    queryKey: ['admin-current-season'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seasons')
        .select('id, name, starts_at, ends_at, status')
        .eq('status', 'active')
        .order('starts_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: 60000,
  });

  const handleStartNewSeason = async () => {
    if (!seasonName || !seasonStart || !seasonEnd) {
      toast({ title: 'Missing fields', description: 'Name, start, and end are required.', variant: 'destructive' });
      return;
    }
    setResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('rank-season-reset', {
        body: {
          new_season_name: seasonName,
          new_season_starts_at: new Date(seasonStart).toISOString(),
          new_season_ends_at: new Date(seasonEnd).toISOString(),
        },
      });
      if (error) throw error;
      toast({
        title: 'New season started',
        description: `Archived ${data?.users_archived ?? 0} players. New season is live.`,
      });
      setSeasonDialogOpen(false);
      setSeasonName(''); setSeasonStart(''); setSeasonEnd('');
      qc.invalidateQueries({ queryKey: ['admin-current-season'] });
    } catch (e: any) {
      toast({ title: 'Season reset failed', description: e?.message ?? 'Unknown error', variant: 'destructive' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold">System <span className="text-primary neon-text">Panel</span></h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="arena-card p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <Server className="h-5 w-5 text-primary" />
              <span className="font-heading text-sm">Backend Status</span>
            </div>
            {health?.connected ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-semibold">Connected</span>
                <Badge variant="outline" className="ml-auto text-xs">{health.latency}ms</Badge>
              </div>
            ) : (
              <span className="text-destructive">Disconnected</span>
            )}
          </div>

          <div className="arena-card p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-heading text-sm">Server Time</span>
            </div>
            <p className="text-sm font-mono text-foreground">{health?.serverTime ? new Date(health.serverTime).toLocaleString() : '—'}</p>
          </div>

          <div className="arena-card p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-heading text-sm">System Health</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400">All Systems Operational</Badge>
          </div>
        </div>

        {/* Season Management */}
        <div className="arena-card p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-lg">Season Management</h2>
            </div>
            <Button onClick={() => setSeasonDialogOpen(true)} variant="default">
              Start New Season
            </Button>
          </div>

          {currentSeason ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active season</span>
                <span className="font-semibold">{currentSeason.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-mono">{new Date(currentSeason.starts_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ends</span>
                <span className="font-mono">{new Date(currentSeason.ends_at).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active season.</p>
          )}
        </div>
      </div>

      <Dialog open={seasonDialogOpen} onOpenChange={setSeasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Season</DialogTitle>
            <DialogDescription>
              This archives every player's current rank into season history and soft-resets MMR.
              The current season will be marked completed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="season-name">Season name</Label>
              <Input id="season-name" value={seasonName} onChange={(e) => setSeasonName(e.target.value)} placeholder="Season 2 — Spring 2026" />
            </div>
            <div>
              <Label htmlFor="season-start">Starts at</Label>
              <Input id="season-start" type="datetime-local" value={seasonStart} onChange={(e) => setSeasonStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="season-end">Ends at</Label>
              <Input id="season-end" type="datetime-local" value={seasonEnd} onChange={(e) => setSeasonEnd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeasonDialogOpen(false)} disabled={resetting}>Cancel</Button>
            <Button onClick={handleStartNewSeason} disabled={resetting}>
              {resetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
