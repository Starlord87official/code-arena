import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Send, RotateCcw, Terminal } from 'lucide-react';
import { validateCode, starterTemplates, simulateTestExecution } from '@/lib/codeValidation';
import { toast } from 'sonner';

type Language = 'javascript' | 'python' | 'typescript';

interface BattleCodeEditorProps {
  problemExamples: Array<{ input: string; output: string }>;
  onSubmit: (code: string, language: Language) => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export function BattleCodeEditor({ problemExamples, onSubmit, isSubmitting, disabled }: BattleCodeEditorProps) {
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState(starterTemplates.javascript);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(starterTemplates[lang]);
    setOutput('');
  };

  const handleReset = () => {
    setCode(starterTemplates[language]);
    setOutput('');
  };

  const handleRun = () => {
    const validation = validateCode(code, language);
    if (!validation.isValid) {
      setOutput(`❌ VALIDATION FAILED\n\n${validation.error}`);
      toast.error(validation.error || 'Invalid code');
      return;
    }

    setIsRunning(true);
    setOutput('⚡ Executing tests…\n');

    setTimeout(() => {
      const result = simulateTestExecution(code, language, problemExamples);
      if (result.allPassed) {
        setOutput('⚡ Executing tests…\n\n' + result.results.map((r, i) => `✓ Test ${i + 1}: Passed`).join('\n') + '\n\n━━━━━━━━━━━━━━━━━━━━\n✓ All sample tests passed! Ready to submit.');
      } else {
        setOutput('⚡ Executing tests…\n\n' + result.results.map((r, i) => r.passed ? `✓ Test ${i + 1}: Passed` : `✗ Test ${i + 1}: Failed`).join('\n') + '\n\n━━━━━━━━━━━━━━━━━━━━\n✗ Some tests failed.');
      }
      setIsRunning(false);
    }, 600);
  };

  const handleSubmit = () => {
    const validation = validateCode(code, language);
    if (!validation.isValid) {
      setOutput(`❌ SUBMISSION REJECTED\n\n${validation.error}`);
      toast.error(validation.error || 'Invalid code');
      return;
    }
    onSubmit(code, language);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/80">
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
            <SelectTrigger className="w-32 h-7 text-xs bg-secondary/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isRunning || disabled}
            className="h-7 px-3 text-xs"
          >
            <Play className="h-3 w-3 mr-1" /> Run
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || disabled}
            className="h-7 px-3 text-xs bg-primary hover:bg-primary/90"
          >
            <Send className="h-3 w-3 mr-1" /> Submit
          </Button>
        </div>
      </div>

      {/* Code textarea */}
      <div className="flex-1 min-h-0">
        <textarea
          className="w-full h-full bg-background border-none p-4 font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-0"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          disabled={disabled}
          placeholder="Write your solution here…"
        />
      </div>

      {/* Console output */}
      <div className="border-t border-border bg-secondary/30">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
          <Terminal className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-display">Console</span>
          {output && (
            <Badge variant="outline" className="text-[9px] ml-auto">
              {output.includes('✓ All') ? 'PASS' : output.includes('✗') ? 'FAIL' : 'OUTPUT'}
            </Badge>
          )}
        </div>
        <div className="h-28 overflow-y-auto p-3">
          <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
            {output || 'Run your code to see output…'}
          </pre>
        </div>
      </div>
    </div>
  );
}
