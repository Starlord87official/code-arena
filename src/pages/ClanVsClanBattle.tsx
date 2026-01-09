import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BattleHeader } from '@/components/battle/BattleHeader';
import { ClanBattlePanel } from '@/components/battle/ClanBattlePanel';
import { BattleArena } from '@/components/battle/BattleArena';
import { BattleChatPanel } from '@/components/battle/BattleChatPanel';
import { BattleResultBanner } from '@/components/battle/BattleResultBanner';
import { PostBattleResults } from '@/components/battle/PostBattleResults';
import { useSaveBattle } from '@/hooks/useBattleHistory';
import { useBattleSounds } from '@/hooks/useBattleSounds';
import { 
  mockBattle, 
  mockContributorsA, 
  mockContributorsB, 
  mockBattleFeed, 
  mockClanChat,
  ClanBattle
} from '@/lib/battleData';

type BattleStatus = 'live' | 'ending' | 'ended';

// Session storage key for battle state persistence
const BATTLE_STATE_KEY = 'clan-battle-state';

interface PersistedBattleState {
  battleId: string;
  status: BattleStatus;
  endedAt?: number;
}

function getPersistedState(battleId: string): PersistedBattleState | null {
  try {
    const stored = sessionStorage.getItem(BATTLE_STATE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as PersistedBattleState;
      if (state.battleId === battleId) {
        return state;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function persistState(state: PersistedBattleState) {
  sessionStorage.setItem(BATTLE_STATE_KEY, JSON.stringify(state));
}

export default function ClanVsClanBattle() {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const hasSavedBattle = useRef(false);
  
  // Mutation to save battle to history
  const saveBattle = useSaveBattle();
  
  // Sound effects for reset
  const { resetSounds } = useBattleSounds(mockBattle.id);
  
  // Check for persisted state on mount
  const initialState = (): { status: BattleStatus; showOverlay: boolean } => {
    const persisted = getPersistedState(mockBattle.id);
    if (persisted && persisted.status === 'ended') {
      // Battle already ended - show result banner, not overlay
      return { status: 'ended', showOverlay: false };
    }
    return { status: 'live', showOverlay: false };
  };
  
  const [battleStatus, setBattleStatus] = useState<BattleStatus>(initialState().status);
  const [showPostBattle, setShowPostBattle] = useState(initialState().showOverlay);
  const [finalScoreAnimating, setFinalScoreAnimating] = useState(false);
  
  // Demo battle with dynamic end time (only set for live battles)
  const [demoBattle, setDemoBattle] = useState<ClanBattle>(() => {
    const persisted = getPersistedState(mockBattle.id);
    if (persisted && persisted.status === 'ended') {
      // Return ended battle
      return {
        ...mockBattle,
        status: 'ended' as const,
        endTime: new Date(persisted.endedAt || Date.now()),
      };
    }
    // Set end time to 15 seconds from now for demo
    return {
      ...mockBattle,
      endTime: new Date(Date.now() + 15 * 1000),
    };
  });

  // Compute battle state based on status
  const battle: ClanBattle = battleStatus === 'ended' || battleStatus === 'ending'
    ? { ...demoBattle, status: 'ended' as const, winner: 'A' as const }
    : demoBattle;

  // Mock ELO/XP changes
  const isWinner = battle.winner === 'A';
  const eloChange = isWinner ? 25 : -15;
  const xpChange = isWinner ? 450 : 50;

  // Handle timer reaching zero
  const handleTimerEnd = useCallback(() => {
    if (battleStatus !== 'live') return;
    
    // Start ending sequence
    setBattleStatus('ending');
    setFinalScoreAnimating(true);
    
    // Persist the ended state
    persistState({
      battleId: mockBattle.id,
      status: 'ended',
      endedAt: Date.now(),
    });
    
    // After 2s delay, show post-battle overlay
    setTimeout(() => {
      setFinalScoreAnimating(false);
      setBattleStatus('ended');
      setShowPostBattle(true);
    }, 2000);
  }, [battleStatus]);

  // Save battle to database when it ends (only once)
  useEffect(() => {
    if (battleStatus === 'ended' && !hasSavedBattle.current) {
      hasSavedBattle.current = true;
      
      // Create the ended battle object
      const endedBattle: ClanBattle = {
        ...demoBattle,
        status: 'ended',
        winner: 'A',
      };
      
      saveBattle.mutate({
        battle: endedBattle,
        contributorsA: mockContributorsA,
        contributorsB: mockContributorsB,
        xpChange,
        eloChange,
      });
    }
  }, [battleStatus, demoBattle, saveBattle, xpChange, eloChange]);

  // Manual trigger for testing
  const handleManualEndBattle = () => {
    if (battleStatus === 'live') {
      handleTimerEnd();
    } else {
      // Reset to live state for testing - clear persisted state and sounds
      sessionStorage.removeItem(BATTLE_STATE_KEY);
      hasSavedBattle.current = false;
      resetSounds();
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
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md flex items-center justify-center pointer-events-none">
          <div className="text-center animate-scale-in">
            {/* Pulsing trophy icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary to-primary/60 p-6 rounded-full">
                <Trophy className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            
            <h2 className="font-display text-4xl font-bold text-foreground mb-3">
              Battle Complete!
            </h2>
            
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-lg">Calculating final scores...</span>
            </div>
            
            {/* Score lock animation bars */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-display font-bold text-primary animate-pulse">
                  {battle.clanA.battleScore.toLocaleString()}
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {battle.clanA.name}
                </span>
              </div>
              <span className="text-muted-foreground font-bold">VS</span>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-display font-bold text-accent animate-pulse">
                  {battle.clanB.battleScore.toLocaleString()}
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {battle.clanB.name}
                </span>
              </div>
            </div>
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
              {/* Battle chat is available to all authenticated users - no role checks */}
              <div className="flex-1 min-h-[400px]">
                <BattleChatPanel 
                  clanChat={mockClanChat}
                  battleFeed={mockBattleFeed}
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
