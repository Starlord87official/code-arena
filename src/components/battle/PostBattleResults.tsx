import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Users,
  ChevronRight,
  Star,
  Target,
  Flame,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClanBattle, BattleContributor } from '@/lib/battleData';

interface PostBattleResultsProps {
  battle: ClanBattle;
  contributorsA: BattleContributor[];
  contributorsB: BattleContributor[];
  userClanId: string;
  onClose?: () => void;
}

export function PostBattleResults({
  battle,
  contributorsA,
  contributorsB,
  userClanId,
}: PostBattleResultsProps) {
  const [showContent, setShowContent] = useState(false);
  const [showMVP, setShowMVP] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const isUserClanA = userClanId === battle.clanA.id;
  const userClan = isUserClanA ? battle.clanA : battle.clanB;
  const opponentClan = isUserClanA ? battle.clanB : battle.clanA;
  const userContributors = isUserClanA ? contributorsA : contributorsB;
  const opponentContributors = isUserClanA ? contributorsB : contributorsA;

  const isWinner = battle.winner === (isUserClanA ? 'A' : 'B');
  const isDraw = battle.winner === 'tie';
  const mvp = [...contributorsA, ...contributorsB].sort((a, b) => b.xpGained - a.xpGained)[0];
  const isUserMVP = userContributors.some(c => c.id === mvp?.id);

  // Mock ELO changes
  const eloChange = isWinner ? 25 : isDraw ? 0 : -15;
  const xpGained = isWinner ? 450 : isDraw ? 100 : 50;

  // Animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 500);
    const timer2 = setTimeout(() => setShowMVP(true), 1500);
    const timer3 = setTimeout(() => setShowStats(true), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const problemsSolvedA = battle.problems.filter(p => 
    p.status === 'solved-a' || p.status === 'solved-both'
  ).length;
  const problemsSolvedB = battle.problems.filter(p => 
    p.status === 'solved-b' || p.status === 'solved-both'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm overflow-y-auto py-8">
      {/* Victory/Defeat Animation Background */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {isWinner ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/30 rounded-full blur-[100px] animate-pulse" />
          </>
        ) : isDraw ? (
          <div className="absolute inset-0 bg-gradient-to-b from-status-warning/10 via-transparent to-transparent" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-destructive/10 via-transparent to-transparent" />
        )}
      </div>

      <div className="relative w-full max-w-4xl mx-4">
        {/* Main Result Banner */}
        <div className={`text-center mb-8 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          {isWinner ? (
            <>
              <div className="inline-flex items-center gap-3 mb-4">
                <Trophy className="h-12 w-12 text-status-warning animate-bounce" />
                <h1 className="font-display text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-status-warning via-primary to-status-warning animate-pulse">
                  VICTORY
                </h1>
                <Trophy className="h-12 w-12 text-status-warning animate-bounce" />
              </div>
              <p className="text-xl text-muted-foreground">
                <span className="text-primary font-bold">{userClan.name}</span> dominated the arena!
              </p>
            </>
          ) : isDraw ? (
            <>
              <div className="inline-flex items-center gap-3 mb-4">
                <Shield className="h-10 w-10 text-status-warning" />
                <h1 className="font-display text-5xl md:text-6xl font-bold text-status-warning">
                  DRAW
                </h1>
                <Shield className="h-10 w-10 text-status-warning" />
              </div>
              <p className="text-xl text-muted-foreground">
                An evenly matched battle between rivals
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-3 mb-4">
                <h1 className="font-display text-5xl md:text-6xl font-bold text-muted-foreground">
                  DEFEAT
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                <span className="text-destructive font-bold">{opponentClan.name}</span> claimed victory. Rise again.
              </p>
            </>
          )}
        </div>

        {/* Score Comparison */}
        <div className={`arena-card p-6 mb-6 transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between gap-4">
            {/* Clan A */}
            <div className={`flex-1 text-center ${isUserClanA ? 'order-1' : 'order-3'}`}>
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-xl mb-3 ${
                isWinner && isUserClanA ? 'bg-primary/20 border-2 border-primary shadow-neon' : 
                isWinner && !isUserClanA ? 'bg-destructive/20 border border-destructive/50' :
                'bg-secondary border border-border'
              }`}>
                <span className="font-display text-2xl font-bold">{battle.clanA.mentorAvatar}</span>
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">{battle.clanA.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">Led by {battle.clanA.mentorName}</p>
              <div className={`font-display text-4xl font-bold ${
                battle.winner === 'A' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {battle.clanA.battleScore}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">BATTLE XP</p>
            </div>

            {/* VS */}
            <div className="text-center order-2">
              <div className="text-3xl font-display font-bold text-muted-foreground">VS</div>
            </div>

            {/* Clan B */}
            <div className={`flex-1 text-center ${!isUserClanA ? 'order-1' : 'order-3'}`}>
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-xl mb-3 ${
                isWinner && !isUserClanA ? 'bg-primary/20 border-2 border-primary shadow-neon' : 
                isWinner && isUserClanA ? 'bg-destructive/20 border border-destructive/50' :
                'bg-secondary border border-border'
              }`}>
                <span className="font-display text-2xl font-bold">{battle.clanB.mentorAvatar}</span>
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">{battle.clanB.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">Led by {battle.clanB.mentorName}</p>
              <div className={`font-display text-4xl font-bold ${
                battle.winner === 'B' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {battle.clanB.battleScore}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">BATTLE XP</p>
            </div>
          </div>
        </div>

        {/* MVP Section */}
        <div className={`arena-card p-6 mb-6 border-status-warning/50 bg-gradient-to-r from-status-warning/10 via-transparent to-status-warning/10 transition-all duration-700 ${showMVP ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-status-warning to-primary flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-background">{mvp?.avatar}</span>
                </div>
                <Crown className="absolute -top-2 -right-2 h-6 w-6 text-status-warning drop-shadow-lg" />
              </div>
              <div>
                <Badge className="bg-status-warning/20 text-status-warning border-status-warning/50 mb-1">
                  👑 BATTLE MVP
                </Badge>
                <h3 className="font-heading font-bold text-xl">{mvp?.username}</h3>
                <p className="text-sm text-muted-foreground">
                  {isUserMVP ? 'From your clan!' : `From ${opponentClan.name}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-display text-2xl font-bold text-primary">+{mvp?.xpGained}</span>
              </div>
              <p className="text-sm text-muted-foreground">{mvp?.problemsSolved} problems solved</p>
              {mvp?.streak && (
                <Badge variant="outline" className="mt-1 text-status-warning border-status-warning/50">
                  <Flame className="h-3 w-3 mr-1" /> On Fire
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 transition-all duration-700 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="arena-card p-4 text-center">
            <div className={`flex items-center justify-center gap-1 mb-2 ${eloChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {eloChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              <span className="font-display text-2xl font-bold">{eloChange >= 0 ? '+' : ''}{eloChange}</span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">ELO Change</p>
          </div>
          
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2 text-status-success">
              <Zap className="h-5 w-5" />
              <span className="font-display text-2xl font-bold">+{xpGained}</span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">XP Earned</p>
          </div>

          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2 text-primary">
              <Target className="h-5 w-5" />
              <span className="font-display text-2xl font-bold">
                {isUserClanA ? problemsSolvedA : problemsSolvedB}/{battle.problems.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Problems Solved</p>
          </div>

          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2 text-status-warning">
              <Users className="h-5 w-5" />
              <span className="font-display text-2xl font-bold">{userContributors.length}</span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Contributors</p>
          </div>
        </div>

        {/* Top Contributors */}
        <div className={`grid md:grid-cols-2 gap-6 mb-8 transition-all duration-700 delay-500 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Your Clan */}
          <div className="arena-card p-4">
            <h4 className="font-heading font-bold mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              {userClan.name} - Top Contributors
            </h4>
            <div className="space-y-3">
              {userContributors.slice(0, 5).map((contributor, index) => (
                <div key={contributor.id} className="flex items-center gap-3">
                  <span className={`font-display font-bold w-6 text-center ${
                    index === 0 ? 'text-status-warning' : 'text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold">
                    {contributor.avatar}
                  </div>
                  <span className="flex-1 font-medium">{contributor.username}</span>
                  <span className="text-primary font-bold">+{contributor.xpGained}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Opponent Clan */}
          <div className="arena-card p-4">
            <h4 className="font-heading font-bold mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-accent" />
              {opponentClan.name} - Top Contributors
            </h4>
            <div className="space-y-3">
              {opponentContributors.slice(0, 5).map((contributor, index) => (
                <div key={contributor.id} className="flex items-center gap-3">
                  <span className={`font-display font-bold w-6 text-center ${
                    index === 0 ? 'text-status-warning' : 'text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold">
                    {contributor.avatar}
                  </div>
                  <span className="flex-1 font-medium">{contributor.username}</span>
                  <span className="text-accent font-bold">+{contributor.xpGained}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-700 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link to={`/clan/${userClanId}`}>
            <Button variant="arena" size="lg" className="w-full sm:w-auto">
              <Users className="h-5 w-5 mr-2" />
              Return to Clan
            </Button>
          </Link>
          <Link to={`/clan/${userClanId}?tab=battles`}>
            <Button variant="arenaOutline" size="lg" className="w-full sm:w-auto">
              View Battle Details
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
