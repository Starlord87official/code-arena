import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminProblems() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any>(null);
  const [form, setForm] = useState({ title: '', difficulty: 'easy', description: '', problem_statement: '', slug: '', tags: '', constraints: '' });
  const queryClient = useQueryClient();

  const { data: problems, isLoading } = useQuery({
    queryKey: ['admin-problems', search],
    queryFn: async () => {
      let query = supabase.from('challenges').select('*').order('created_at', { ascending: false }).limit(100);
      if (search.trim()) query = query.ilike('title', `%${search.trim()}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveProblem = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        difficulty: form.difficulty,
        description: form.description || form.title,
        problem_statement: form.problem_statement || form.description,
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        constraints: form.constraints ? form.constraints.split('\n').filter(Boolean) : [],
      };
      if (editingProblem) {
        const { error } = await supabase.from('challenges').update(payload).eq('id', editingProblem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('challenges').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      toast({ title: editingProblem ? 'Problem updated' : 'Problem created' });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteProblem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('challenges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      toast({ title: 'Problem deleted' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const resetForm = () => {
    setForm({ title: '', difficulty: 'easy', description: '', problem_statement: '', slug: '', tags: '', constraints: '' });
    setEditingProblem(null);
  };

  const openEdit = (p: any) => {
    setEditingProblem(p);
    setForm({
      title: p.title, difficulty: p.difficulty, description: p.description,
      problem_statement: p.problem_statement, slug: p.slug,
      tags: (p.tags || []).join(', '), constraints: (p.constraints || []).join('\n'),
    });
    setDialogOpen(true);
  };

  const diffColor = (d: string) => d === 'easy' ? 'text-green-400' : d === 'medium' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">Problem <span className="text-primary neon-text">Manager</span></h1>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Create Problem</Button>
        </div>

        <div className="arena-card p-4 mb-6 border border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search problems..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-background/50" />
          </div>
        </div>

        <div className="arena-card border border-border/50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !problems?.length ? (
            <div className="p-8 text-center text-muted-foreground">No problems found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell><span className={`capitalize font-semibold ${diffColor(p.difficulty)}`}>{p.difficulty}</span></TableCell>
                    <TableCell className="capitalize">{p.challenge_type}</TableCell>
                    <TableCell><div className="flex gap-1 flex-wrap">{(p.tags || []).slice(0, 3).map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProblem.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingProblem ? 'Edit Problem' : 'Create Problem'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated if empty" /></div>
              <div><Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><Label>Problem Statement</Label><Textarea rows={5} value={form.problem_statement} onChange={(e) => setForm(f => ({ ...f, problem_statement: e.target.value }))} /></div>
              <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
              <div><Label>Constraints (one per line)</Label><Textarea rows={3} value={form.constraints} onChange={(e) => setForm(f => ({ ...f, constraints: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveProblem.mutate()} disabled={!form.title}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
