import { Link } from 'react-router-dom';
import { Challenge, getDifficultyColor } from '@/lib/mockData';
import { Check, ChevronRight, Users, Zap } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  solved?: boolean;
}

export function ChallengeCard({ challenge, solved = false }: ChallengeCardProps) {
  return (
    <Link to={`/challenge/${challenge.id}`}>
      <div className={`arena-card p-5 rounded-xl group cursor-pointer ${solved ? 'border-status-success/30' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-heading uppercase font-semibold px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)} bg-current/10`}>
                {challenge.difficulty}
              </span>
              {solved && (
                <span className="flex items-center gap-1 text-xs text-status-success">
                  <Check className="h-3 w-3" />
                  Solved
                </span>
              )}
            </div>
            <h3 className="font-heading font-bold text-lg mb-2 group-hover:text-primary transition-colors">
              {challenge.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {challenge.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {challenge.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">+{challenge.xpReward}</span> XP
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {challenge.solvedBy.toLocaleString()} solved
          </div>
          <div className="text-sm text-muted-foreground ml-auto">
            {challenge.successRate}% success
          </div>
        </div>
      </div>
    </Link>
  );
}
