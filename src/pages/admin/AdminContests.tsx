import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Edit } from 'lucide-react';
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

export default function AdminContests() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', start_time: '', duration_minutes: 60, mode: 'solo', difficulty: 'intermediate', format: 'icpc' });
  const queryClient = useQueryClient();

  const { data: contests, isLoading } = useQuery({
    queryKey: ['admin-contests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveContest = useMutation({
    mutationFn: async () => {
      const startTime = new Date(form.start_time);
      const endTime = new Date(startTime.getTime() + form.duration_minutes * 60000);
      const payload = { ...form, duration_minutes: Number(form.duration_minutes), start_time: startTime.toISOString(), end_time: endTime.toISOString() };
      if (editing) {
        const { error } = await supabase.from('contests').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('contests').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-contests'] }); toast({ title: editing ? 'Contest updated' : 'Contest created' }); setDialogOpen(false); },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteContest = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('contests').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-contests'] }); toast({ title: 'Contest deleted' }); },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const resetForm = () => { setForm({ title: '', description: '', start_time: '', duration_minutes: 60, mode: 'solo', difficulty: 'intermediate', format: 'icpc' }); setEditing(null); };
  const openEdit = (c: any) => { setEditing(c); setForm({ title: c.title, description: c.description || '', start_time: c.start_time?.slice(0, 16) || '', duration_minutes: c.duration_minutes, mode: c.mode, difficulty: c.difficulty, format: c.format }); setDialogOpen(true); };

  const statusColor = (s: string) => s === 'live' ? 'bg-green-500/20 text-green-400' : s === 'upcoming' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">Contest <span className="text-primary neon-text">Manager</span></h1>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Create Contest</Button>
        </div>

        <div className="arena-card border border-border/50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !contests?.length ? (
            <div className="p-8 text-center text-muted-foreground">No contests yet.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Mode</TableHead><TableHead>Duration</TableHead><TableHead>Start</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {contests.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><Badge className={`${statusColor(c.status)} text-xs capitalize`}>{c.status}</Badge></TableCell>
                    <TableCell className="capitalize">{c.mode}</TableCell>
                    <TableCell>{c.duration_minutes}m</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(c.start_time).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteContest.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? 'Edit Contest' : 'Create Contest'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Time</Label><Input type="datetime-local" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))} /></div>
                <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Mode</Label><Select value={form.mode} onValueChange={(v) => setForm(f => ({ ...f, mode: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="solo">Solo</SelectItem><SelectItem value="duo">Duo</SelectItem><SelectItem value="clan">Clan</SelectItem></SelectContent></Select></div>
                <div><Label>Difficulty</Label><Select value={form.difficulty} onValueChange={(v) => setForm(f => ({ ...f, difficulty: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
                <div><Label>Format</Label><Select value={form.format} onValueChange={(v) => setForm(f => ({ ...f, format: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="icpc">ICPC</SelectItem><SelectItem value="ioi">IOI</SelectItem></SelectContent></Select></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={() => saveContest.mutate()} disabled={!form.title || !form.start_time}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
