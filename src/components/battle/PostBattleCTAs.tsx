import { Link } from 'react-router-dom';
import { 
  Shield, 
  Sword, 
  Target, 
  GraduationCap, 
  Trophy,
  Flame,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostBattleCTAsProps {
  isWinner: boolean;
  isDraw: boolean;
  clanId: string;
  className?: string;
}

export function PostBattleCTAs({ isWinner, isDraw, clanId, className = '' }: PostBattleCTAsProps) {
  if (isWinner) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Primary CTA for winners */}
        <Link to={`/clan/${clanId}`} className="block">
          <Button 
            variant="arena" 
            size="lg" 
            className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
          >
            <Shield className="w-5 h-5" />
            Defend Your Rank
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>

        {/* Secondary CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/battles">
            <Button variant="arenaOutline" className="w-full gap-2">
              <Sword className="w-4 h-4" />
              Next Battle
            </Button>
          </Link>
          <Link to="/challenges">
            <Button variant="arenaOutline" className="w-full gap-2">
              <Target className="w-4 h-4" />
              Keep Training
            </Button>
          </Link>
        </div>

        {/* Motivational message */}
        <div className="text-center p-3 rounded-lg bg-status-success/10 border border-status-success/30">
          <div className="flex items-center justify-center gap-2 text-status-success">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Victory secured! Keep the momentum going.</span>
          </div>
        </div>
      </div>
    );
  }

  if (isDraw) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Primary CTA for draw */}
        <Link to={`/clan/${clanId}`} className="block">
          <Button 
            variant="arena" 
            size="lg" 
            className="w-full gap-2"
          >
            <Sword className="w-5 h-5" />
            Settle the Score
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>

        {/* Secondary CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/challenges">
            <Button variant="arenaOutline" className="w-full gap-2">
              <Target className="w-4 h-4" />
              Practice More
            </Button>
          </Link>
          <Link to="/mentors">
            <Button variant="arenaOutline" className="w-full gap-2">
              <GraduationCap className="w-4 h-4" />
              Get Tips
            </Button>
          </Link>
        </div>

        {/* Motivational message */}
        <div className="text-center p-3 rounded-lg bg-status-warning/10 border border-status-warning/30">
          <div className="flex items-center justify-center gap-2 text-status-warning">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">A worthy opponent! The next battle will decide it.</span>
          </div>
        </div>
      </div>
    );
  }

  // Loser CTAs
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Primary CTA for losers */}
      <Link to={`/clan/${clanId}`} className="block">
        <Button 
          variant="arena" 
          size="lg" 
          className="w-full gap-2 bg-gradient-to-r from-destructive to-orange-600"
        >
          <Flame className="w-5 h-5" />
          Reclaim Honor
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>

      {/* Secondary CTAs */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/mentors">
          <Button variant="arenaOutline" className="w-full gap-2">
            <GraduationCap className="w-4 h-4" />
            Train with Mentor
          </Button>
        </Link>
        <Link to="/challenges">
          <Button variant="arenaOutline" className="w-full gap-2">
            <Target className="w-4 h-4" />
            Solo Practice
          </Button>
        </Link>
      </div>

      {/* Motivational message */}
      <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/30">
        <div className="flex items-center justify-center gap-2 text-destructive">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Every defeat is a lesson. Rise stronger!</span>
        </div>
      </div>
    </div>
  );
}
