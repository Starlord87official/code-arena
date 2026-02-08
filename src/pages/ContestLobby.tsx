import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Shield, Maximize, Wifi, Code2, CheckCircle2,
  AlertTriangle, ChevronLeft, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContest } from '@/hooks/useContests';
import { getSeedContests } from '@/lib/contestSeedData';
import { cn } from '@/lib/utils';

export default function ContestLobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: dbContest } = useContest(id);
  const contest = dbContest || getSeedContests().find(c => c.id === id);
  const [language, setLanguage] = useState('cpp');
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [canEnter, setCanEnter] = useState(false);

  useEffect(() => {
    if (!contest) return;
    const calc = () => {
      const diff = new Date(contest.start_time).getTime() - Date.now();
      if (diff <= 0) {
        setCanEnter(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
      } else {
        setCanEnter(false);
        setTimeLeft({
          minutes: Math.floor(diff / 1000 / 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [contest]);

  if (!contest) {
    return (
      <div className="container mx-auto px-4 max-w-3xl py-8 text-center">
        <p className="text-muted-foreground">Contest not found.</p>
      </div>
    );
  }

  const checks = [
    { label: 'Fullscreen Recommended', icon: Maximize, ok: true },
    { label: 'Stable Network', icon: Wifi, ok: true },
    { label: 'Language Selected', icon: Code2, ok: !!language },
  ];

  return (
    <div className="container mx-auto px-4 max-w-3xl py-6 space-y-6">
      <Link to={`/contests/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Details
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <Badge className="bg-primary/20 text-primary border-primary/30">Contest Lobby</Badge>
          <h1 className="text-2xl font-display font-bold">{contest.title}</h1>
          <p className="text-sm text-muted-foreground">{contest.format.toUpperCase()} · {contest.mode} · {contest.duration_minutes} min</p>
        </div>

        {/* Countdown */}
        <Card className={cn(
          "bg-card/80 border-border/50 text-center",
          canEnter && "border-status-success/40 shadow-[0_0_30px_hsla(142,76%,45%,0.15)]"
        )}>
          <CardContent className="py-8">
            {canEnter ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-status-success mx-auto mb-3" />
                <p className="font-display text-xl font-bold text-status-success">Contest is LIVE</p>
                <p className="text-sm text-muted-foreground mt-1">You may enter the arena now.</p>
              </>
            ) : (
              <>
                <Clock className="h-10 w-10 text-primary mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-muted-foreground mb-2">Contest starts in</p>
                <p className="font-display text-4xl font-bold text-primary">
                  {timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* System Checklist */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Pre-Contest Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                <c.icon className={cn("h-4 w-4", c.ok ? "text-status-success" : "text-status-warning")} />
                <span className="text-sm flex-1">{c.label}</span>
                {c.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-status-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-status-warning" />
                )}
              </div>
            ))}

            {/* Language Selection */}
            <div className="pt-2">
              <label className="text-xs text-muted-foreground mb-1.5 block">Preferred Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpp">C++ (17)</SelectItem>
                  <SelectItem value="java">Java (17)</SelectItem>
                  <SelectItem value="python">Python (3.11)</SelectItem>
                  <SelectItem value="javascript">JavaScript (Node 18)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            disabled={!canEnter}
            className={cn(
              "gap-2 px-8",
              canEnter && "bg-status-success hover:bg-status-success/90 text-primary-foreground"
            )}
            onClick={() => navigate(`/contests/${id}/arena`)}
          >
            <Play className="h-4 w-4" />
            Enter Arena
          </Button>
          <Link to={`/contests/${id}`}>
            <Button variant="outline">Withdraw</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
