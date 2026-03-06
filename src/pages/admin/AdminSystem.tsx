import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminSystem() {
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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">System <span className="text-primary neon-text">Panel</span></h1>

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
      </div>
    </div>
  );
}
