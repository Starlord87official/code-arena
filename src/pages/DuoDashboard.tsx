import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, Clock, Target, Zap, Calendar, Shield, Trophy, Users,
  MessageSquare, AlertTriangle, CheckCircle2, Flame, Play, RefreshCw, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { getTrialFormatLabel } from '@/lib/partnerData';
import { useActiveContract, useContractMissions, useUpdateMissionStatus, usePartnerStats } from '@/hooks/usePartnerData';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DuoDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: contract, isLoading: contractLoading } = useActiveContract();
  
  const partnerId = contract 
    ? (contract.partner_a_id === user?.id ? contract.partner_b_id : contract.partner_a_id) 
    : undefined;

  const { data: partnerProfile } = useQuery({
    queryKey: ['public-profile', partnerId],
    queryFn: async () => {
      if (!partnerId) return null;
      const { data } = await supabase.from('public_profiles').select('*').eq('id', partnerId).maybeSingle();
      return data;
    },
    enabled: !!partnerId,
  });

  const { data: myStats } = usePartnerStats(user?.id);
  const { data: partnerStats } = usePartnerStats(partnerId);
  const { data: missions = [], isLoading: missionsLoading } = useContractMissions(contract?.id);
  const updateMission = useUpdateMissionStatus();

  const isLoading = contractLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No active contract</h2>
          <p className="text-muted-foreground mb-6">You don't have an active Lock-In contract yet.</p>
          <Button asChild><Link to="/partner/matches">Find a Partner</Link></Button>
        </div>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(contract.end_date ?? Date.now()).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const toggleTask = (missionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateMission.mutate({ missionId, status: newStatus });
    toast.success('Task updated!');
  };

  const myUsername = profile?.username ?? 'You';
  const partnerUsername = partnerProfile?.username ?? 'Partner';

  const formatTrialDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
    }) + ' IST';
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/partner')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <Avatar className="w-12 h-12 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary">{myUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Avatar className="w-12 h-12 border-2 border-background">
                  <AvatarFallback className="bg-accent/10 text-accent-foreground">{partnerUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Duo Dashboard</h1>
                <p className="text-muted-foreground">{myUsername} × {partnerUsername}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm"><Clock className="w-3 h-3 mr-1" />{daysRemaining} days left</Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary"><Flame className="w-5 h-5" />{contract.duo_streak}</div>
            <div className="text-xs text-muted-foreground">Duo Streak</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-emerald-500">{myStats?.discipline_score ?? 0}%</div>
            <div className="text-xs text-muted-foreground">Your Discipline</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-blue-500">{myStats?.chemistry_score ?? 0}%</div>
            <div className="text-xs text-muted-foreground">Chemistry</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-amber-500">{myStats?.clutch_score ?? 0}%</div>
            <div className="text-xs text-muted-foreground">Clutch Score</div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Missions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" />Today's Missions</CardTitle>
                  <CardDescription>Complete your daily tasks to maintain the streak</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {missions.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No missions assigned for today yet.</p>
                    </div>
                  ) : missions.map((task) => (
                    <div key={task.id} className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${task.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border hover:border-primary/30'}`}>
                      <Checkbox checked={task.status === 'completed'} onCheckedChange={() => toggleTask(task.id, task.status)} />
                      <div className="flex-1">
                        <div className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {task.task_type === 'new_problem' ? 'New Problem' : task.task_type === 'revision' ? 'Revision' : 'Trial Prep'}
                        </Badge>
                      </div>
                      {task.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                  ))}
                  {missions.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Daily Progress</span>
                        <span className="font-medium">{missions.filter(t => t.status === 'completed').length} / {missions.length}</span>
                      </div>
                      <Progress value={(missions.filter(t => t.status === 'completed').length / missions.length) * 100} className="h-2 mt-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Gap List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Shared Gap List</CardTitle>
                  <CardDescription>Topics both partners need to strengthen</CardDescription>
                </CardHeader>
                <CardContent>
                  {(contract.gap_list ?? []).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No shared gaps identified yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(contract.gap_list ?? []).map((topic: string, i: number) => (
                        <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm border-amber-500/30 bg-amber-500/5 text-amber-500">{topic}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Trial */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="w-5 h-5 text-primary" />Next Trial</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {contract.next_trial_date ? (
                    <>
                      <div><div className="text-sm text-muted-foreground">Scheduled</div><div className="font-medium">{formatTrialDate(contract.next_trial_date)}</div></div>
                      <div><div className="text-sm text-muted-foreground">Format</div><div className="font-medium">{getTrialFormatLabel(contract.next_trial_format as any ?? 'trial_a')}</div></div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">No trial scheduled yet.</p>
                  )}
                  <Button asChild className="w-full" variant="outline"><Link to="/partner/trials"><Calendar className="w-4 h-4 mr-2" />View Trial Room</Link></Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Partner Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="w-5 h-5 text-primary" />Partner Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback className="bg-accent/10">{partnerUsername.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="flex-1"><div className="font-medium">{partnerUsername}</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="p-2 rounded bg-secondary/50"><div className="font-medium">{partnerStats?.discipline_score ?? 0}%</div><div className="text-xs text-muted-foreground">Discipline</div></div>
                    <div className="p-2 rounded bg-secondary/50"><div className="font-medium">{partnerStats?.current_streak ?? 0}</div><div className="text-xs text-muted-foreground">Streak</div></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Zap className="w-5 h-5 text-primary" />Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline"><Play className="w-4 h-4 mr-2" />Start Sync Solve</Button>
                  <Button className="w-full justify-start" variant="outline"><Calendar className="w-4 h-4 mr-2" />Schedule Trial</Button>
                  <Button className="w-full justify-start" variant="outline"><MessageSquare className="w-4 h-4 mr-2" />Open Chat</Button>
                  <Button className="w-full justify-start text-amber-500 hover:text-amber-400" variant="ghost"><RefreshCw className="w-4 h-4 mr-2" />Enter Recovery Mode</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuoDashboard;
