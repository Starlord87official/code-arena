import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock, Code2, Play, Send, Trophy, ChevronRight, AlertTriangle,
  CheckCircle2, XCircle, Eye, EyeOff, Megaphone, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContest } from '@/hooks/useContests';
import { SEED_PROBLEMS } from '@/lib/contestSeedData';
import { cn } from '@/lib/utils';

export default function ContestArena() {
  const { id } = useParams();
  const { data: dbContest } = useContest(id);
  const contest = dbContest;
  
  const [activeProblem, setActiveProblem] = useState(0);
  const [code, setCode] = useState('// Write your solution here\n\n');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('problem');
  const [language, setLanguage] = useState('cpp');
  const [timeLeft, setTimeLeft] = useState(0);

  // Integrity tracking
  const [integrity, setIntegrity] = useState({ tabSwitches: 0, fullscreenExits: 0, copyPaste: 0 });
  const integrityRef = useRef(integrity);
  integrityRef.current = integrity;

  // Timer
  useEffect(() => {
    if (!contest) return;
    const calc = () => {
      const diff = new Date(contest.end_time).getTime() - Date.now();
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [contest]);

  // Integrity: tab visibility
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        setIntegrity(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }));
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // Integrity: copy/paste
  useEffect(() => {
    const onCopy = () => setIntegrity(prev => ({ ...prev, copyPaste: prev.copyPaste + 1 }));
    const onPaste = () => setIntegrity(prev => ({ ...prev, copyPaste: prev.copyPaste + 1 }));
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    return () => { document.removeEventListener('copy', onCopy); document.removeEventListener('paste', onPaste); };
  }, []);

  // Autosave every 5s (just visual indicator for MVP)
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  useEffect(() => {
    const t = setInterval(() => setLastSaved(new Date()), 5000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const problem = SEED_PROBLEMS[activeProblem];
  const isUrgent = timeLeft < 300;

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Contest not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/contests" className="text-xs text-muted-foreground hover:text-foreground">← Exit</Link>
          <div className="h-4 w-px bg-border" />
          <span className="font-display text-sm font-bold truncate max-w-[200px]">{contest.title}</span>
          <Badge variant="outline" className="text-[9px] uppercase">{contest.format}</Badge>
        </div>

        <div className={cn(
          "font-display text-lg font-bold tabular-nums",
          isUrgent ? "text-destructive animate-pulse" : "text-primary"
        )}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[10px] text-muted-foreground">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs bg-secondary/50 border border-border rounded px-2 py-1"
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
          <Button size="sm" className="gap-1.5 bg-status-success hover:bg-status-success/90 text-primary-foreground">
            <Send className="h-3.5 w-3.5" /> Submit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem List */}
        <div className="w-14 border-r border-border flex flex-col items-center py-3 gap-2 bg-card/50 flex-shrink-0">
          {SEED_PROBLEMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActiveProblem(i)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-display font-bold transition-all",
                activeProblem === i ? "bg-primary text-primary-foreground shadow-neon" :
                p.status === 'solved' ? "bg-status-success/20 text-status-success border border-status-success/30" :
                p.status === 'attempted' ? "bg-status-warning/20 text-status-warning border border-status-warning/30" :
                "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-border"
              )}
            >
              {p.label}
            </button>
          ))}
          <div className="mt-auto text-[8px] text-muted-foreground text-center px-1">
            <p className="text-status-success">●{SEED_PROBLEMS.filter(p => p.status === 'solved').length}</p>
            <p className="text-status-warning">●{SEED_PROBLEMS.filter(p => p.status === 'attempted').length}</p>
          </div>
        </div>

        {/* Center: Problem/Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 h-10 flex-shrink-0">
              <TabsTrigger value="problem" className="text-xs">Problem</TabsTrigger>
              <TabsTrigger value="submissions" className="text-xs">Submissions</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs">Leaderboard</TabsTrigger>
              <TabsTrigger value="announcements" className="text-xs">Announcements</TabsTrigger>
            </TabsList>

            <TabsContent value="problem" className="flex-1 overflow-auto p-4 mt-0">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-display text-lg font-bold">{problem.label}. {problem.title}</h2>
                  <Badge variant="outline" className={cn(
                    'text-[10px]',
                    problem.difficulty === 'medium' ? 'text-status-warning border-status-warning/30' :
                    problem.difficulty === 'hard' ? 'text-destructive border-destructive/30' :
                    problem.difficulty === 'extreme' ? 'text-neon-purple border-neon-purple/30' :
                    'text-status-success border-status-success/30'
                  )}>
                    {problem.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                    {problem.points} pts
                  </Badge>
                </div>

                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-sm text-muted-foreground">
                    {problem.label === 'A' && 'Given a 2D matrix of integers, find the maximum sum submatrix of size K×K. Output the maximum sum.'}
                    {problem.label === 'B' && 'Given a string of tokens, find the longest subsequence where no two adjacent tokens share a common character.'}
                    {problem.label === 'C' && 'Count the number of distinct paths in a weighted grid from (1,1) to (N,M) where the path sum is exactly K.'}
                    {problem.label === 'D' && 'You have N islands connected by bridges with capacities. Find the maximum flow you can transport while minimizing the number of bridges used.'}
                  </p>

                  <h4 className="text-xs font-heading uppercase tracking-widest text-muted-foreground mt-4 mb-2">Sample Input/Output</h4>
                  <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs">
                    <p className="text-muted-foreground mb-1">Input:</p>
                    <pre className="text-foreground">3 3 2{'\n'}1 2 3{'\n'}4 5 6{'\n'}7 8 9</pre>
                    <p className="text-muted-foreground mt-2 mb-1">Output:</p>
                    <pre className="text-foreground">28</pre>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 overflow-auto p-4 mt-0">
              <div className="text-center py-8">
                <Code2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No submissions yet for this problem.</p>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="flex-1 overflow-auto p-4 mt-0">
              <div className="text-center py-8">
                <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Leaderboard will appear once the contest begins.</p>
              </div>
            </TabsContent>

            <TabsContent value="announcements" className="flex-1 overflow-auto p-4 mt-0">
              <div className="text-center py-8">
                <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Editor */}
        <div className="w-[45%] border-l border-border flex flex-col flex-shrink-0">
          <div className="flex-1 p-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-[hsl(var(--arena-dark))] text-foreground font-mono text-sm p-4 resize-none focus:outline-none"
              spellCheck={false}
              placeholder="Write your solution..."
            />
          </div>
          <div className="border-t border-border p-3 bg-card/50 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Play className="h-3.5 w-3.5" /> Run
              </Button>
              <Button size="sm" className="gap-1.5 text-xs bg-status-success hover:bg-status-success/90 text-primary-foreground">
                <Send className="h-3.5 w-3.5" /> Submit
              </Button>
            </div>
            <div className="bg-secondary/30 rounded p-2 h-20 overflow-auto">
              <p className="text-xs text-muted-foreground font-mono">
                {output || 'Console output will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrity indicator (subtle) */}
      <div className="h-6 border-t border-border flex items-center justify-end px-4 gap-4 text-[10px] text-muted-foreground bg-card/50 flex-shrink-0">
        <span>Tab Switches: {integrity.tabSwitches}</span>
        <span>Fullscreen Exits: {integrity.fullscreenExits}</span>
        <span>Copy/Paste: {integrity.copyPaste}</span>
      </div>
    </div>
  );
}
