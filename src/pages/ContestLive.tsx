import { useParams, Link } from 'react-router-dom';
import { Trophy, Clock, Swords, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ContestLive() {
  const { id } = useParams();

  // In private beta, no live contests
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Swords className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Live Contest</h1>
          </div>
        </div>

        {/* Empty State */}
        <div className="arena-card p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-status-warning/20 via-primary/20 to-status-warning/20 blur-3xl rounded-full" />
              <div className="relative inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-status-warning/10 to-primary/10 border border-status-warning/20">
                <Trophy className="h-12 w-12 text-status-warning" />
              </div>
            </div>
            
            <Badge className="mb-4 bg-muted text-muted-foreground border-border">
              NO ACTIVE CONTEST
            </Badge>
            
            <h2 className="font-display text-2xl font-bold mb-3">
              No Contest Running
            </h2>
            
            <p className="text-muted-foreground mb-6">
              There's no live contest at the moment. Check back soon or follow your roadmap while you wait.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contests">
                <Button variant="arena">
                  <Trophy className="h-4 w-4 mr-2" />
                  View All Contests
                </Button>
              </Link>
              <Link to="/roadmap">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue Roadmap
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
