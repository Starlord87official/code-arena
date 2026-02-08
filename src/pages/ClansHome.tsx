import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Plus, Search, Users, TrendingUp, Swords,
  Target, Crown, ClipboardCheck, ChevronRight, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAllClans, useMyMembership } from '@/hooks/useClans';
import { ClanCard } from '@/components/clans/ClanCard';
import { ClanRankBadge } from '@/components/clans/ClanRankBadge';
import { SEED_CLANS, CLAN_BENEFITS } from '@/lib/clanSeedData';

const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp, Target, Swords, ClipboardCheck, Crown,
};

export default function ClansHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: clans, isLoading } = useAllClans();
  const { data: membership } = useMyMembership(user?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');

  // Use real data if available, else seed data
  const displayClans = (clans && clans.length > 0 ? clans : SEED_CLANS);
  const filteredClans = displayClans.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrivacy = privacyFilter === 'all' || c.privacy === privacyFilter;
    return matchesSearch && matchesPrivacy;
  });

  const topClans = [...displayClans].sort((a, b) => b.weekly_xp - a.weekly_xp).slice(0, 5);

  return (
    <div className="min-h-screen pb-16">
      {/* Hero */}
      <section className="relative py-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-20" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="border-primary/50 text-primary font-heading text-xs tracking-wider">
                CLAN ARENA
              </Badge>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Build your squad.{' '}
              <span className="text-gradient-electric">Dominate together.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Train, compete, and climb as a clan — weekly wars, OA ranks, rewards.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                size="lg"
                onClick={() => navigate('/clans/create')}
                className="gap-2 font-heading"
              >
                <Plus className="h-5 w-5" />
                Create Clan
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById('browse-section')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="gap-2 font-heading"
              >
                <Search className="h-5 w-5" />
                Browse Clans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Your Clan (quick card if user is in one) */}
      {membership && (
        <section className="py-6 border-b border-border bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-heading font-bold">Your Clan</span>
              </div>
              <Link to={`/clans/${membership.clan_id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  Go to Dashboard
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-10 max-w-6xl space-y-14">
        {/* Weekly Top Clans */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Crown className="h-6 w-6 text-[hsl(var(--rank-gold))]" />
            Weekly Top Clans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topClans.map((clan, i) => (
              <div key={clan.id} className="relative">
                {i < 3 && (
                  <div className="absolute -top-2 -left-2 z-10 h-7 w-7 rounded-full bg-[hsl(var(--rank-gold))] flex items-center justify-center font-display text-xs font-bold text-background">
                    #{i + 1}
                  </div>
                )}
                <ClanCard {...clan} member_count={(clan as any).member_count ?? undefined} />
              </div>
            ))}
          </div>
        </section>

        {/* Browse Section */}
        <section id="browse-section">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Browse Clans
          </h2>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <Input
              placeholder="Search by name or tag..."
              className="max-w-xs bg-secondary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Tabs value={privacyFilter} onValueChange={(v) => setPrivacyFilter(v as any)}>
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="public" className="text-xs">Public</TabsTrigger>
                <TabsTrigger value="private" className="text-xs">Private</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredClans.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-heading">No clans found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search or create your own!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClans.map((clan) => (
                <ClanCard key={clan.id} {...clan} member_count={(clan as any).member_count ?? undefined} />
              ))}
            </div>
          )}
        </section>

        {/* Benefits */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Why Join a Clan?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CLAN_BENEFITS.map((benefit) => {
              const Icon = BENEFIT_ICONS[benefit.icon] || Target;
              return (
                <div key={benefit.title} className="arena-card p-5 flex gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 h-fit">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
