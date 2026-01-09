import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Play, Send, RotateCcw, ChevronLeft, Clock, Zap, Users, 
  CheckCircle2, XCircle, Settings2, Copy, Maximize2, Terminal,
  AlertTriangle, ChevronsUp, TrendingDown, Trophy, Target,
  Lightbulb, ChevronRight, Crown, ShieldAlert, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { mockChallenges, getDifficultyColor, Challenge } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { MarkForRevisionButton } from '@/components/revision/MarkForRevisionButton';

const starterCode = {
  javascript: `function solve(input) {
  // Your solution here
  // Prove your worth.
  
  return result;
}`,
  python: `def solve(input):
    # Your solution here
    # Prove your worth.
    
    return result`,
  typescript: `function solve(input: any): any {
  // Your solution here
  // Prove your worth.
  
  return result;
}`,
};

export default function Solve() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const challenge = mockChallenges.find(c => c.id === id) || mockChallenges[0];
  
  const [code, setCode] = useState(starterCode.javascript);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'typescript'>('javascript');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean | null; input: string; expected: string }[]>(
    challenge.examples.map(e => ({ passed: null, input: e.input, expected: e.output }))
  );
  const [submissionResult, setSubmissionResult] = useState<'success' | 'failure' | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const timeWarning = timeElapsed > challenge.timeLimit * 60 * 0.8;
  const timeExceeded = timeElapsed > challenge.timeLimit * 60;

  const getDifficultyStyle = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return { color: 'text-status-success', bg: 'bg-status-success/20', border: 'border-status-success/50' };
      case 'medium': return { color: 'text-status-warning', bg: 'bg-status-warning/20', border: 'border-status-warning/50' };
      case 'hard': return { color: 'text-destructive', bg: 'bg-destructive/20', border: 'border-destructive/50' };
      case 'extreme': return { color: 'text-rank-legend', bg: 'bg-rank-legend/20', border: 'border-rank-legend/50' };
    }
  };

  const style = getDifficultyStyle(challenge.difficulty);

  const handleRun = () => {
    setIsRunning(true);
    setOutput('⚡ Executing tests...\n');
    
    setTimeout(() => {
      setOutput('⚡ Executing tests...\n\n▸ Test 1: Running...');
      setTimeout(() => {
        setOutput('⚡ Executing tests...\n\n✓ Test 1: Passed\n▸ Test 2: Running...');
        setTestResults(prev => prev.map((t, i) => i === 0 ? { ...t, passed: true } : t));
        setTimeout(() => {
          setOutput('⚡ Executing tests...\n\n✓ Test 1: Passed\n✓ Test 2: Passed\n▸ Test 3: Running...');
          setTestResults(prev => prev.map((t, i) => i <= 1 ? { ...t, passed: true } : t));
          setTimeout(() => {
            setOutput('⚡ Executing tests...\n\n✓ Test 1: Passed\n✓ Test 2: Passed\n✓ Test 3: Passed\n\n━━━━━━━━━━━━━━━━━━━━\n✓ All sample tests passed!\n\nReady to submit for full evaluation.');
            setTestResults(prev => prev.map(t => ({ ...t, passed: true })));
            setIsRunning(false);
          }, 600);
        }, 500);
      }, 500);
    }, 800);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setOutput('🔥 SUBMITTING SOLUTION...\n\n▸ Running hidden test cases...\n');
    
    setTimeout(() => {
      // Simulate success/failure based on difficulty
      const successChance = challenge.difficulty === 'easy' ? 0.9 : 
                           challenge.difficulty === 'medium' ? 0.7 :
                           challenge.difficulty === 'hard' ? 0.5 : 0.3;
      
      const isSuccess = Math.random() < successChance;
      
      if (isSuccess) {
        setOutput(`🔥 SUBMITTING SOLUTION...\n\n▸ Running hidden test cases...\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Test 1/15: Passed\n✓ Test 2/15: Passed\n✓ Test 3/15: Passed\n✓ Test 4/15: Passed\n✓ Test 5/15: Passed\n✓ Test 6/15: Passed\n✓ Test 7/15: Passed\n✓ Test 8/15: Passed\n✓ Test 9/15: Passed\n✓ Test 10/15: Passed\n✓ Test 11/15: Passed\n✓ Test 12/15: Passed\n✓ Test 13/15: Passed\n✓ Test 14/15: Passed\n✓ Test 15/15: Passed\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🏆 SOLUTION ACCEPTED\n\n+${challenge.xpReward} XP EARNED\n+${challenge.rankImpact.win} RANK POSITIONS\n\nTime: ${formatTime(timeElapsed)}\nYou are now stronger.`);
        setSubmissionResult('success');
        
        toast({
          title: "🏆 VICTORY!",
          description: `+${challenge.xpReward} XP earned. You climbed ${challenge.rankImpact.win} rank positions.`,
        });
      } else {
        const failedTest = Math.floor(Math.random() * 10) + 6;
        setOutput(`🔥 SUBMITTING SOLUTION...\n\n▸ Running hidden test cases...\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Test 1/15: Passed\n✓ Test 2/15: Passed\n✓ Test 3/15: Passed\n✓ Test 4/15: Passed\n✓ Test 5/15: Passed\n✗ Test ${failedTest}/15: FAILED\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n❌ SOLUTION REJECTED\n\nYour solution failed on hidden test case ${failedTest}.\n${challenge.rankImpact.loss > 0 ? `\n⚠️ -${challenge.rankImpact.loss} RANK POSITIONS\n\nYou have fallen. Rise again.` : '\nNo rank penalty for this difficulty.\n\nAnalyze. Adapt. Attack again.'}`);
        setSubmissionResult('failure');
        
        if (challenge.rankImpact.loss > 0) {
          toast({
            title: "❌ DEFEAT",
            description: `Solution rejected. You dropped ${challenge.rankImpact.loss} rank positions.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "❌ Solution Rejected",
            description: "Analyze your approach and try again.",
            variant: "destructive",
          });
        }
      }
      
      setIsSubmitting(false);
    }, 3000);
  };

  const handleReset = () => {
    setCode(starterCode[language]);
    setOutput('');
    setTestResults(challenge.examples.map(e => ({ passed: null, input: e.input, expected: e.output })));
    setSubmissionResult(null);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Bar - Enhanced */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/challenges" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-display font-semibold text-foreground">{challenge.title}</h1>
          <Badge className={`${style.bg} ${style.color} ${style.border} border uppercase text-xs font-bold`}>
            {challenge.difficulty}
          </Badge>
          {challenge.isDaily && (
            <Badge className="bg-status-warning/20 text-status-warning border-status-warning/50">
              🔥 DAILY
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          {/* Time */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded ${
            timeExceeded ? 'bg-destructive/20 text-destructive' :
            timeWarning ? 'bg-status-warning/20 text-status-warning' :
            'text-muted-foreground'
          }`}>
            <Clock className={`h-4 w-4 ${timeExceeded ? 'animate-pulse' : ''}`} />
            <span className="font-mono text-sm font-semibold">{formatTime(timeElapsed)}</span>
            <span className="text-xs text-muted-foreground">/ {challenge.timeLimit}m</span>
          </div>
          
          {/* Stakes */}
          <div className="flex items-center gap-4 border-l border-border pl-4">
            <div className="flex items-center gap-1 text-status-success">
              <ChevronsUp className="h-4 w-4" />
              <span className="text-sm font-semibold">+{challenge.rankImpact.win}</span>
            </div>
            <div className="flex items-center gap-1 text-destructive">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-semibold">-{challenge.rankImpact.loss}</span>
            </div>
          </div>
          
          {/* XP */}
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-bold">+{challenge.xpReward} XP</span>
          </div>

          {/* Mark for Revision */}
          <MarkForRevisionButton
            problemId={challenge.id}
            problemTitle={challenge.title}
            topic={challenge.tags[0]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-[450px] border-r border-border flex flex-col bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
              <TabsTrigger value="description" className="data-[state=active]:bg-primary/20">Description</TabsTrigger>
              <TabsTrigger value="hints" className="data-[state=active]:bg-primary/20">Hints</TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-primary/20">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 overflow-auto p-6 m-0">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {challenge.difficulty === 'extreme' && <Crown className="h-6 w-6 text-rank-legend" />}
                    {challenge.difficulty === 'hard' && <ShieldAlert className="h-6 w-6 text-destructive" />}
                    {challenge.difficulty === 'medium' && <Target className="h-6 w-6 text-status-warning" />}
                    {challenge.difficulty === 'easy' && <Trophy className="h-6 w-6 text-status-success" />}
                    <h2 className="font-display text-2xl font-bold text-foreground">{challenge.title}</h2>
                  </div>
                  
                  {/* Difficulty Warning */}
                  {challenge.difficulty === 'extreme' && (
                    <div className="flex items-center gap-2 text-rank-legend bg-rank-legend/10 p-3 rounded-lg mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-semibold">LEGENDARY CHALLENGE: Only 8% succeed. Prove you are elite.</span>
                    </div>
                  )}
                  {challenge.difficulty === 'hard' && (
                    <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-semibold">HIGH RISK: Failure costs {challenge.rankImpact.loss} rank positions.</span>
                    </div>
                  )}
                </div>

                {/* Problem Statement */}
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-foreground leading-relaxed whitespace-pre-line">
                    {challenge.problemStatement}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span>Examples</span>
                  </h3>
                  {challenge.examples.map((example, i) => (
                    <div key={i} className="bg-background rounded-lg p-4 font-mono text-sm border border-border">
                      <div className="text-muted-foreground mb-2">Example {i + 1}:</div>
                      <div className="mb-2">
                        <span className="text-muted-foreground">Input: </span>
                        <span className="text-foreground">{example.input}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted-foreground">Output: </span>
                        <span className="text-primary font-semibold">{example.output}</span>
                      </div>
                      {example.explanation && (
                        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                          {example.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Constraints</h3>
                  <ul className="space-y-1">
                    {challenge.constraints.map((constraint, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <code className="text-foreground bg-background px-1 rounded">{constraint}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats Card */}
                <div className="arena-card p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">Battle Statistics</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Warriors who conquered</span>
                    <span className="text-foreground font-medium">{challenge.solvedBy.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Global success rate</span>
                    <span className={`font-medium ${
                      challenge.successRate < 30 ? 'text-destructive' : 
                      challenge.successRate < 50 ? 'text-status-warning' : 'text-status-success'
                    }`}>
                      {challenge.successRate}%
                    </span>
                  </div>
                  <Progress 
                    value={challenge.successRate} 
                    className={`h-2 ${
                      challenge.successRate < 30 ? '[&>div]:bg-destructive' : 
                      challenge.successRate < 50 ? '[&>div]:bg-status-warning' : '[&>div]:bg-status-success'
                    }`}
                  />
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Time limit</span>
                    <span className="text-foreground font-medium">{challenge.timeLimit} minutes</span>
                  </div>
                </div>

                {/* Test Cases */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Test Cases</h3>
                  <div className="space-y-2">
                    {testResults.map((tc, i) => (
                      <div key={i} className="bg-background rounded-lg p-3 flex items-center justify-between border border-border">
                        <div className="font-mono text-sm">
                          <span className="text-muted-foreground">Test {i + 1}</span>
                        </div>
                        {tc.passed === null ? (
                          <div className="h-5 w-5 rounded-full border-2 border-muted" />
                        ) : tc.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-status-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hints" className="flex-1 overflow-auto p-6 m-0">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-status-warning" />
                  <h3 className="font-semibold text-foreground">Strategic Hints</h3>
                </div>
                
                {!showHints ? (
                  <div className="arena-card p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-status-warning mx-auto mb-3" />
                    <h4 className="font-semibold text-foreground mb-2">Reveal Hints?</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      True warriors solve without assistance. But if you must...
                    </p>
                    <Button variant="outline" onClick={() => setShowHints(true)}>
                      Show Hints
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {challenge.hints?.map((hint, i) => (
                      <div key={i} className="arena-card p-4 border-status-warning/30">
                        <div className="flex items-start gap-3">
                          <div className="p-1 bg-status-warning/20 rounded">
                            <Lightbulb className="h-4 w-4 text-status-warning" />
                          </div>
                          <div>
                            <div className="text-xs text-status-warning font-semibold mb-1">HINT {i + 1}</div>
                            <p className="text-sm text-foreground">{hint}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 overflow-auto p-6 m-0">
              <div className="text-center py-12">
                <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Your Battle History</h3>
                <p className="text-muted-foreground text-sm">No submissions yet. Enter the arena!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as any);
                  setCode(starterCode[e.target.value as keyof typeof starterCode]);
                }}
                className="bg-background border border-border rounded px-3 py-1 text-sm text-foreground"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(code)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 bg-[#0d1117] overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-foreground font-mono text-sm p-4 resize-none focus:outline-none"
              spellCheck={false}
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-52 border-t border-border bg-card flex flex-col">
            <div className="h-10 border-b border-border flex items-center px-4 gap-4">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Console
              </span>
              {submissionResult === 'success' && (
                <Badge className="bg-status-success/20 text-status-success border-status-success/50">
                  ACCEPTED
                </Badge>
              )}
              {submissionResult === 'failure' && (
                <Badge className="bg-destructive/20 text-destructive border-destructive/50">
                  REJECTED
                </Badge>
              )}
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-auto">
              {output ? (
                <pre className={`whitespace-pre-wrap ${
                  submissionResult === 'success' ? 'text-status-success' :
                  submissionResult === 'failure' ? 'text-destructive' :
                  'text-foreground'
                }`}>{output}</pre>
              ) : (
                <span className="text-muted-foreground">Click "Run" to test your code. Click "Submit" when ready for battle.</span>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="h-16 border-t border-border bg-card flex items-center justify-between px-4">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <div className="flex items-center gap-3">
              <Button 
                variant="arenaOutline" 
                onClick={handleRun} 
                disabled={isRunning || isSubmitting}
              >
                <Play className="h-4 w-4 mr-2" />
                Run Tests
              </Button>
              <Button 
                variant="arena" 
                onClick={handleSubmit} 
                disabled={isRunning || isSubmitting}
                className={challenge.difficulty === 'hard' || challenge.difficulty === 'extreme' 
                  ? 'bg-destructive hover:bg-destructive/80' 
                  : ''
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Solution
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
