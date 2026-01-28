import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useAuth } from '@/contexts/AuthContext';
import { useInterviewReadiness } from '@/hooks/useInterviewReadiness';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Premium Components
import { ProfileTabs } from './premium/ProfileTabs';
import { AchievementsRow } from './premium/AchievementsRow';
import { InterviewReadinessGauge } from './premium/InterviewReadinessGauge';
import { ChampionBadgeRow } from './premium/ChampionBadgeRow';
import { CommunityStatsCard } from './premium/CommunityStatsCard';
import { SkillsCard } from './premium/SkillsCard';
import { StatisticsRadarChart } from './premium/StatisticsRadarChart';
import { PerformanceBreakdownCard } from './premium/PerformanceBreakdownCard';
import { PerformanceMetricsCard } from './premium/PerformanceMetricsCard';
import { RevisionDisciplineCard } from './premium/RevisionDisciplineCard';
import { EfficiencyCard, WeaknessesCard } from './premium/EfficiencyCards';
import { ReviewPerformanceCard } from './premium/ReviewPerformanceCard';
import { ProfileSubTabs } from './premium/ProfileSubTabs';
import { SolvedProblemsHeader } from './premium/SolvedProblemsHeader';
import { SolvedProblemCard } from './premium/SolvedProblemCard';
import { PatternsPracticedCard, MostFocusedCompanyCard } from './premium/CompanyFocusCards';

// Existing components
import { ProfileActivityHeatmap } from '@/components/profile/ProfileActivityHeatmap';
import { ProfileFriendsList } from '@/components/profile/ProfileFriendsList';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, MapPin, Crown, UserPlus, UserCheck, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PremiumProfileProps {
  username?: string;
}

