import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, ChevronLeft, Loader2, Lock, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateClan, useMyMembership } from '@/hooks/useClans';
import { cn } from '@/lib/utils';

const MAX_MEMBER_OPTIONS = [5, 10, 15];

export default function ClansCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createClan = useCreateClan();
  const { data: membership } = useMyMembership(user?.id);

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [motto, setMotto] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [maxMembers, setMaxMembers] = useState(10);

  const isAlreadyInClan = !!membership;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tag.trim()) return;

    const result = await createClan.mutateAsync({
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      description: description.trim() || undefined,
      motto: motto.trim() || undefined,
      privacy,
      max_members: maxMembers,
    });

    if (result.clan_id) {
      navigate(`/clans/${result.clan_id}`);
    }
  };

  if (isAlreadyInClan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="arena-card p-8 max-w-md w-full text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Already in a Clan</h2>
          <p className="text-muted-foreground mb-6">
            You must leave your current clan before creating a new one.
          </p>
          <Link to={`/clans/${membership.clan_id}`}>
            <Button variant="outline">Go to Your Clan</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <Link to="/clans" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="h-4 w-4" />
            Back to Clans
          </Link>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Create Your Clan
          </h1>
          <p className="text-muted-foreground mt-1">
            Build your competitive squad. You become the leader.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name + Tag */}
          <div className="arena-card p-6 space-y-5">
            <div>
              <Label htmlFor="name" className="font-heading text-sm">Clan Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Code Titans"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 bg-secondary/50"
                maxLength={30}
                required
              />
            </div>
            <div>
              <Label htmlFor="tag" className="font-heading text-sm">
                Clan Tag * <span className="text-muted-foreground font-normal">(3-5 uppercase)</span>
              </Label>
              <Input
                id="tag"
                placeholder="e.g. TITAN"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase().slice(0, 5))}
                className="mt-1.5 bg-secondary/50 font-mono uppercase"
                maxLength={5}
                minLength={3}
                required
              />
              {tag && (
                <p className="text-xs text-muted-foreground mt-1">
                  Display: [{tag}]
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description" className="font-heading text-sm">Description</Label>
              <Textarea
                id="description"
                placeholder="What's your clan about? (1-2 lines)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 bg-secondary/50 resize-none"
                rows={2}
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="motto" className="font-heading text-sm">Motto</Label>
              <Input
                id="motto"
                placeholder="e.g. Code or Die"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="mt-1.5 bg-secondary/50"
                maxLength={50}
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="arena-card p-6 space-y-4">
            <Label className="font-heading text-sm">Privacy</Label>
            <RadioGroup value={privacy} onValueChange={setPrivacy} className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                  privacy === 'public'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <RadioGroupItem value="public" />
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-heading font-semibold text-sm">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone can apply</p>
                </div>
              </label>
              <label
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                  privacy === 'private'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <RadioGroupItem value="private" />
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-heading font-semibold text-sm">Private</p>
                  <p className="text-xs text-muted-foreground">Invite only</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Max Members */}
          <div className="arena-card p-6 space-y-4">
            <Label className="font-heading text-sm">Max Members</Label>
            <div className="flex gap-3">
              {MAX_MEMBER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setMaxMembers(opt)}
                  className={cn(
                    'px-5 py-2.5 rounded-lg border font-heading font-bold text-lg transition-all',
                    maxMembers === opt
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {name && tag && (
            <div className="arena-card p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center font-display text-lg font-bold text-primary">
                  {tag.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg">{name}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">[{tag}]</Badge>
                  </div>
                  {motto && <p className="text-xs text-muted-foreground italic">"{motto}"</p>}
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full font-heading gap-2"
            disabled={!name.trim() || !tag.trim() || tag.length < 3 || createClan.isPending}
          >
            {createClan.isPending ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Creating...</>
            ) : (
              <><Shield className="h-5 w-5" /> Create Clan</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
