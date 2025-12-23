import { useState } from 'react';
import { Mail, User, BookOpen, Users, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateMentorInvite, MentorExpertise } from '@/hooks/useMentorInvites';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const expertiseOptions: { value: MentorExpertise; label: string }[] = [
  { value: 'dsa', label: 'Data Structures & Algorithms' },
  { value: 'cp', label: 'Competitive Programming' },
  { value: 'web', label: 'Web Development' },
  { value: 'system_design', label: 'System Design' },
];

interface InviteMentorModalProps {
  clanId?: string;
  clanName?: string;
  trigger?: React.ReactNode;
}

export function InviteMentorModal({ clanId, clanName, trigger }: InviteMentorModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [expertise, setExpertise] = useState<MentorExpertise | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const createInvite = useCreateMentorInvite();

  const resetForm = () => {
    setEmail('');
    setName('');
    setExpertise('');
    setErrors({});
    setInviteLink(null);
    setCopied(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    try {
      const invite = await createInvite.mutateAsync({
        email,
        name: name || undefined,
        expertise: expertise || undefined,
        clanId,
      });

      // Generate invite link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/invite/mentor?token=${invite.token}`;
      setInviteLink(link);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDone = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Mail className="h-4 w-4" />
            Invite Mentor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a Mentor</DialogTitle>
          <DialogDescription>
            {clanName 
              ? `Send an invite to join ${clanName} as a mentor.`
              : 'Send an invite to become a mentor on the platform.'
            }
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-status-success/10 border border-status-success/30 p-4">
              <p className="text-sm font-medium text-status-success mb-2">
                ✓ Invite created successfully!
              </p>
              <p className="text-xs text-muted-foreground">
                Share this link with {name || email} to complete their mentor onboarding.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-status-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                Invite Another
              </Button>
              <Button className="flex-1" onClick={handleDone}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="mentor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Name (optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Expertise (optional)
              </Label>
              <Select value={expertise} onValueChange={(v) => setExpertise(v as MentorExpertise)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expertise area" />
                </SelectTrigger>
                <SelectContent>
                  {expertiseOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {clanName && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Clan:</span>
                  <span className="font-medium">{clanName}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={createInvite.isPending}
            >
              {createInvite.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Invite...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Create Invite Link
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
