import { useState } from 'react';
import { useOAPacks } from '@/hooks/useOAPacks';
import { OAHeroSection } from '@/components/oa/OAHeroSection';
import { OAPackCard } from '@/components/oa/OAPackCard';
import { OAReadinessSnapshot } from '@/components/oa/OAReadinessSnapshot';
import { OARoleTrackFilters } from '@/components/oa/OARoleTrackFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck } from 'lucide-react';

export default function OAArena() {
  const { data: packs, isLoading } = useOAPacks();
  const [activeTrack, setActiveTrack] = useState('all');

  const filteredPacks = packs?.filter(
    p => activeTrack === 'all' || p.role_track === activeTrack
  );

  const featuredPacks = filteredPacks?.filter(p => p.is_featured);
  const otherPacks = filteredPacks?.filter(p => !p.is_featured);

  return (
    <div className="container mx-auto px-4 max-w-6xl py-6 space-y-8">
      {/* Hero */}
      <OAHeroSection />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Role Track Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
                Company-Style Packs
              </h2>
            </div>
            <OARoleTrackFilters activeTrack={activeTrack} onTrackChange={setActiveTrack} />
          </div>

          {/* Featured Packs */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {featuredPacks && featuredPacks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading text-xs uppercase tracking-widest text-yellow-400">
                    ★ Featured
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredPacks.map(pack => (
                      <OAPackCard key={pack.id} pack={pack} />
                    ))}
                  </div>
                </div>
              )}

              {otherPacks && otherPacks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
                    All Packs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherPacks.map(pack => (
                      <OAPackCard key={pack.id} pack={pack} />
                    ))}
                  </div>
                </div>
              )}

              {filteredPacks?.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No packs available for this track yet.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <OAReadinessSnapshot />
        </div>
      </div>
    </div>
  );
}
