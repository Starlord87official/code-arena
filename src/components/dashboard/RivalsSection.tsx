import { User, getDivisionColor } from '@/lib/mockData';
import { ArrowUp, ArrowDown, Swords, Users, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RivalsSectionProps {
  currentUser: User;
  rivals: User[];
}

export function RivalsSection({ currentUser, rivals }: RivalsSectionProps) {
  // In private beta, we don't have real rival data
  const hasRivals = false; // Will be true when we have real user data

  if (!hasRivals) {
    return (
      <div className="arena-card rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-status-warning" />
              <h3 className="font-display font-bold">RIVALS NEARBY</h3>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
              PRIVATE BETA
            </Badge>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-8 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-status-warning/20 via-primary/20 to-status-warning/20 blur-2xl rounded-full" />
            <div className="relative inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-status-warning/10 to-primary/10 border border-status-warning/20">
              <Sparkles className="h-8 w-8 text-status-warning" />
            </div>
          </div>

          <h4 className="font-display font-bold text-lg mb-2">
            You're a Pioneer
          </h4>
          
          <p className="text-muted-foreground text-sm mb-4 max-w-xs mx-auto">
            As more warriors join the arena, rivals will appear here based on your XP and division.
          </p>

          {/* Current User Position Preview */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-sm">
                {currentUser.username[0]}
              </div>
              <div className="text-left">
                <p className="font-heading font-semibold text-sm">{currentUser.username}</p>
                <p className="text-xs text-primary">{currentUser.xp.toLocaleString()} XP</p>
              </div>
            </div>
          </div>

          <Link to="/challenges">
            <Button variant="outline" size="sm" className="gap-2">
              <Target className="h-4 w-4" />
              Solve Challenges to Climb
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // This code will be used once we have real rival data
  // For now, return the empty state above
  return null;
}
