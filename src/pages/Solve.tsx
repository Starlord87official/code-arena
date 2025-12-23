import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, Send, RotateCcw, ChevronLeft, Clock, Zap, Users, 
  CheckCircle2, XCircle, Settings2, Copy, Maximize2, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockChallenges, getDifficultyColor } from '@/lib/mockData';

const starterCode = {
  javascript: `function solve(input) {
  // Your solution here
  
  return result;
}`,
  python: `def solve(input):
    # Your solution here
    
    return result`,
  typescript: `function solve(input: any): any {
  // Your solution here
  
  return result;
}`,
};

const testCases = [
  { input: '[2, 7, 11, 15], target = 9', expected: '[0, 1]', passed: null },
  { input: '[3, 2, 4], target = 6', expected: '[1, 2]', passed: null },
  { input: '[3, 3], target = 6', expected: '[0, 1]', passed: null },
];

export default function Solve() {
  const { id } = useParams();
  const challenge = mockChallenges.find(c => c.id === id) || mockChallenges[0];
  
  const [code, setCode] = useState(starterCode.javascript);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'typescript'>('javascript');
  const [output, setOutput] = useState<string>('');
  const [testResults, setTestResults] = useState(testCases);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Running tests...\n');
    
    setTimeout(() => {
      setOutput('Test 1: Passed ✓\nTest 2: Passed ✓\nTest 3: Running...');
      setTimeout(() => {
        setOutput('Test 1: Passed ✓\nTest 2: Passed ✓\nTest 3: Passed ✓\n\nAll tests passed!');
        setTestResults(testCases.map(tc => ({ ...tc, passed: true })));
        setIsRunning(false);
      }, 800);
    }, 1000);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setOutput('Submitting solution...\n');
    
    setTimeout(() => {
      setOutput('Running all test cases...\n15/15 tests passed\n\n✓ Solution Accepted!\n+' + challenge.xpReward + ' XP earned!');
      setIsRunning(false);
    }, 2000);
  };

  const handleReset = () => {
    setCode(starterCode[language]);
    setOutput('');
    setTestResults(testCases.map(tc => ({ ...tc, passed: null })));
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/challenges" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-display font-semibold text-foreground">{challenge.title}</h1>
          <Badge className={`${getDifficultyColor(challenge.difficulty)} border border-current/30 bg-current/10 uppercase text-xs`}>
            {challenge.difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">00:00</span>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-semibold">+{challenge.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-[400px] border-r border-border flex flex-col bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
              <TabsTrigger value="description" className="data-[state=active]:bg-primary/20">Description</TabsTrigger>
              <TabsTrigger value="solutions" className="data-[state=active]:bg-primary/20">Solutions</TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-primary/20">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 overflow-auto p-6 m-0">
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">{challenge.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{challenge.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="arena-card p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">Stats</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Solved by</span>
                    <span className="text-foreground font-medium">{challenge.solvedBy.toLocaleString()} warriors</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Success rate</span>
                    <span className="text-foreground font-medium">{challenge.successRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">XP Reward</span>
                    <span className="text-primary font-bold">{challenge.xpReward} XP</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Example</h3>
                  <div className="bg-background rounded-lg p-4 font-mono text-sm">
                    <div className="text-muted-foreground mb-2">Input:</div>
                    <div className="text-foreground mb-4">nums = [2, 7, 11, 15], target = 9</div>
                    <div className="text-muted-foreground mb-2">Output:</div>
                    <div className="text-primary">[0, 1]</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Test Cases</h3>
                  <div className="space-y-2">
                    {testResults.map((tc, i) => (
                      <div key={i} className="bg-background rounded-lg p-3 flex items-center justify-between">
                        <div className="font-mono text-sm">
                          <span className="text-muted-foreground">Test {i + 1}:</span>
                          <span className="text-foreground ml-2">{tc.input}</span>
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

            <TabsContent value="solutions" className="flex-1 overflow-auto p-6 m-0">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Community Solutions</h3>
                <p className="text-muted-foreground text-sm">Solve the challenge first to unlock solutions.</p>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 overflow-auto p-6 m-0">
              <div className="text-center py-12">
                <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Your Submissions</h3>
                <p className="text-muted-foreground text-sm">No submissions yet. Start coding!</p>
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
          <div className="h-48 border-t border-border bg-card flex flex-col">
            <div className="h-10 border-b border-border flex items-center px-4 gap-4">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Console
              </span>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-auto">
              {output ? (
                <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
              ) : (
                <span className="text-muted-foreground">Click "Run" to execute your code...</span>
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
              <Button variant="arenaOutline" onClick={handleRun} disabled={isRunning}>
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
              <Button variant="arena" onClick={handleSubmit} disabled={isRunning}>
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
