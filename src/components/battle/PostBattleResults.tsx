import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Shield,
  Activity,
  Percent,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClanBattle, BattleContributor } from '@/lib/battleData';

interface PostBattleResultsProps {
  battle: ClanBattle;
  contributorsA: BattleContributor[];
  contributorsB: BattleContributor[];
  userClanId: string;
  onClose?: () => void;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const randomX = Math.random() * 100;
  const randomDuration = 3 + Math.random() * 2;
  
  return (
    <div
      className="absolute w-3 h-3 opacity-0"
      style={{
        left: `${randomX}%`,
        top: '-10px',
        backgroundColor: color,
        animation: `confettiFall ${randomDuration}s ease-out ${delay}s forwards`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
}

export function PostBattleResults({
  battle,
  contributorsA,
  contributorsB,
  userClanId,
  onClose,
}: PostBattleResultsProps) {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showMVP, setShowMVP] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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
  
  // Mock streak data
  const streakData = {
    current: isWinner ? 3 : 0,
    previous: isWinner ? 2 : 2,
    status: isWinner ? 'continued' : 'broken',
  };

  // Handle overlay close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    navigate(`/clan/${userClanId}`);
  };

  // Animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setShowMVP(true), 1200);
    const timer3 = setTimeout(() => setShowStats(true), 2000);
    const timer4 = setTimeout(() => setShowSummary(true), 2800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const problemsSolvedA = battle.problems.filter(p => 
    p.status === 'solved-a' || p.status === 'solved-both'
  ).length;
  const problemsSolvedB = battle.problems.filter(p => 
    p.status === 'solved-b' || p.status === 'solved-both'
  ).length;
  
  // Mock accuracy data
  const accuracyA = Math.round((problemsSolvedA / battle.problems.length) * 100);
  const accuracyB = Math.round((problemsSolvedB / battle.problems.length) * 100);
  
  // Mock momentum data (percentage of battle where each clan was ahead)
  const momentumA = isUserClanA ? (isWinner ? 65 : 35) : (isWinner ? 35 : 65);
  const momentumB = 100 - momentumA;

  // Generate confetti colors based on result
  const confettiColors = isWinner 
    ? ['hsl(var(--primary))', 'hsl(var(--status-warning))', 'hsl(var(--status-success))', '#FFD700', '#00FF88']
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Backdrop - freezes battle UI underneath */}
      <div 
        className="absolute inset-0 bg-background/98 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Victory Confetti Effect */}
      {isWinner && showContent && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle 
              key={i} 
              delay={Math.random() * 2} 
              color={confettiColors[i % confettiColors.length]} 
            />
          ))}
        </div>
      )}
      
      {/* Victory/Defeat Animation Background */}
      <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {isWinner ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-status-success/10 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/40 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-status-warning/30 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-status-success/30 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        ) : isDraw ? (
          <div className="absolute inset-0 bg-gradient-to-b from-status-warning/20 via-transparent to-transparent" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-destructive/25 via-orange-500/10 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-destructive/30 rounded-full blur-[100px]" />
          </>
        )}
      </div>
      
      {/* Custom CSS for confetti animation */}
      <style>{`
        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3);
          }
          50% {
            box-shadow: 0 0 40px hsl(var(--primary) / 0.8), 0 0 80px hsl(var(--primary) / 0.5);
          }
        }
        
        .victory-glow {
          animation: glowPulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent py-4">
        {/* Main Result Banner */}
        <div className={`text-center mb-8 transition-all duration-700 transform ${showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-90'}`}>
          {isWinner ? (
            <>
              <div className="inline-flex items-center gap-4 mb-4">
                <Trophy className="h-14 w-14 text-status-warning animate-bounce" />
                <h1 className="font-display text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-status-warning via-primary to-status-success victory-glow">
                  VICTORY
                </h1>
                <Trophy className="h-14 w-14 text-status-warning animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <div className="flex items-center justify-center gap-3 text-xl">
                <span className="text-primary font-bold">{userClan.name}</span>
                <Sparkles className="h-5 w-5 text-status-warning animate-pulse" />
                <span className="text-muted-foreground">dominated the arena!</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Defeated <span className="text-foreground">{opponentClan.name}</span>
              </p>
            </>
          ) : isDraw ? (
            <>
              <div className="inline-flex items-center gap-3 mb-4">
                <Shield className="h-12 w-12 text-status-warning" />
                <h1 className="font-display text-6xl md:text-7xl font-bold text-status-warning">
                  DRAW
                </h1>
                <Shield className="h-12 w-12 text-status-warning" />
              </div>
              <p className="text-xl text-muted-foreground">
                An evenly matched battle between rivals
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-3 mb-4">
                <h1 className="font-display text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-destructive via-orange-500 to-destructive">
                  DEFEAT
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                <span className="text-destructive font-bold">{opponentClan.name}</span> claimed victory
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Regroup and rise again, warriors.
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

        {/* League / XP Impact Section */}
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
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Clan XP Gained</p>
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
            <div className={`flex items-center justify-center gap-1 mb-2 ${streakData.status === 'continued' ? 'text-status-warning' : 'text-destructive'}`}>
              <Flame className="h-5 w-5" />
              <span className="font-display text-2xl font-bold">
                {streakData.status === 'continued' ? streakData.current : '0'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {streakData.status === 'continued' ? 'Win Streak' : 'Streak Broken'}
            </p>
          </div>
        </div>
        
        {/* Battle Summary Section */}
        <div className={`arena-card p-5 mb-6 transition-all duration-700 ${showSummary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h4 className="font-heading font-bold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Battle Summary
          </h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Problems Solved Comparison */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Problems Solved</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-primary font-medium">{userClan.name}</span>
                    <span className="font-bold">{isUserClanA ? problemsSolvedA : problemsSolvedB}</span>
                  </div>
                  <Progress value={(isUserClanA ? problemsSolvedA : problemsSolvedB) / battle.problems.length * 100} className="h-2" />
                </div>
                <span className="text-muted-foreground text-sm">vs</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-accent font-medium">{opponentClan.name}</span>
                    <span className="font-bold">{isUserClanA ? problemsSolvedB : problemsSolvedA}</span>
                  </div>
                  <Progress value={(isUserClanA ? problemsSolvedB : problemsSolvedA) / battle.problems.length * 100} className="h-2 [&>div]:bg-accent" />
                </div>
              </div>
            </div>
            
            {/* Accuracy */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Completion Rate</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" />
                  <span className="font-display text-xl font-bold text-primary">{isUserClanA ? accuracyA : accuracyB}%</span>
                </div>
                <span className="text-muted-foreground">vs</span>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-accent" />
                  <span className="font-display text-xl font-bold text-accent">{isUserClanA ? accuracyB : accuracyA}%</span>
                </div>
              </div>
            </div>
            
            {/* Momentum Snapshot */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Battle Momentum</p>
              <div className="relative h-6 rounded-full overflow-hidden bg-secondary">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                  style={{ width: `${isUserClanA ? momentumA : momentumB}%` }}
                />
                <div 
                  className="absolute right-0 top-0 h-full bg-gradient-to-l from-accent to-accent/70 transition-all"
                  style={{ width: `${isUserClanA ? momentumB : momentumA}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground drop-shadow-md">
                    {isUserClanA ? momentumA : momentumB}% - {isUserClanA ? momentumB : momentumA}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {(isUserClanA ? momentumA : momentumB) > 50 ? 'You led most of the battle' : 'Opponent had momentum advantage'}
              </p>
            </div>
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
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${showSummary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button 
            variant="arena" 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={handleClose}
          >
            <Users className="h-5 w-5 mr-2" />
            Return to Clan
          </Button>
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
