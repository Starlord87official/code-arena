import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, Shield, FileText, Calendar, Clock, Users,
  Target, Zap, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getGoalLabel, getPaceLabel } from '@/lib/partnerData';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTrainingCardByUserId } from '@/hooks/usePartnerData';

const PartnerContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the contract
  const { data: contract, isLoading: contractLoading } = useQuery({
    queryKey: ['lockin-contract', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('lockin_contracts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

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

  const { data: partnerCard } = useTrainingCardByUserId(partnerId);

  if (contractLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Contract not found</h2>
          <Button asChild><Link to="/partner">Back to Partner</Link></Button>
        </div>
      </div>
    );
  }

  const myUsername = profile?.username ?? 'You';
  const partnerUsername = partnerProfile?.username ?? 'Partner';

  const handleAccept = async () => {
    if (!accepted) {
      toast.error('Please accept the contract terms first');
      return;
    }
    setIsSubmitting(true);
    try {
      const isPartnerA = contract.partner_a_id === user?.id;
      const { error } = await supabase
        .from('lockin_contracts')
        .update({
          [isPartnerA ? 'accepted_by_a' : 'accepted_by_b']: true,
          ...(contract.accepted_by_a || contract.accepted_by_b ? {
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          } : {}),
        })
        .eq('id', contract.id);
      if (error) throw error;
      toast.success('Lock-In Contract Started!', { description: "7 days. No excuses. Let's go!" });
      navigate(`/partner/duo/${contract.id}`);
    } catch (err: any) {
      toast.error('Failed to accept contract', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractRules = [
    { icon: Target, title: 'Daily Missions', description: '1 new problem + 1 revision each day, or your agreed daily target.' },
    { icon: Calendar, title: 'Weekly Trial', description: 'Complete a timed selection trial at the end of each week.' },
    { icon: Shield, title: 'Discipline Tracking', description: 'Your discipline score updates based on task completion.' },
    { icon: AlertCircle, title: 'Soft Consequences', description: 'Missed tasks create "Discipline Debt." Recovery mode available.' }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        </motion.div>

        {/* Contract Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-4"><FileText className="w-8 h-8 text-primary" /></div>
              <CardTitle className="text-2xl">7-Day Lock-In Contract</CardTitle>
              <CardDescription>A binding commitment between training partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8 py-6">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-primary"><AvatarFallback className="bg-primary/10 text-primary text-lg">{myUsername.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="font-medium">{myUsername}</div>
                  <Badge variant="outline" className="mt-1 text-xs">You</Badge>
                </div>
                <div className="flex flex-col items-center gap-1"><Zap className="w-6 h-6 text-primary" /><span className="text-xs text-muted-foreground">LOCK-IN</span></div>
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-accent"><AvatarFallback className="bg-accent/10 text-accent-foreground text-lg">{partnerUsername.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="font-medium">{partnerUsername}</div>
                  <Badge variant="outline" className="mt-1 text-xs">Partner</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                <div className="text-center"><div className="text-sm text-muted-foreground">Duration</div><div className="font-semibold">7 Days</div></div>
                <div className="text-center"><div className="text-sm text-muted-foreground">Daily Target</div><div className="font-semibold">{contract.daily_target} Problems</div></div>
                <div className="text-center"><div className="text-sm text-muted-foreground">Goal</div><div className="font-semibold">{getGoalLabel(partnerCard?.goal as any ?? 'big_tech')}</div></div>
                <div className="text-center"><div className="text-sm text-muted-foreground">Pace</div><div className="font-semibold">{getPaceLabel(partnerCard?.pace as any ?? 'steady')}</div></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contract Rules */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Contract Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {contractRules.map((rule, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><rule.icon className="w-5 h-5 text-primary" /></div>
                  <div><div className="font-medium">{rule.title}</div><p className="text-sm text-muted-foreground">{rule.description}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Anti-Ghosting Notice */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mb-6 bg-amber-500/5 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-500">Anti-Ghosting Protection</div>
                  <p className="text-sm text-muted-foreground mt-1">Miss 2 days → Nudge banner. Miss 3 days → Recovery Mode. Miss 5 days → Auto-rematch offer. Both partners are protected.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accept Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <Checkbox checked={accepted} onCheckedChange={(checked) => setAccepted(!!checked)} className="mt-0.5" />
                <div>
                  <div className="font-medium">I accept the Lock-In Contract</div>
                  <p className="text-sm text-muted-foreground mt-1">I commit to completing daily missions, attending weekly trials, and maintaining discipline throughout the 7-day period.</p>
                </div>
              </label>
              <Button onClick={handleAccept} disabled={!accepted || isSubmitting} className="w-full shadow-neon" size="lg">
                {isSubmitting ? 'Starting Contract...' : <><CheckCircle2 className="w-5 h-5 mr-2" />Start Lock-In Contract</>}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">Both partners must accept to start the contract.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerContract;
