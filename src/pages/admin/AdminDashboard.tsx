import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Zap, Swords, Trophy, Code2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="arena-card p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}/10`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
        <Badge variant="outline" className="text-[10px]">LIVE</Badge>
      </div>
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [usersRes, activityRes, completionsRes, battlesRes, contestsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_activity').select('id', { count: 'exact', head: true }).eq('activity_date', today),
        supabase.from('challenge_completions').select('id', { count: 'exact', head: true }).gte('completed_at', `${today}T00:00:00`),
        supabase.from('battle_sessions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('contests').select('id', { count: 'exact', head: true }).eq('status', 'live'),
      ]);

      return {
        totalUsers: usersRes.count ?? 0,
        activeToday: activityRes.count ?? 0,
        solvedToday: completionsRes.count ?? 0,
        activeBattles: battlesRes.count ?? 0,
        activeContests: contestsRes.count ?? 0,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Admin <span className="text-primary neon-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">System overview and management</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="primary" />
            <StatCard title="Active Today" value={stats?.activeToday ?? 0} icon={Zap} color="accent" />
            <StatCard title="Solved Today" value={stats?.solvedToday ?? 0} icon={Code2} color="primary" />
            <StatCard title="Active Battles" value={stats?.activeBattles ?? 0} icon={Swords} color="destructive" />
            <StatCard title="Active Contests" value={stats?.activeContests ?? 0} icon={Trophy} color="primary" />
          </div>
        )}

        <div className="mt-8 arena-card p-8 text-center border border-border/50">
          <p className="text-muted-foreground">Activity charts and trends will populate as data grows.</p>
        </div>
      </div>
    </div>
  );
}
