import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: '', message: '', type: 'system', userId: '' });

  const sendNotification = useMutation({
    mutationFn: async () => {
      if (form.userId.trim()) {
        const { error } = await supabase.from('notifications').insert({
          user_id: form.userId.trim(),
          title: form.title,
          message: form.message,
          type: form.type,
        });
        if (error) throw error;
      } else {
        // Broadcast to all users
        const { data: users, error: ue } = await supabase.from('profiles').select('id');
        if (ue) throw ue;
        if (users?.length) {
          const rows = users.map(u => ({ user_id: u.id, title: form.title, message: form.message, type: form.type }));
          const { error } = await supabase.from('notifications').insert(rows);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast({ title: 'Notification sent' });
      setForm({ title: '', message: '', type: 'system', userId: '' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">Send <span className="text-primary neon-text">Notification</span></h1>
        <div className="arena-card p-6 border border-border/50 space-y-4">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><Label>Message</Label><Textarea rows={4} value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} /></div>
          <div><Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="contest">Contest</SelectItem>
                <SelectItem value="battle">Battle</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>User ID (leave empty to broadcast to all)</Label><Input value={form.userId} onChange={(e) => setForm(f => ({ ...f, userId: e.target.value }))} placeholder="Optional — broadcast if empty" /></div>
          <Button onClick={() => sendNotification.mutate()} disabled={!form.title || !form.message || sendNotification.isPending} className="w-full">
            <Send className="h-4 w-4 mr-2" />Send Notification
          </Button>
        </div>
      </div>
    </div>
  );
}
