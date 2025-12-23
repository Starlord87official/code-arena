import { Trophy, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClanBattle } from '@/lib/battleData';

interface BattleResultBannerProps {
  battle: ClanBattle;
  userClan: 'A' | 'B';
}

export function BattleResultBanner({ battle, userClan }: BattleResultBannerProps) {
  const isWinner = battle.winner === userClan;
  const isTie = battle.winner === 'tie';
  
  const userClanData = userClan === 'A' ? battle.clanA : battle.clanB;
  const opponentClanData = userClan === 'A' ? battle.clanB : battle.clanA;
  
  const xpChange = isWinner ? 1200 : isTie ? 0 : -800;

  return (
    <Card className={`arena-card overflow-hidden ${
      isWinner 
        ? 'border-status-success neon-box' 
        : isTie 
          ? 'border-status-warning' 
          : 'border-destructive at-risk'
    }`} style={{ boxShadow: isWinner ? '0 0 30px hsla(142, 76%, 45%, 0.3)' : undefined }}>
      <div className={`h-2 ${
        isWinner 
          ? 'bg-gradient-to-r from-status-success via-primary to-status-success' 
          : isTie 
            ? 'bg-gradient-to-r from-status-warning via-accent to-status-warning'
            : 'bg-gradient-to-r from-destructive via-destructive/50 to-destructive'
      }`} />
      
      <CardContent className="py-8">
        <div className="text-center">
          {/* Result Icon */}
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            isWinner 
              ? 'bg-status-success/20' 
              : isTie 
                ? 'bg-status-warning/20' 
                : 'bg-destructive/20'
          }`}>
            {isWinner ? (
              <Trophy className="w-10 h-10 text-status-success" />
            ) : isTie ? (
              <Star className="w-10 h-10 text-status-warning" />
            ) : (
              <TrendingDown className="w-10 h-10 text-destructive" />
            )}
          </div>
          
          {/* Result Text */}
          <h2 className={`font-display text-4xl md:text-5xl font-black mb-2 ${
            isWinner 
              ? 'text-status-success' 
              : isTie 
                ? 'text-status-warning' 
                : 'text-destructive'
          }`}>
            {isWinner ? 'VICTORY!' : isTie ? 'DRAW' : 'DEFEAT'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {isWinner 
              ? 'Your clan dominated the battlefield!' 
              : isTie 
                ? 'An evenly matched battle. Both clans showed strength.'
                : 'Learn from this defeat. Come back stronger.'}
          </p>
          
          {/* Score Summary */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className={`text-center ${userClan === 'A' ? 'order-1' : 'order-3'}`}>
              <div className="text-3xl font-display font-bold text-primary">
                {battle.clanA.battleScore.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">{battle.clanA.name}</p>
            </div>
            
            <div className="text-center order-2">
              <Badge variant="outline" className="text-xl font-display px-4 py-2">
                VS
              </Badge>
            </div>
            
            <div className={`text-center ${userClan === 'B' ? 'order-1' : 'order-3'}`}>
              <div className="text-3xl font-display font-bold text-accent">
                {battle.clanB.battleScore.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">{battle.clanB.name}</p>
            </div>
          </div>
          
          {/* XP Change */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${
            xpChange > 0 
              ? 'bg-status-success/20 text-status-success' 
              : xpChange < 0 
                ? 'bg-destructive/20 text-destructive'
                : 'bg-secondary text-muted-foreground'
          }`}>
            {xpChange > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : xpChange < 0 ? (
              <TrendingDown className="w-5 h-5" />
            ) : null}
            <span className="font-display text-2xl font-bold">
              {xpChange > 0 ? '+' : ''}{xpChange.toLocaleString()} XP
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" className="border-primary/30">
              View Battle Stats
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              Return to Clan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
