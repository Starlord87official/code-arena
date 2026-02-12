import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, Clock, Target, Trophy, AlertTriangle,
  CheckCircle2, TrendingUp, Calendar, BookOpen, Zap, ArrowRight
} from 'lucide-react';
import { getTrialFormatLabel } from '@/lib/partnerData';
import { useTrialReport } from '@/hooks/usePartnerData';

const PartnerReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: report, isLoading } = useTrialReport(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Report not found</h2>
          <p className="text-muted-foreground mb-6">No trial report is available for this trial yet.</p>
          <Button asChild><Link to="/partner">Back to Partner</Link></Button>
        </div>
      </div>
    );
  }

  const timeLostBreakdown = (report.time_lost_breakdown as any[] ?? []);
  const wrongAttemptPatterns = (report.wrong_attempt_patterns as any[] ?? []);
  const revisionPlan = (report.revision_plan as any ?? { day3: [], day7: [], day21: [] });
  const nextWeekPlan = (report.next_week_plan as any ?? { focus: 'N/A', dailyTarget: 2, trialFormat: 'trial_a' });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-primary" /></div>
              <div><h1 className="text-2xl font-bold">Training Report</h1><p className="text-muted-foreground">Generated {formatDate(report.generated_at)}</p></div>
            </div>
            {report.qualified ? (
              <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-sm px-4 py-1"><CheckCircle2 className="w-4 h-4 mr-1" />Qualified</Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-500 border-0 text-sm px-4 py-1"><AlertTriangle className="w-4 h-4 mr-1" />Needs Improvement</Badge>
            )}
          </div>
        </motion.div>

        {/* Result Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`mb-6 ${report.qualified ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/30'}`}>
            <CardContent className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${report.qualified ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                {report.qualified ? <Trophy className="w-8 h-8 text-emerald-500" /> : <Target className="w-8 h-8 text-amber-500" />}
              </div>
              <h2 className="text-xl font-bold mb-1">Selection Result: {report.qualified ? 'Qualified' : 'Not Qualified'}</h2>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Lost Breakdown */}
        {timeLostBreakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Time Lost Breakdown</CardTitle>
                <CardDescription>Where you spent extra time during the trial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {timeLostBreakdown.map((item: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">{item.minutes} min ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Wrong Attempt Patterns */}
        {wrongAttemptPatterns.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Wrong Attempt Patterns</CardTitle>
                <CardDescription>Recurring mistakes to focus on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {wrongAttemptPatterns.map((pattern: any, index: number) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{pattern.pattern}</span>
                      <Badge variant="outline" className="text-xs">{pattern.frequency}x</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(pattern.examples ?? []).map((example: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{example}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Revision Plan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Spaced Revision Plan</CardTitle>
              <CardDescription>Optimal review schedule for long-term retention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {['day3', 'day7', 'day21'].map((day) => (
                  <div key={day} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-primary" /><span className="font-medium">{day === 'day3' ? 'Day 3' : day === 'day7' ? 'Day 7' : 'Day 21'}</span></div>
                    <ul className="space-y-1">
                      {((revisionPlan as any)[day] ?? []).length === 0 ? (
                        <li className="text-sm text-muted-foreground">No items yet</li>
                      ) : ((revisionPlan as any)[day] ?? []).map((item: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-1">•</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Week Plan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />Next Week Plan</CardTitle>
              <CardDescription>Auto-generated training plan based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div><div className="text-sm text-muted-foreground mb-1">Focus Area</div><div className="font-semibold">{nextWeekPlan.focus}</div></div>
                <div><div className="text-sm text-muted-foreground mb-1">Daily Target</div><div className="font-semibold">{nextWeekPlan.dailyTarget} problems</div></div>
                <div><div className="text-sm text-muted-foreground mb-1">Next Trial</div><div className="font-semibold">{getTrialFormatLabel(nextWeekPlan.trialFormat)}</div></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-4 justify-center">
          <Button asChild variant="outline"><Link to="/partner">Back to Partner</Link></Button>
          <Button asChild className="shadow-neon"><Link to="/challenges">Start Training<ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerReport;
