import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BattleHeader } from '@/components/battle/BattleHeader';
import { ClanBattlePanel } from '@/components/battle/ClanBattlePanel';
import { BattleArena } from '@/components/battle/BattleArena';
import { BattleChatPanel } from '@/components/battle/BattleChatPanel';
import { BattleResultBanner } from '@/components/battle/BattleResultBanner';
import { 
  mockBattle, 
  mockContributorsA, 
  mockContributorsB, 
  mockBattleFeed, 
  mockClanChat 
} from '@/lib/battleData';

export default function ClanVsClanBattle() {
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  
  // For demo: Toggle between live and ended state
  const battle = showResult 
    ? { ...mockBattle, status: 'ended' as const, winner: 'A' as const }
    : mockBattle;

  return (
    <>

      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/30"
                >
                  <Users className="w-4 h-4" />
                  {battle.clanA.memberCount + battle.clanB.memberCount} Online
                </Button>
                
                {/* Demo toggle for showing result */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResult(!showResult)}
                  className="text-xs"
                >
                  {showResult ? 'Show Live' : 'Show Result'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Header */}
        <div className="border-b border-border">
          <div className="container mx-auto">
            <BattleHeader battle={battle} />
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Result Banner (when battle ended) */}
          {battle.status === 'ended' && battle.winner && (
            <div className="mb-6">
              <BattleResultBanner battle={battle} userClan="A" />
            </div>
          )}

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Clan A Panel */}
            <div className="lg:col-span-3">
              <ClanBattlePanel 
                clan={battle.clanA} 
                contributors={mockContributorsA} 
                side="A" 
              />
            </div>

            {/* Center: Battle Arena */}
            <div className="lg:col-span-5">
              <BattleArena 
                problems={battle.problems} 
                feedMessages={mockBattleFeed} 
              />
            </div>

            {/* Right: Clan B Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ClanBattlePanel 
                clan={battle.clanB} 
                contributors={mockContributorsB} 
                side="B" 
              />
              
              {/* Chat Panel - Below Clan B on desktop */}
              <div className="flex-1 min-h-[400px]">
                <BattleChatPanel 
                  clanChat={mockClanChat}
                  battleFeed={mockBattleFeed}
                  isMentor={true}
                  battleEnded={battle.status === 'ended'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
