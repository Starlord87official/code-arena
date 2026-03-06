import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Package, BarChart3, Search, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

// ─── Types ───
interface OAQuestion {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  company: string;
  topic: string;
  input_format: string;
  output_format: string;
  constraints_text: string;
  sample_input: string;
  sample_output: string;
  tags: string[] | null;
  points: number;
  created_at: string;
}

interface OASet {
  id: string;
  company: string;
  title: string;
  difficulty: string;
  duration_minutes: number;
  created_at: string;
}

interface OATestcase {
  id: string;
  question_id: string;
  input: string;
  output: string;
  is_hidden: boolean;
}

// ─── Stat Card ───
function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) {
  return (
    <div className="arena-card p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <Badge variant="outline" className="text-[10px]">LIVE</Badge>
      </div>
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </div>
  );
}

// ─── Question Form Dialog ───
function QuestionFormDialog({
  open, onOpenChange, question, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  question: Partial<OAQuestion> | null;
  onSave: (data: any) => void;
}) {
  const isEdit = !!question?.id;
  const [form, setForm] = useState({
    statement: question?.statement ?? '',
    type: question?.type ?? 'coding',
    difficulty: question?.difficulty ?? 'medium',
    company: question?.company ?? '',
    topic: question?.topic ?? '',
    input_format: question?.input_format ?? '',
    output_format: question?.output_format ?? '',
    constraints_text: question?.constraints_text ?? '',
    sample_input: question?.sample_input ?? '',
    sample_output: question?.sample_output ?? '',
    points: question?.points ?? 100,
  });

  const handleSubmit = () => {
    if (!form.statement.trim()) {
      toast({ title: 'Statement is required', variant: 'destructive' });
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? 'Edit' : 'Create'} OA Question
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Statement *</Label>
            <Textarea value={form.statement} onChange={e => setForm(f => ({ ...f, statement: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="debugging">Debugging</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company</Label>
              <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Amazon" />
            </div>
            <div>
              <Label>Topic</Label>
              <Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Arrays" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Input Format</Label>
              <Textarea value={form.input_format} onChange={e => setForm(f => ({ ...f, input_format: e.target.value }))} rows={2} />
            </div>
            <div>
              <Label>Output Format</Label>
              <Textarea value={form.output_format} onChange={e => setForm(f => ({ ...f, output_format: e.target.value }))} rows={2} />
            </div>
          </div>
          <div>
            <Label>Constraints</Label>
            <Textarea value={form.constraints_text} onChange={e => setForm(f => ({ ...f, constraints_text: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sample Input</Label>
              <Textarea value={form.sample_input} onChange={e => setForm(f => ({ ...f, sample_input: e.target.value }))} rows={2} />
            </div>
            <div>
              <Label>Sample Output</Label>
              <Textarea value={form.sample_output} onChange={e => setForm(f => ({ ...f, sample_output: e.target.value }))} rows={2} />
            </div>
          </div>
          <div className="w-32">
            <Label>Points</Label>
            <Input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Update' : 'Create'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Set Form Dialog ───
function SetFormDialog({
  open, onOpenChange, oaSet, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  oaSet: Partial<OASet> | null;
  onSave: (data: any) => void;
}) {
  const isEdit = !!oaSet?.id;
  const [form, setForm] = useState({
    title: oaSet?.title ?? '',
    company: oaSet?.company ?? '',
    difficulty: oaSet?.difficulty ?? 'medium',
    duration_minutes: oaSet?.duration_minutes ?? 60,
  });

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{isEdit ? 'Edit' : 'Create'} OA Set</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Amazon OA Set #3" />
          </div>
          <div>
            <Label>Company</Label>
            <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Goldman Sachs" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Update' : 'Create'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───
export default function AdminOA() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('questions');
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterCompany, setFilterCompany] = useState('');

  // Question dialog state
  const [qDialogOpen, setQDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<OAQuestion> | null>(null);

  // Set dialog state
  const [sDialogOpen, setSDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<Partial<OASet> | null>(null);

  // Expanded set (to assign problems)
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);

  // ─── Queries ───
  const { data: questions = [], isLoading: loadingQ } = useQuery({
    queryKey: ['admin-oa-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oa_questions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as OAQuestion[];
    },
  });

  const { data: sets = [], isLoading: loadingS } = useQuery({
    queryKey: ['admin-oa-sets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oa_sets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as OASet[];
    },
  });

  const { data: setProblems = [] } = useQuery({
    queryKey: ['admin-oa-set-problems'],
    queryFn: async () => {
      const { data, error } = await supabase.from('oa_set_problems').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

  // ─── Stats ───
  const totalQuestions = questions.length;
  const activeSets = sets.length;
  const companies = [...new Set(questions.map(q => q.company).filter(Boolean))];

  // ─── Mutations ───
  const saveQuestion = useMutation({
    mutationFn: async (formData: any) => {
      if (editingQuestion?.id) {
        const { error } = await supabase.from('oa_questions').update(formData).eq('id', editingQuestion.id);
        if (error) throw error;
      } else {
        // New question needs assessment_id, section_index, question_order, config_json
        const { error } = await supabase.from('oa_questions').insert({
          ...formData,
          assessment_id: '00000000-0000-0000-0000-000000000000',
          section_index: 0,
          question_order: 0,
          config_json: {},
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oa-questions'] });
      setQDialogOpen(false);
      setEditingQuestion(null);
      toast({ title: editingQuestion?.id ? 'Question updated' : 'Question created' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('oa_questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oa-questions'] });
      toast({ title: 'Question deleted' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const saveSet = useMutation({
    mutationFn: async (formData: any) => {
      if (editingSet?.id) {
        const { error } = await supabase.from('oa_sets').update(formData).eq('id', editingSet.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('oa_sets').insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oa-sets'] });
      setSDialogOpen(false);
      setEditingSet(null);
      toast({ title: editingSet?.id ? 'Set updated' : 'Set created' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteSet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('oa_sets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oa-sets'] });
      toast({ title: 'Set deleted' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const toggleSetProblem = useMutation({
    mutationFn: async ({ setId, questionId, add }: { setId: string; questionId: string; add: boolean }) => {
      if (add) {
        const { error } = await supabase.from('oa_set_problems').insert({ set_id: setId, question_id: questionId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('oa_set_problems').delete().eq('set_id', setId).eq('question_id', questionId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-oa-set-problems'] });
    },
  });

  // ─── Filters ───
  const filteredQuestions = questions.filter(q => {
    if (search && !q.statement.toLowerCase().includes(search.toLowerCase()) && !q.topic?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    if (filterCompany && !q.company?.toLowerCase().includes(filterCompany.toLowerCase())) return false;
    return true;
  });

  const diffColor = (d: string) => {
    if (d === 'easy') return 'text-green-400';
    if (d === 'hard') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            OA Arena <span className="text-primary neon-text">Manager</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage Online Assessment questions and company sets.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total OA Questions" value={totalQuestions} icon={FileText} />
          <StatCard title="Active OA Sets" value={activeSets} icon={Package} />
          <StatCard title="Companies" value={companies.length} icon={BarChart3} />
          <StatCard title="Assigned Problems" value={setProblems.length} icon={BarChart3} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="questions">OA Questions</TabsTrigger>
            <TabsTrigger value="sets">OA Sets</TabsTrigger>
          </TabsList>

          {/* ─── QUESTIONS TAB ─── */}
          <TabsContent value="questions">
            <div className="arena-card border border-border/50 p-6">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="w-[150px]" placeholder="Company filter" value={filterCompany} onChange={e => setFilterCompany(e.target.value)} />
                <Button onClick={() => { setEditingQuestion(null); setQDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Create
                </Button>
              </div>

              {/* Table */}
              {loadingQ ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No OA questions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Statement</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map(q => (
                        <TableRow key={q.id}>
                          <TableCell className="max-w-[300px] truncate font-medium">{q.statement}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{q.type}</Badge></TableCell>
                          <TableCell><span className={diffColor(q.difficulty)}>{q.difficulty}</span></TableCell>
                          <TableCell>{q.company || '—'}</TableCell>
                          <TableCell>{q.topic || '—'}</TableCell>
                          <TableCell>{q.points}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingQuestion(q); setQDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteQuestion.mutate(q.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── SETS TAB ─── */}
          <TabsContent value="sets">
            <div className="arena-card border border-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold">Company OA Sets</h2>
                <Button onClick={() => { setEditingSet(null); setSDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Create Set
                </Button>
              </div>

              {loadingS ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : sets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No OA sets yet.</div>
              ) : (
                <div className="space-y-3">
                  {sets.map(s => {
                    const assigned = setProblems.filter(sp => sp.set_id === s.id);
                    const isExpanded = expandedSetId === s.id;
                    return (
                      <div key={s.id} className="border border-border/40 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-muted/10">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setExpandedSetId(isExpanded ? null : s.id)} className="text-muted-foreground hover:text-foreground">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <div>
                              <p className="font-medium text-foreground">{s.title}</p>
                              <p className="text-xs text-muted-foreground">{s.company} · {s.duration_minutes} min · <span className={diffColor(s.difficulty)}>{s.difficulty}</span></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{assigned.length} problems</Badge>
                            <Button size="icon" variant="ghost" onClick={() => { setEditingSet(s); setSDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteSet.mutate(s.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="p-4 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-3">Toggle questions to assign/unassign from this set:</p>
                            {questions.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No questions available. Create questions first.</p>
                            ) : (
                              <div className="grid gap-2 max-h-64 overflow-y-auto">
                                {questions.map(q => {
                                  const isAssigned = assigned.some(a => a.question_id === q.id);
                                  return (
                                    <label key={q.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isAssigned}
                                        onChange={() => toggleSetProblem.mutate({ setId: s.id, questionId: q.id, add: !isAssigned })}
                                        className="accent-primary"
                                      />
                                      <span className="text-sm flex-1 truncate">{q.statement}</span>
                                      <span className={`text-xs ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {qDialogOpen && (
        <QuestionFormDialog
          open={qDialogOpen}
          onOpenChange={setQDialogOpen}
          question={editingQuestion}
          onSave={data => saveQuestion.mutate(data)}
        />
      )}
      {sDialogOpen && (
        <SetFormDialog
          open={sDialogOpen}
          onOpenChange={setSDialogOpen}
          oaSet={editingSet}
          onSave={data => saveSet.mutate(data)}
        />
      )}
    </div>
  );
}
