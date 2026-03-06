import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminChampionship() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">Championship <span className="text-primary neon-text">Management</span></h1>
        <div className="arena-card p-12 text-center border border-border/50">
          <Crown className="h-16 w-16 text-rank-gold mx-auto mb-4 opacity-50" />
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">COMING SOON</Badge>
          <h2 className="font-display text-xl font-bold mb-2">Championship Controls</h2>
          <p className="text-muted-foreground">Season management, champion declarations, and ranking resets will be available here once championships are active.</p>
        </div>
      </div>
    </div>
  );
}
