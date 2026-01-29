import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  mockPartnerProfiles, 
  getGoalLabel, 
  getFocusLabel, 
  getPaceLabel,
  getLanguageLabel,
  getTrialFormatLabel
} from '@/lib/partnerData';
import type { ReliabilityTier } from '@/lib/partnerData';

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
  const [isInviting, setIsInviting] = useState(false);

  const partner = mockPartnerProfiles.find(p => p.id === id);

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Partner not found</h2>
          <Button asChild>
            <Link to="/partner/matches">Back to Matches</Link>
          </Button>
        </div>
      </div>
    );
  }

  const card = partner.trainingCard!;

  const handleInvite = async () => {
    setIsInviting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsInviting(false);
    toast.success('Lock-In Invite Sent!', {
      description: `Waiting for ${partner.username} to accept...`
    });
    navigate('/partner/matches');
  };

  const formatSlots = () => {
    return card.preferredSlots.map(slot => 
      `${slot.day}: ${slot.start} - ${slot.end}`
    ).join(', ');
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
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

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
            
            <CardContent className="relative pt-0">
              {/* Avatar */}
              <div className="absolute -top-12 left-6">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={partner.avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {partner.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="pt-14 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{partner.username}</h1>
                      <Badge className={reliabilityColors[partner.reliabilityTier]}>
                        <Trophy className="w-3 h-3 mr-1" />
                        {partner.reliabilityTier.charAt(0).toUpperCase() + partner.reliabilityTier.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Code className="w-4 h-4" />
                        {card.currentLevel.solvedCount} solved
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Rating: {card.currentLevel.internalRating}
                      </span>
                      {card.currentLevel.contestRating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          Contest: {card.currentLevel.contestRating}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleInvite} 
                    disabled={isInviting}
                    className="shadow-neon"
                  >
                    {isInviting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Invite to Lock-In
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-primary">{partner.reliabilityScore}%</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Reliability
            </div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-green-500">{partner.disciplineScore}%</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Discipline
            </div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-blue-500">{partner.chemistryScore}%</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Chemistry
            </div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-amber-500">{partner.clutchScore}%</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" />
              Clutch
            </div>
          </Card>
        </motion.div>

        {/* Training Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Training Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Goals & Focus */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Goal</label>
                  <div className="mt-1 font-medium">{getGoalLabel(card.goal)}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Focus</label>
                  <div className="mt-1 font-medium">{getFocusLabel(card.focus)}</div>
                </div>
              </div>

              {/* Training Style */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Pace</label>
                  <div className="mt-1 font-medium">{getPaceLabel(card.pace)}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Daily Commitment</label>
                  <div className="mt-1 font-medium">{card.dailyCommitment} min/day</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Language</label>
                  <div className="mt-1 font-medium">{getLanguageLabel(card.language)}</div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Preferred Schedule (IST)
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {card.preferredSlots.map((slot, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {slot.day}: {slot.start} - {slot.end}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Accountability */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Communication</label>
                  <div className="mt-1 font-medium capitalize">
                    {card.commStyle.replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Accountability Style</label>
                  <div className="mt-1 font-medium capitalize">{card.accountabilityStyle}</div>
                </div>
              </div>

              {/* No Ghosting Badge */}
              {card.noGhostingRule && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">No-Ghosting Rule Enabled</span>
                  <Badge className="ml-auto bg-green-500/20 text-green-500 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Protected
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Contract History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Training History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {partner.completedContracts}/{partner.totalContracts}
                  </div>
                  <div className="text-sm text-muted-foreground">Contracts Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">{partner.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-500">{partner.bestStreak}</div>
                  <div className="text-sm text-muted-foreground">Best Streak</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {Math.round((partner.completedContracts / Math.max(partner.totalContracts, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>

              {/* Reliability Progress */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Reliability Score</span>
                  <span className="text-sm text-muted-foreground">{partner.reliabilityScore}%</span>
                </div>
                <Progress value={partner.reliabilityScore} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Button 
            size="lg" 
            onClick={handleInvite} 
            disabled={isInviting}
            className="shadow-neon px-10"
          >
            {isInviting ? (
              <>Sending Invite...</>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Invite to 7-Day Lock-In Contract
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Both partners must accept to start the contract.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerProfile;
