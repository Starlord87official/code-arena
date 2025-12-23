import { forwardRef } from 'react';
import { Trophy, Crown, Zap, Swords } from 'lucide-react';
import { ClanBattle, BattleContributor } from '@/lib/battleData';

interface ShareableBattleCardProps {
  battle: ClanBattle;
  contributorsA: BattleContributor[];
  contributorsB: BattleContributor[];
  userClanId: string;
}

export const ShareableBattleCard = forwardRef<HTMLDivElement, ShareableBattleCardProps>(
  ({ battle, contributorsA, contributorsB, userClanId }, ref) => {
    const isUserClanA = userClanId === battle.clanA.id;
    const userClan = isUserClanA ? battle.clanA : battle.clanB;
    const opponentClan = isUserClanA ? battle.clanB : battle.clanA;
    const isWinner = battle.winner === (isUserClanA ? 'A' : 'B');
    const isDraw = battle.winner === 'tie';

    // Find MVP
    const allContributors = [...contributorsA, ...contributorsB];
    const mvp = allContributors.sort((a, b) => b.xpGained - a.xpGained)[0];

    return (
      <div
        ref={ref}
        className="w-[600px] p-6 rounded-xl"
        style={{
          background: isWinner 
            ? 'linear-gradient(135deg, #0a1628 0%, #0f2847 50%, #1a3a5c 100%)'
            : isDraw
            ? 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)'
            : 'linear-gradient(135deg, #1a0a0a 0%, #3d1515 50%, #4a1a1a 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Swords className="w-6 h-6 text-gray-400" />
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
              Clan Battle Results
            </span>
            <Swords className="w-6 h-6 text-gray-400" />
          </div>
          
          <h1 
            className="text-4xl font-black tracking-tight"
            style={{
              color: isWinner ? '#4ade80' : isDraw ? '#fbbf24' : '#f87171',
              textShadow: isWinner 
                ? '0 0 30px rgba(74, 222, 128, 0.5)'
                : isDraw
                ? '0 0 30px rgba(251, 191, 36, 0.5)'
                : '0 0 30px rgba(248, 113, 113, 0.5)',
            }}
          >
            {isWinner ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT'}
          </h1>
        </div>

        {/* Score Section */}
        <div className="flex items-center justify-between gap-4 mb-6 px-4">
          {/* User Clan */}
          <div className="flex-1 text-center">
            <div 
              className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-2xl font-bold mb-2"
              style={{
                background: isWinner 
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : 'linear-gradient(135deg, #6b7280, #4b5563)',
                color: 'white',
              }}
            >
              {userClan.mentorAvatar}
            </div>
            <h3 className="font-bold text-white text-lg">{userClan.name}</h3>
            <div 
              className="text-3xl font-black mt-1"
              style={{ color: isWinner ? '#4ade80' : '#9ca3af' }}
            >
              {isUserClanA ? battle.clanA.battleScore : battle.clanB.battleScore}
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">XP</span>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-black text-gray-500 mt-1">VS</span>
          </div>

          {/* Opponent Clan */}
          <div className="flex-1 text-center">
            <div 
              className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-2xl font-bold mb-2"
              style={{
                background: !isWinner && !isDraw
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #6b7280, #4b5563)',
                color: 'white',
              }}
            >
              {opponentClan.mentorAvatar}
            </div>
            <h3 className="font-bold text-white text-lg">{opponentClan.name}</h3>
            <div 
              className="text-3xl font-black mt-1"
              style={{ color: !isWinner && !isDraw ? '#f87171' : '#9ca3af' }}
            >
              {isUserClanA ? battle.clanB.battleScore : battle.clanA.battleScore}
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">XP</span>
          </div>
        </div>

        {/* MVP Section */}
        {mvp && (
          <div 
            className="rounded-lg p-4 mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
              border: '1px solid rgba(251, 191, 36, 0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: '#1a1a2e',
                  }}
                >
                  {mvp.avatar}
                </div>
                <Crown 
                  className="absolute -top-2 -right-2 w-5 h-5"
                  style={{ color: '#fbbf24' }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs px-2 py-0.5 rounded font-semibold"
                    style={{
                      background: 'rgba(251, 191, 36, 0.2)',
                      color: '#fbbf24',
                    }}
                  >
                    👑 MVP
                  </span>
                </div>
                <h4 className="font-bold text-white">{mvp.username}</h4>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1" style={{ color: '#4ade80' }}>
                  <Zap className="w-4 h-4" />
                  <span className="font-bold">+{mvp.xpGained}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {mvp.problemsSolved} problems
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Trophy className="w-4 h-4" />
            <span>CodeArena Clan Battles</span>
          </div>
        </div>
      </div>
    );
  }
);

ShareableBattleCard.displayName = 'ShareableBattleCard';
