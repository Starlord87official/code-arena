import { useState } from 'react';
import { Plus, Loader2, Code, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEligibleTopics, useCreateDoubt, DoubtCategory, DoubtDifficulty } from '@/hooks/useDoubts';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES: { value: DoubtCategory; label: string }[] = [
  { value: 'study', label: 'Study' },
  { value: 'job', label: 'Job' },
  { value: 'internship', label: 'Internship' },
  { value: 'referral', label: 'Referral' },
];

const DIFFICULTIES: { value: DoubtDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function AskDoubtDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<DoubtCategory | ''>('');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState<DoubtDifficulty | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [codeBlock, setCodeBlock] = useState('');
  const [showCode, setShowCode] = useState(false);

  const { data: topics = [], isLoading: isLoadingTopics } = useEligibleTopics();
  const { mutate: createDoubt, isPending } = useCreateDoubt();
  const { toast } = useToast();

  const resetForm = () => {
    setCategory('');
    setTopicId('');
    setDifficulty('');
    setTitle('');
    setContent('');
    setCodeBlock('');
    setShowCode(false);
  };

  const handleSubmit = () => {
    if (!category || !topicId || !difficulty || !title.trim() || !content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createDoubt(
      {
        category,
        topicId,
        difficulty,
        title: title.trim(),
        content: content.trim(),
        codeBlock: codeBlock.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Doubt posted!',
            description: 'Your doubt has been submitted successfully',
          });
          resetForm();
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Failed to post doubt',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ask a Doubt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Ask a Doubt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category, Topic, Difficulty Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DoubtCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Topic *</Label>
              <Select value={topicId} onValueChange={setTopicId} disabled={isLoadingTopics}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingTopics ? 'Loading...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {topics.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      No topics available. Start learning first!
                    </div>
                  ) : (
                    topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.topic_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty *</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DoubtDifficulty)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="Brief summary of your doubt..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Describe your doubt *</Label>
            <Textarea
              placeholder="Explain your doubt in detail. What have you tried? What's confusing you?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Code Block Toggle */}
          <div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowCode(!showCode)}
            >
              <Code className="h-4 w-4" />
              {showCode ? 'Hide Code Block' : 'Add Code Block'}
            </Button>
          </div>

          {/* Code Block */}
          {showCode && (
            <div className="space-y-2">
              <Label>Code (optional)</Label>
              <Textarea
                placeholder="Paste your code here..."
                value={codeBlock}
                onChange={(e) => setCodeBlock(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Post Doubt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
