import { useState } from 'react';
import { 
  Swords, Users, Zap, Clock, Trophy, Search, 
  ChevronRight, Shield, Flame, Target, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { mockLeaderboard, mockUser, getDivisionColor, getDivisionAura } from '@/lib/mockData';

const onlineOpponents = mockLeaderboard.slice(3, 8).map(user => ({
  ...user,
  isOnline: true,
  lastSeen: 'now',
}));

const pendingDuels = [
  { id: '1', opponent: mockLeaderboard[2], status: 'pending', createdAt: '5 min ago' },
];

const recentDuels = [
  { id: '1', opponent: mockLeaderboard[4], result: 'win', xpGained: 75, date: '2 hours ago' },
  { id: '2', opponent: mockLeaderboard[6], result: 'loss', xpGained: -25, date: '1 day ago' },
  { id: '3', opponent: mockLeaderboard[8], result: 'win', xpGained: 100, date: '2 days ago' },
];

export default function Battle() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<'quick' | 'ranked' | 'custom'>('quick');

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Swords className="h-10 w-10 text-destructive" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              DUO <span className="text-destructive">BATTLE</span>
            </h1>
            <Swords className="h-10 w-10 text-destructive transform scale-x-[-1]" />
          </div>
          <p className="text-muted-foreground">
            Challenge opponents. Prove your superiority. Only one survives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Battle Modes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Battle Mode Selection */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Select Battle Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedMode('quick')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedMode === 'quick' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Zap className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-display font-bold text-foreground mb-1">Quick Match</h3>
                  <p className="text-sm text-muted-foreground">Random opponent, 15 min battle</p>
                  <Badge className="mt-3 bg-primary/20 text-primary border-primary/30">+50 XP</Badge>
                </button>

                <button
                  onClick={() => setSelectedMode('ranked')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedMode === 'ranked' 
                      ? 'border-destructive bg-destructive/10' 
                      : 'border-border hover:border-destructive/50'
                  }`}
                >
                  <Trophy className="h-8 w-8 text-destructive mb-3" />
                  <h3 className="font-display font-bold text-foreground mb-1">Ranked Battle</h3>
                  <p className="text-sm text-muted-foreground">ELO-based matching, 30 min</p>
                  <Badge className="mt-3 bg-destructive/20 text-destructive border-destructive/30">+100 XP</Badge>
                </button>

                <button
                  onClick={() => setSelectedMode('custom')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedMode === 'custom' 
                      ? 'border-status-success bg-status-success/10' 
                      : 'border-border hover:border-status-success/50'
                  }`}
                >
                  <Target className="h-8 w-8 text-status-success mb-3" />
                  <h3 className="font-display font-bold text-foreground mb-1">Custom Duel</h3>
                  <p className="text-sm text-muted-foreground">Choose opponent & rules</p>
                  <Badge className="mt-3 bg-status-success/20 text-status-success border-status-success/30">Flexible</Badge>
                </button>
              </div>

              <div className="mt-6">
                <Button variant="arena" size="lg" className="w-full">
                  <Swords className="h-5 w-5 mr-2" />
                  Find Opponent
                </Button>
              </div>
            </div>

            {/* Online Opponents */}
            <div className="arena-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">Online Warriors</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search player..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {onlineOpponents.map((opponent) => (
                  <div 
                    key={opponent.uid}
                    className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-primary/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className={`h-12 w-12 border-2 ${getDivisionColor(opponent.division).replace('text-', 'border-')}`}>
                          <AvatarFallback className="bg-muted text-foreground font-bold">
                            {opponent.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-status-success rounded-full border-2 border-background" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{opponent.username}</span>
                          <Badge className={`${getDivisionColor(opponent.division)} border border-current/30 bg-current/10 uppercase text-xs`}>
                            {opponent.division}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>ELO: {opponent.elo}</span>
                          <span>•</span>
                          <span>Level {opponent.level}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="arenaOutline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Swords className="h-4 w-4 mr-2" />
                      Challenge
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Duels */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Recent Battles</h2>
              <div className="space-y-3">
                {recentDuels.map((duel) => (
                  <div 
                    key={duel.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      duel.result === 'win' 
                        ? 'bg-status-success/10 border border-status-success/30' 
                        : 'bg-destructive/10 border border-destructive/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {duel.result === 'win' ? (
                        <Crown className="h-6 w-6 text-status-success" />
                      ) : (
                        <Shield className="h-6 w-6 text-destructive" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">vs {duel.opponent.username}</span>
                          <Badge className={duel.result === 'win' ? 'bg-status-success/20 text-status-success' : 'bg-destructive/20 text-destructive'}>
                            {duel.result.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{duel.date}</span>
                      </div>
                    </div>
                    <div className={`font-bold ${duel.xpGained > 0 ? 'text-status-success' : 'text-destructive'}`}>
                      {duel.xpGained > 0 ? '+' : ''}{duel.xpGained} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Pending */}
          <div className="space-y-6">
            {/* Your Battle Stats */}
            <div className={`arena-card p-6 ${getDivisionAura(mockUser.division)}`}>
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Your Battle Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Battle ELO</span>
                  <span className="font-bold text-primary text-xl">{mockUser.elo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="font-bold text-status-success">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Duels</span>
                  <span className="font-bold text-foreground">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Win Streak</span>
                  <span className="font-bold text-status-warning flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    3
                  </span>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Next Rank</span>
                    <span className="text-primary">Master (+153 ELO)</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </div>

            {/* Pending Challenges */}
            <div className="arena-card p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                Pending Challenges
                {pendingDuels.length > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingDuels.length}
                  </span>
                )}
              </h2>
              
              {pendingDuels.length > 0 ? (
                <div className="space-y-3">
                  {pendingDuels.map((duel) => (
                    <div key={duel.id} className="p-4 bg-background rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-muted text-foreground font-bold">
                            {duel.opponent.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground">{duel.opponent.username}</span>
                          <p className="text-xs text-muted-foreground">{duel.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="arena" size="sm" className="flex-1">Accept</Button>
                        <Button variant="outline" size="sm" className="flex-1">Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No pending challenges</p>
              )}
            </div>

            {/* Quick Tips */}
            <div className="arena-card p-6 border-status-warning/30 bg-status-warning/5">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Flame className="h-4 w-4 text-status-warning" />
                Battle Tips
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Win streaks grant bonus XP</li>
                <li>• Ranked battles affect your ELO</li>
                <li>• Higher division opponents = more XP</li>
                <li>• Practice in Quick Match first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
