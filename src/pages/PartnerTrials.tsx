import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  Trophy,
  Play,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { mockTrial, getTrialFormatLabel } from '@/lib/partnerData';
import type { TrialFormat } from '@/lib/partnerData';

const PartnerTrials = () => {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState<TrialFormat>('trial_a');
  const [trialState, setTrialState] = useState<'select' | 'ready' | 'active' | 'completed'>('select');
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds

  const trialFormats = [
    {
      id: 'trial_a' as TrialFormat,
      title: 'Trial A',
      description: '2 Medium problems in 60 minutes',
      duration: 60,
      problems: 2,
      recommended: true
    },
    {
      id: 'trial_b' as TrialFormat,
      title: 'Trial B',
      description: '1 Medium + 1 OA-style in 75 minutes',
      duration: 75,
      problems: 2,
      recommended: false
    },
    {
      id: 'trial_c' as TrialFormat,
      title: 'Trial C',
      description: '3 problems from your weak topic',
      duration: 90,
      problems: 3,
      recommended: false
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTrial = () => {
    setTrialState('ready');
  };

  const handleBeginTrial = () => {
    setTrialState('active');
    toast.success('Trial Started!', {
      description: 'Good luck! Focus and solve.'
    });
    
    // Start countdown (in real app, this would be more sophisticated)
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTrialState('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEndTrial = () => {
    setTrialState('completed');
    toast.success('Trial Completed!', {
      description: 'Your results are being processed.'
    });
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
            onClick={() => navigate('/partner')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Weekly Selection Trial</h1>
              <p className="text-muted-foreground">Test your progress under pressure</p>
            </div>
          </div>
        </motion.div>

        {/* Format Selection */}
        {trialState === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Choose Trial Format
                </CardTitle>
                <CardDescription>
                  Select the format that best fits your training focus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedFormat}
                  onValueChange={(v) => setSelectedFormat(v as TrialFormat)}
                  className="space-y-3"
                >
                  {trialFormats.map((format) => (
                    <label
                      key={format.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedFormat === format.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={format.id} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{format.title}</span>
                            {format.recommended && (
                              <Badge className="bg-primary/20 text-primary border-0 text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{format.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {format.duration} min
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format.problems} problems
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                <Button 
                  onClick={handleStartTrial}
                  className="w-full mt-6 shadow-neon"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Prepare Trial
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Ready State */}
        {trialState === 'ready' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Timer className="w-10 h-10 text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Ready to Begin?</h2>
                <p className="text-muted-foreground mb-6">
                  You selected: <span className="font-medium text-foreground">{getTrialFormatLabel(selectedFormat)}</span>
                </p>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Important</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Once you start, the timer cannot be paused. Make sure you have 
                    a stable internet connection and a distraction-free environment.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setTrialState('select')}
                  >
                    Change Format
                  </Button>
                  <Button 
                    onClick={handleBeginTrial}
                    className="shadow-neon px-8"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Trial */}
        {trialState === 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Timer Bar */}
            <Card className="mb-6 bg-card/50 backdrop-blur border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-medium">Trial in Progress</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-primary">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problems */}
            <div className="space-y-4 mb-6">
              {mockTrial.problems.map((problem, index) => (
                <Card key={problem.id} className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Problem {index + 1}
                          </Badge>
                          <Badge 
                            className={`text-xs ${
                              problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-500' :
                              problem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-red-500/20 text-red-500'
                            } border-0`}
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{problem.title}</h3>
                        <p className="text-sm text-muted-foreground">Topic: {problem.topic}</p>
                      </div>
                      <Button asChild>
                        <Link to={`/solve/${problem.id}`}>
                          Solve
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleEndTrial}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
              size="lg"
            >
              <Lock className="w-5 h-5 mr-2" />
              Submit Trial Early
            </Button>
          </motion.div>
        )}

        {/* Completed State */}
        {trialState === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Trial Completed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your results are being processed. Check the report for detailed analysis.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 max-w-xs mx-auto">
                  <div className="p-4 rounded-lg bg-secondary/50 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {mockTrial.problems.filter(p => p.solved).length}/{mockTrial.problems.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Problems Solved</div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 text-center">
                    <div className="text-2xl font-bold text-emerald-500">
                      Qualified
                    </div>
                    <div className="text-xs text-muted-foreground">Status</div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button asChild variant="outline">
                    <Link to="/partner/duo/contract-active">
                      Back to Dashboard
                    </Link>
                  </Button>
                  <Button asChild className="shadow-neon">
                    <Link to="/partner/report/trial-1">
                      View Full Report
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PartnerTrials;
