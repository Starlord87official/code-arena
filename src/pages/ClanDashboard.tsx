import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield, Users, TrendingUp, Target, Swords,
  Trophy, Activity, Settings, ChevronLeft, Loader2,
  Clock, BarChart3, Crown, UserMinus, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import {
  useClanById, useClanMembers, useClanWars, useClanQuests,
  useClanActivity, useMyMembership, useApplyToClan,
  useMyApplication, useLeaveClanV2,
} from '@/hooks/useClans';
import { BattleHistoryList } from '@/components/clan/BattleHistoryList';
import { ClanRankBadge } from '@/components/clans/ClanRankBadge';

import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ClanDashboard() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: clan, isLoading: clanLoading } = useClanById(id);
  const { data: members } = useClanMembers(id);
  const { data: wars } = useClanWars(id);
  const { data: quests } = useClanQuests(id);
  const { data: activity } = useClanActivity(id);
  const { data: membership } = useMyMembership(user?.id);
  const { data: myApp } = useMyApplication(id, user?.id);
  const applyToClan = useApplyToClan();
  const leaveClan = useLeaveClanV2();

  // Fallback to seed data for demo
  const seedClan = SEED_CLANS.find((c) => c.id === id);
  const displayClan = clan || seedClan;
  const isMember = membership?.clan_id === id;
  const myRole = isMember ? membership?.role : null;
  const isLeaderOrCo = myRole === 'leader' || myRole === 'co_leader';
  const hasPendingApp = !!myApp;
  const alreadyInOtherClan = membership && membership.clan_id !== id;

  if (clanLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!displayClan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center arena-card p-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold mb-2">Clan Not Found</h2>
          <p className="text-muted-foreground mb-4">This clan doesn't exist.</p>
          <Link to="/clans"><Button variant="outline">Back to Clans</Button></Link>
        </div>
      </div>
    );
  }

  const memberCount = members?.length ?? (displayClan as any).member_count ?? 0;

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-8 relative">
          <Link to="/clans" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ChevronLeft className="h-4 w-4" /> All Clans
          </Link>

          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Badge / Monogram */}
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center font-display text-2xl font-bold text-primary shrink-0">
                {displayClan.tag.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="font-display text-3xl font-bold">{displayClan.name}</h1>
                  <Badge variant="outline" className="font-mono text-xs">[{displayClan.tag}]</Badge>
                  <ClanRankBadge tier={displayClan.rank_tier} size="md" />
                </div>
                {displayClan.motto && (
                  <p className="text-sm text-muted-foreground italic mb-2">"{displayClan.motto}"</p>
                )}
                <p className="text-muted-foreground">{displayClan.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-heading font-bold">{memberCount}</span>
                    <span className="text-muted-foreground text-sm">/ {displayClan.max_members}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-heading font-bold text-primary">{displayClan.weekly_xp.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">Weekly XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[hsl(var(--rank-gold))]" />
                    <span className="font-heading font-bold">{displayClan.total_xp.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">Total XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Lv. {displayClan.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 shrink-0">
              {isMember ? (
                <>
                  {myRole === 'leader' && (
                    <Badge className="bg-[hsl(var(--rank-gold))]/20 text-[hsl(var(--rank-gold))] border-[hsl(var(--rank-gold))]/30">
                      <Crown className="h-3 w-3 mr-1" /> Leader
                    </Badge>
                  )}
                  {myRole === 'co_leader' && (
                    <Badge className="bg-primary/20 text-primary border-primary/30">Co-Leader</Badge>
                  )}
                  {myRole !== 'leader' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => leaveClan.mutate()}
                      disabled={leaveClan.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Leave
                    </Button>
                  )}
                </>
              ) : hasPendingApp ? (
                <Badge variant="outline" className="text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30">
                  <Clock className="h-3 w-3 mr-1" /> Application Pending
                </Badge>
              ) : alreadyInOtherClan ? (
                <Badge variant="outline" className="text-muted-foreground">Already in a clan</Badge>
              ) : displayClan.privacy === 'public' ? (
                <Button
                  onClick={() => id && applyToClan.mutate(id)}
                  disabled={applyToClan.isPending}
                >
                  {applyToClan.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Apply to Join
                </Button>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">Invite Only</Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="overview" className="gap-1.5"><Target className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5"><Users className="h-4 w-4" /> Members</TabsTrigger>
            <TabsTrigger value="wars" className="gap-1.5"><Swords className="h-4 w-4" /> Wars</TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5"><Activity className="h-4 w-4" /> Activity</TabsTrigger>
            {isLeaderOrCo && (
              <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
            )}
          </TabsList>

          {/* ===== OVERVIEW ===== */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Weekly XP', value: displayClan.weekly_xp.toLocaleString(), icon: TrendingUp, color: 'text-primary' },
                { label: 'Total XP', value: displayClan.total_xp.toLocaleString(), icon: Trophy, color: 'text-[hsl(var(--rank-gold))]' },
                { label: 'Members', value: `${memberCount}/${displayClan.max_members}`, icon: Users, color: 'text-muted-foreground' },
                { label: 'Clan Level', value: displayClan.level.toString(), icon: BarChart3, color: 'text-primary' },
              ].map((stat) => (
                <div key={stat.label} className="arena-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quests */}
            <div className="arena-card p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Weekly Quests
              </h3>
              {quests && quests.length > 0 ? (
                <div className="space-y-4">
                  {quests.map((q) => (
                    <div key={q.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-heading">{q.quest_type}</span>
                          <span className="text-xs text-muted-foreground">
                            {q.progress}/{q.target} · +{q.reward_xp} XP
                          </span>
                        </div>
                        <Progress value={(q.progress / q.target) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No quests this week yet.</p>
              )}
            </div>
          </TabsContent>

          {/* ===== MEMBERS ===== */}
          <TabsContent value="members">
            <div className="arena-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-heading font-bold">Clan Members ({memberCount})</h3>
              </div>
              {members && members.length > 0 ? (
                <div className="divide-y divide-border">
                  {members.map((m) => (
                    <div key={m.id} className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-display font-bold text-sm">
                        {(m.user_id || '').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold truncate">
                            {m.username || `User ${m.user_id.slice(0, 8)}`}
                          </span>
                          {m.role === 'leader' && (
                            <Badge className="bg-[hsl(var(--rank-gold))]/20 text-[hsl(var(--rank-gold))] border-0 text-[10px]">
                              <Crown className="h-2.5 w-2.5 mr-0.5" /> Leader
                            </Badge>
                          )}
                          {m.role === 'co_leader' && (
                            <Badge className="bg-primary/20 text-primary border-0 text-[10px]">Co-Leader</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {m.weekly_xp.toLocaleString()} XP this week · Last active {formatDistanceToNow(new Date(m.last_active_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-heading font-bold text-sm">{m.total_xp.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Total XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No member data available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== WARS ===== */}
          <TabsContent value="wars">
            <div className="space-y-4">
              {/* Current war */}
              {wars && wars.filter(w => w.result === 'pending').length > 0 ? (
                <div className="arena-card p-6 neon-border">
                  <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <Swords className="h-5 w-5 text-primary" /> Active War
                  </h3>
                  {wars.filter(w => w.result === 'pending').map((w) => {
                    const isA = w.clan_a === id;
                    return (
                      <div key={w.id} className="flex items-center justify-between gap-4">
                        <div className="text-center flex-1">
                          <p className="font-display font-bold text-xl">{isA ? 'Your Clan' : 'Opponent'}</p>
                          <p className="font-display text-3xl font-bold text-primary">{isA ? w.score_a : w.score_b}</p>
                        </div>
                        <div className="text-muted-foreground font-display text-xl">VS</div>
                        <div className="text-center flex-1">
                          <p className="font-display font-bold text-xl">{isA ? 'Opponent' : 'Your Clan'}</p>
                          <p className="font-display text-3xl font-bold">{isA ? w.score_b : w.score_a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="arena-card p-8 text-center">
                  <Swords className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="font-heading font-semibold">No Active War</p>
                  <p className="text-sm text-muted-foreground">Join this week's war window when it opens.</p>
                </div>
              )}

              {/* Battle History (unified data source) */}
              {id && <BattleHistoryList clanId={id} />}

              {/* Link to full Battle History */}
              <div className="text-center pt-2">
                <Link to="/battle/history">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Swords className="h-4 w-4" />
                    View Full Battle History
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          {/* ===== ACTIVITY ===== */}
          <TabsContent value="activity">
            <div className="arena-card p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Clan Activity
              </h3>
              {activity && activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.map((item) => {
                    const iconMap: Record<string, string> = {
                      challenge_solved: '⚡',
                      oa_completed: '📋',
                      war_won: '⚔️',
                      quest_completed: '🎯',
                      member_joined: '👋',
                      member_left: '👋',
                      clan_created: '🏰',
                      leadership_transferred: '👑',
                    };
                    return (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                        <span className="text-lg">{iconMap[item.type] || '📝'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{item.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">No activity yet. Start solving to contribute!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== SETTINGS ===== */}
          {isLeaderOrCo && (
            <TabsContent value="settings">
              <div className="arena-card p-6 space-y-6">
                <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> Clan Settings
                </h3>
                <p className="text-muted-foreground text-sm">
                  Settings management coming soon. You'll be able to edit description, privacy, manage applications, and transfer leadership.
                </p>
                {myRole === 'leader' && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-destructive font-heading font-semibold mb-2">Danger Zone</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Transfer leadership to another member before leaving. If you're the only member, leaving will disband the clan.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => leaveClan.mutate()}
                      disabled={leaveClan.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {leaveClan.isPending ? 'Leaving...' : 'Leave & Disband'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </section>
    </div>
  );
}
