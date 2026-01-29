import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Shield, 
  FileText,
  Calendar,
  Clock,
  Users,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  mockActiveContract, 
  mockCurrentUser,
  mockPartnerProfiles,
  getGoalLabel,
  getPaceLabel
} from '@/lib/partnerData';

const PartnerContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use mock contract for demo
  const contract = mockActiveContract;
  const partner = contract.partnerB;

  const handleAccept = async () => {
    if (!accepted) {
      toast.error('Please accept the contract terms first');
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    toast.success('Lock-In Contract Started!', {
      description: '7 days. No excuses. Let\'s go!'
    });
    navigate(`/partner/duo/${contract.id}`);
  };

  const contractRules = [
    {
      icon: Target,
      title: 'Daily Missions',
      description: '1 new problem + 1 revision each day, or your agreed daily target.'
    },
    {
      icon: Calendar,
      title: 'Weekly Trial',
      description: 'Complete a timed selection trial at the end of each week.'
    },
    {
      icon: Shield,
      title: 'Discipline Tracking',
      description: 'Your discipline score updates based on task completion.'
    },
    {
      icon: AlertCircle,
      title: 'Soft Consequences',
      description: 'Missed tasks create "Discipline Debt." Recovery mode available.'
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        {/* Contract Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">7-Day Lock-In Contract</CardTitle>
              <CardDescription>
                A binding commitment between training partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Partners */}
              <div className="flex items-center justify-center gap-8 py-6">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-primary">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {mockCurrentUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{mockCurrentUser.username}</div>
                  <Badge variant="outline" className="mt-1 text-xs">You</Badge>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Zap className="w-6 h-6 text-primary" />
                  <span className="text-xs text-muted-foreground">LOCK-IN</span>
                </div>
                
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-accent">
                    <AvatarFallback className="bg-accent/10 text-accent-foreground text-lg">
                      {partner.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{partner.username}</div>
                  <Badge variant="outline" className="mt-1 text-xs">Partner</Badge>
                </div>
              </div>

              {/* Contract Details */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold">7 Days</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Daily Target</div>
                  <div className="font-semibold">2 Problems</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Goal</div>
                  <div className="font-semibold">{getGoalLabel(partner.trainingCard?.goal || 'big_tech')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Pace</div>
                  <div className="font-semibold">{getPaceLabel(partner.trainingCard?.pace || 'steady')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contract Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Contract Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contractRules.map((rule, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <rule.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{rule.title}</div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Anti-Ghosting Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6 bg-amber-500/5 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-500">Anti-Ghosting Protection</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Miss 2 days → Nudge banner. Miss 3 days → Recovery Mode.
                    Miss 5 days → Auto-rematch offer. Both partners are protected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accept Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(!!checked)}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium">I accept the Lock-In Contract</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    I commit to completing daily missions, attending weekly trials, 
                    and maintaining discipline throughout the 7-day period.
                  </p>
                </div>
              </label>

              <Button 
                onClick={handleAccept}
                disabled={!accepted || isSubmitting}
                className="w-full shadow-neon"
                size="lg"
              >
                {isSubmitting ? (
                  'Starting Contract...'
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Start Lock-In Contract
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Both partners must accept to start the contract.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerContract;
