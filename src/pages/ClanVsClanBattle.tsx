import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BattleHeader } from '@/components/battle/BattleHeader';
import { ClanBattlePanel } from '@/components/battle/ClanBattlePanel';
import { BattleArena } from '@/components/battle/BattleArena';
import { BattleChatPanel } from '@/components/battle/BattleChatPanel';
import { BattleResultBanner } from '@/components/battle/BattleResultBanner';
import { PostBattleResults } from '@/components/battle/PostBattleResults';
import { 
  mockBattle, 
  mockContributorsA, 
  mockContributorsB, 
  mockBattleFeed, 
  mockClanChat,
  ClanBattle
} from '@/lib/battleData';

type BattleStatus = 'live' | 'ending' | 'ended';

export default function ClanVsClanBattle() {
  const navigate = useNavigate();
  const [battleStatus, setBattleStatus] = useState<BattleStatus>('live');
  const [showPostBattle, setShowPostBattle] = useState(false);
  const [finalScoreAnimating, setFinalScoreAnimating] = useState(false);
  
  // For demo: Use a shorter timer (15 seconds from now) to test auto-trigger
  const [demoBattle, setDemoBattle] = useState<ClanBattle>(() => ({
    ...mockBattle,
    // Set end time to 15 seconds from now for demo
    endTime: new Date(Date.now() + 15 * 1000),
  }));

  // Compute battle state based on status
  const battle: ClanBattle = battleStatus === 'ended' || battleStatus === 'ending'
    ? { ...demoBattle, status: 'ended' as const, winner: 'A' as const }
    : demoBattle;

  // Handle timer reaching zero
  const handleTimerEnd = useCallback(() => {
    if (battleStatus !== 'live') return;
    
    // Start ending sequence
    setBattleStatus('ending');
    setFinalScoreAnimating(true);
    
    // After 1.5s delay, show post-battle overlay
    setTimeout(() => {
      setFinalScoreAnimating(false);
      setBattleStatus('ended');
      setShowPostBattle(true);
    }, 1500);
  }, [battleStatus]);

  // Manual trigger for testing
  const handleManualEndBattle = () => {
    if (battleStatus === 'live') {
      handleTimerEnd();
    } else {
      // Reset to live state for testing
      setBattleStatus('live');
      setShowPostBattle(false);
      setDemoBattle({
        ...mockBattle,
        endTime: new Date(Date.now() + 15 * 1000),
      });
    }
  };

  // Disable interactions when battle ended
  const isInteractionDisabled = battleStatus !== 'live';

  return (
    <>
      {/* Score Lock Animation Overlay */}
      {finalScoreAnimating && (
        <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="text-center animate-scale-in">
            <AlertCircle className="w-16 h-16 text-status-warning mx-auto mb-4 animate-pulse" />
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Battle Complete!</h2>
            <p className="text-muted-foreground">Calculating final scores...</p>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-background ${isInteractionDisabled ? 'pointer-events-none' : ''}`}>
        {/* Re-enable pointer events for navigation */}
        <div className="pointer-events-auto">
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
                  
                  {/* Demo toggle for testing */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualEndBattle}
                    className="text-xs"
                  >
                    {battleStatus !== 'live' ? 'Reset Battle' : 'End Battle (Test)'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Header */}
        <div className="border-b border-border">
          <div className="container mx-auto">
            <BattleHeader 
              battle={battle} 
              onTimerEnd={handleTimerEnd}
              isEnded={battleStatus === 'ended'}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Result Banner (when battle ended but overlay dismissed) */}
          {battleStatus === 'ended' && !showPostBattle && battle.winner && (
            <div className="mb-6 pointer-events-auto">
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
                  battleEnded={battleStatus === 'ended'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Battle Results Overlay */}
      {showPostBattle && battleStatus === 'ended' && (
        <PostBattleResults
          battle={battle}
          contributorsA={mockContributorsA}
          contributorsB={mockContributorsB}
          userClanId={battle.clanA.id}
          onClose={() => setShowPostBattle(false)}
        />
      )}
    </>
  );
}