export function PremiumProfile({ username: propUsername }: PremiumProfileProps) {
  const { username: paramUsername } = useParams<{ username: string }>();
  const username = propUsername || paramUsername;
  
  const { profile, isLoading, error, friendshipStatus, sendFriendRequest, respondToRequest } = usePublicProfile(username);
  const { user, profile: currentUserProfile } = useAuth();
  const { score: readinessScore, label: readinessLabel } = useInterviewReadiness();
  const { data: profileStats, isLoading: statsLoading } = useProfileStats(profile?.id);

  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const isOwnProfile = currentUserProfile?.username?.toLowerCase() === username?.toLowerCase();

  const handleSendFriendRequest = async () => {
    const result = await sendFriendRequest();
    if (result.success) {
      toast.success('Friend request sent!');
    } else {
      toast.error(result.error || 'Failed to send request');
    }
  };

  const handleRespondToRequest = async (accept: boolean) => {
    const result = await respondToRequest(accept);
    if (result.success) {
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
    } else {
      toast.error(result.error || 'Failed to respond');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-72 w-full mb-6" />
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="arena-card p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The user "{username}" doesn't exist or their profile is not available.
            </p>
            <Link to="/leaderboard">
              <Button variant="arena">Browse Leaderboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const division = (profile.division || 'gold') as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';
  const level = Math.floor(profile.xp / 500) + 1;

  // Sample solved problems for the Solved Problems tab
  const sampleProblems = [
    {
      id: '1',
      title: 'Sliding Window Maximum',
      difficulty: 'hard' as const,
      risk: 'moderate' as const,
      description: 'Find the maximum value in each sliding window within an array.',
      topics: ['Sliding Window', 'Deque'],
      xpReward: 250,
      runtime: '-563 ms',
      solvedAgo: '19 min ago',
      bestSolved: '3 times Lied Ons',
      lastSolve: '9 minutes ago',
      companyIcons: ['G', 'A'],
    },
    {
      id: '2',
      title: 'Longest Substring without Repeating Characters',
      difficulty: 'medium' as const,
      description: 'Determine the result times a string without repeating characters.',
      topics: ['Sliding Window', 'Hash-Map', 'String'],
      xpReward: 100,
      runtime: '-45 ms',
      solvedAgo: '5 days ago',
      bestSolved: '3 times days',
      lastSolve: '9 dimutes ago',
    },
    {
      id: '3',
      title: 'Prefix And-a Sp-m',
      difficulty: 'medium' as const,
      description: '',
      topics: ['Google', 'Meta', 'Amazon'],
      xpReward: 100,
      solvedAgo: '5 Days ago',
    },
  ];

  const renderFriendButton = () => {
    if (isOwnProfile) return null;

    switch (friendshipStatus.status) {
      case 'friends':
        return (
          <Button variant="outline" size="sm" disabled className="border-rank-gold text-rank-gold">
            <UserCheck className="h-4 w-4 mr-2" />
            Friends
          </Button>
        );
      case 'pending_sent':
        return (
          <Button variant="outline" size="sm" disabled className="border-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button variant="arena" size="sm" onClick={() => handleRespondToRequest(true)}>
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleRespondToRequest(false)}>
              Decline
            </Button>
          </div>
        );
      default:
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSendFriendRequest}
            className="border-rank-gold text-rank-gold hover:bg-rank-gold/10"
          >
            FRIEND ▼
          </Button>
        );
    }
  };

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: 'linear-gradient(180deg, hsl(222 47% 6%) 0%, hsl(222 47% 4%) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="arena-card overflow-hidden relative">
              {/* Background effects */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(ellipse at 20% 50%, hsla(45, 90%, 55%, 0.15) 0%, transparent 50%)',
                }}
              />
              
              <div className="relative flex">
                {/* Avatar Section */}
                <div className="relative w-56 h-64 flex-shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary to-card" />
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.username}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="h-24 w-24 border-4 border-rank-gold">
                        <AvatarFallback className="bg-card text-3xl font-display font-bold text-foreground">
                          {profile.username?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  {/* Gold glow */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-16"
                    style={{
                      background: 'radial-gradient(ellipse at center bottom, hsla(45, 90%, 55%, 0.4) 0%, transparent 70%)',
                    }}
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-3xl font-bold text-foreground tracking-wide">
                      {profile.username}
                    </h1>
                    <Badge className="bg-primary/20 text-primary border-primary/30 font-display text-xs px-2">
                      LV {level}
                    </Badge>
                    <Badge className="bg-rank-gold/20 text-rank-gold border-rank-gold/30">
                      <Crown className="h-3 w-3" />
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.college_name || 'IIT Delhi'}</span>
                    <span className="text-muted-foreground/50">- 1 ★</span>
                  </div>

                  <Badge className="bg-rank-gold text-black font-display uppercase text-xs px-3 py-1">
                    {division} 1 <Crown className="h-3 w-3 ml-1 inline" />
                  </Badge>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-6 absolute top-6 right-6">
                    <div className="text-right">
                      <span className="font-display font-bold text-foreground">1,056</span>
                      <span className="text-muted-foreground text-sm"> Following</span>
                      <span className="mx-2 text-muted-foreground">.</span>
                      <span className="font-display font-bold text-foreground">974</span>
                      <span className="text-muted-foreground text-sm"> Followers</span>
                    </div>
                    <div className="flex gap-2">
                      {isOwnProfile && (
                        <Button variant="outline" className="border-muted-foreground/30">
                          EDIT PROFILE
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="border border-muted-foreground/30">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 border-t border-border">
                <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Achievements Row */}
                <AchievementsRow isChampion={profile.battles_won >= 10} />

                {/* Interview Readiness + Champion Badge Row */}
                <div className="grid grid-cols-2 gap-6">
                  <InterviewReadinessGauge 
                    score={readinessScore || 90} 
                    label={readinessLabel || 'Excellent'} 
                  />
                  <ChampionBadgeRow />
                </div>

                {/* Community Stats + Skills */}
                <div className="grid grid-cols-2 gap-6">
                  <CommunityStatsCard />
                  <SkillsCard />
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground mb-1">
                    Training Statistics for Real Interviews
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Speed, accuracy, hints per AC, revision debt, and mistake signatures.
                  </p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Performance Breakdown */}
                  <div className="arena-card p-6">
                    <h3 className="font-display font-bold text-lg text-foreground mb-4">Performance Breakdown</h3>
                    <PerformanceBreakdownCard 
                      problemsSolved={profileStats?.solveBreakdown || { easy: 145, medium: 317, hard: 62, extreme: 62 }}
                    />
                  </div>

                  {/* Radar Chart */}
                  <div className="arena-card p-6">
                    <StatisticsRadarChart 
                      attributes={profileStats?.trainingAttributes || {
                        attack: 89,
                        defense: 89,
                        vision: 85,
                        stamina: 80,
                        adaptability: 77,
                        clutch: 86,
                      }}
                    />
                  </div>

                  {/* Performance Metrics */}
                  <PerformanceMetricsCard />
                </div>

                {/* Efficiency + Weaknesses Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="arena-card p-6">
                    <EfficiencyCard />
                  </div>
                  <div className="arena-card p-6">
                    <WeaknessesCard />
                  </div>
                </div>

                {/* Review Performance */}
                <ReviewPerformanceCard />

                {/* Sub Tabs */}
                <ProfileSubTabs activeTab={activeSubTab} onTabChange={setActiveSubTab} />
              </div>
            )}

            {activeTab === 'solved' && (
              <div className="space-y-4">
                <SolvedProblemsHeader 
                  totalSolved={profileStats?.totalProblems || 524}
                  easyCount={profileStats?.solveBreakdown?.easy || 145}
                  mediumCount={profileStats?.solveBreakdown?.medium || 317}
                  hardCount={profileStats?.solveBreakdown?.hard || 62}
                />
                
                {sampleProblems.map((problem) => (
                  <SolvedProblemCard key={problem.id} problem={problem} />
                ))}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="arena-card p-8 text-center">
                <p className="text-muted-foreground">Achievements coming soon...</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Followers Card */}
            <div className="arena-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="font-display font-bold text-xl text-foreground">1056</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-xl text-foreground">974</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <Badge className="bg-primary text-primary-foreground text-xs font-display">
                  Pro
                </Badge>
              </div>
              
              <div className="flex gap-2">
                {renderFriendButton()}
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                  ↓ Retren
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="arena-card p-4">
              <h3 className="font-display text-sm font-bold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { title: 'Custom Sort String', time: '6 min ago', lang: 'C++', runtime: '82 ms' },
                  { title: 'Binary Tree Maximum Path Sum', time: 'Yesterday', lang: 'C++', runtime: '57 ms' },
                  { title: 'Majority Element II', time: 'Yesterday', lang: 'C++', runtime: '24 ms' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white font-bold">Q</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground font-medium truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{item.time}</span>
                        <span>{item.lang}</span>
                        <span>{item.runtime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditional sidebar content based on tab */}
            {activeTab === 'statistics' && (
              <RevisionDisciplineCard />
            )}

            {activeTab === 'solved' && (
              <>
                <PatternsPracticedCard />
                <MostFocusedCompanyCard />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PremiumProfile;
