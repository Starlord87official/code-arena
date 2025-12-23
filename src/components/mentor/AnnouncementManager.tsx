import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Megaphone, 
  Pin, 
  PinOff, 
  Trash2, 
  Edit2,
  Plus,
  Send,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  useClanAnnouncements, 
  useCreateAnnouncement, 
  useDeleteAnnouncement,
  useToggleAnnouncementPin,
  ClanAnnouncement
} from '@/hooks/useClanAnnouncements';
import { Skeleton } from '@/components/ui/skeleton';

interface AnnouncementManagerProps {
  clanId: string;
  mentorId: string;
  isMentor: boolean;
}

export function AnnouncementManager({ clanId, mentorId, isMentor }: AnnouncementManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const { data: announcements, isLoading } = useClanAnnouncements(clanId);
  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const togglePinMutation = useToggleAnnouncementPin();

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    createMutation.mutate({
      clanId,
      mentorId,
      title: title.trim(),
      content: content.trim(),
      isPinned,
    }, {
      onSuccess: () => {
        setTitle('');
        setContent('');
        setIsPinned(false);
        setShowForm(false);
      },
    });
  };

  const handleDelete = (announcement: ClanAnnouncement) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate({ id: announcement.id, clanId });
    }
  };

  const handleTogglePin = (announcement: ClanAnnouncement) => {
    togglePinMutation.mutate({
      id: announcement.id,
      clanId,
      isPinned: !announcement.is_pinned,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Button (Mentor Only) */}
      {isMentor && !showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Post New Announcement
        </Button>
      )}

      {/* Create Form */}
      {showForm && isMentor && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                New Announcement
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Post an announcement visible to all clan members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly Focus Update"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to tell your clan?"
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="pinned"
                  checked={isPinned}
                  onCheckedChange={setIsPinned}
                />
                <Label htmlFor="pinned" className="text-sm cursor-pointer">
                  Pin this announcement
                </Label>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={!title.trim() || !content.trim() || createMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {createMutation.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No announcements yet.
                {isMentor && ' Post one to keep your clan informed!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          announcements?.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-5 rounded-xl border ${
                announcement.is_pinned 
                  ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/30' 
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.is_pinned && (
                      <Badge variant="outline" className="text-primary border-primary text-[10px]">
                        <Pin className="h-3 w-3 mr-1" />
                        PINNED
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold mb-2">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>

                {/* Mentor Actions */}
                {isMentor && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePin(announcement)}
                      className="h-8 w-8"
                    >
                      {announcement.is_pinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
