import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  Zap, 
  Calendar,
  Shield,
  Trophy,
  Star,
  Code,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getGoalLabel, 
  getFocusLabel, 
  getPaceLabel,
  getLanguageLabel,
  getReliabilityTier,
} from '@/lib/partnerData';
import type { ReliabilityTier } from '@/lib/partnerData';
import { useTrainingCardByUserId, usePartnerStats, useSendPartnerInvite } from '@/hooks/usePartnerData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const reliabilityColors: Record<ReliabilityTier, string> = {
  platinum: 'bg-gradient-to-r from-slate-300 to-slate-100 text-slate-900',
  gold: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-900',
  silver: 'bg-gradient-to-r from-gray-400 to-gray-300 text-gray-900',
  bronze: 'bg-gradient-to-r from-orange-700 to-orange-500 text-white',
  unranked: 'bg-muted text-muted-foreground'
};

const PartnerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: card, isLoading: cardLoading } = useTrainingCardByUserId(id);
  const { data: stats, isLoading: statsLoading } = usePartnerStats(id);
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await supabase.from('public_profiles').select('*').eq('id', id).maybeSingle();
      return data;
    },
    enabled: !!id,
  });
  const sendInvite = useSendPartnerInvite();

  const isLoading = cardLoading || statsLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Skeleton className="h-8 w-20 mb-8" />
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
            <div className="h-24 bg-secondary" />
            <CardContent className="pt-14 pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Partner not found</h2>
          <p className="text-muted-foreground mb-4">This user hasn't created a training card yet.</p>
          <Button asChild>
            <Link to="/partner/matches">Back to Matches</Link>
          </Button>
        </div>
      </div>
    );
  }

  const username = profile?.username ?? 'Unknown';
  const reliabilityScore = stats?.reliability_score ?? 0;
  const reliabilityTier = getReliabilityTier(reliabilityScore);

  const handleInvite = async () => {
    try {
      await sendInvite.mutateAsync(id!);
      toast.success('Lock-In Invite Sent!', {
        description: `Waiting for ${username} to accept...`
      });
      navigate('/partner/matches');
    } catch (err: any) {
      toast.error('Failed to send invite', { description: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
            <CardContent className="relative pt-0">
              <div className="absolute -top-12 left-6">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-14 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{username}</h1>
                      <Badge className={reliabilityColors[reliabilityTier]}>
                        <Trophy className="w-3 h-3 mr-1" />
                        {reliabilityTier.charAt(0).toUpperCase() + reliabilityTier.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1"><Code className="w-4 h-4" />{card.solved_count} solved</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />Rating: {card.internal_rating}</span>
                      {card.contest_rating && (
                        <span className="flex items-center gap-1"><Star className="w-4 h-4" />Contest: {card.contest_rating}</span>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleInvite} disabled={sendInvite.isPending} className="shadow-neon">
                    {sendInvite.isPending ? 'Sending...' : <><Zap className="w-4 h-4 mr-2" />Invite to Lock-In</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-primary">{reliabilityScore}%</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Shield className="w-3 h-3" />Reliability</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-green-500">{stats?.discipline_score ?? 0}%</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Target className="w-3 h-3" />Discipline</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats?.chemistry_score ?? 0}%</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><MessageSquare className="w-3 h-3" />Chemistry</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats?.clutch_score ?? 0}%</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Flame className="w-3 h-3" />Clutch</div>
          </Card>
        </motion.div>

        {/* Training Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" />Training Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Goal</label>
                  <div className="mt-1 font-medium">{getGoalLabel(card.goal as any)}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Focus</label>
                  <div className="mt-1 font-medium">{getFocusLabel(card.focus as any)}</div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Pace</label>
                  <div className="mt-1 font-medium">{getPaceLabel(card.pace as any)}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Daily Commitment</label>
                  <div className="mt-1 font-medium">{card.daily_commitment} min/day</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Language</label>
                  <div className="mt-1 font-medium">{getLanguageLabel(card.language as any)}</div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />Preferred Schedule
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(card.preferred_slots as string[])?.map((slot: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      <Clock className="w-3 h-3 mr-1" />{slot}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Communication</label>
                  <div className="mt-1 font-medium capitalize">{card.comm_style?.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Accountability Style</label>
                  <div className="mt-1 font-medium capitalize">{card.accountability_style}</div>
                </div>
              </div>
              {card.no_ghosting_rule && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">No-Ghosting Rule Enabled</span>
                  <Badge className="ml-auto bg-green-500/20 text-green-500 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />Protected
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Training History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" />Training History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{stats?.completed_contracts ?? 0}/{stats?.total_contracts ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Contracts Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">{stats?.current_streak ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-500">{stats?.best_streak ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Best Streak</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {Math.round(((stats?.completed_contracts ?? 0) / Math.max(stats?.total_contracts ?? 1, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Reliability Score</span>
                  <span className="text-sm text-muted-foreground">{reliabilityScore}%</span>
                </div>
                <Progress value={reliabilityScore} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
          <Button size="lg" onClick={handleInvite} disabled={sendInvite.isPending} className="shadow-neon px-10">
            {sendInvite.isPending ? 'Sending Invite...' : <><Zap className="w-5 h-5 mr-2" />Invite to 7-Day Lock-In Contract</>}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">Both partners must accept to start the contract.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerProfile;
