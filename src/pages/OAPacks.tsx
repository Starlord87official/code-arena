import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOAPacks } from '@/hooks/useOAPacks';
import { OAPackCard } from '@/components/oa/OAPackCard';
import { OARoleTrackFilters } from '@/components/oa/OARoleTrackFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';

export default function OAPacks() {
  const { data: packs, isLoading } = useOAPacks();
  const [activeTrack, setActiveTrack] = useState('all');

  const filteredPacks = packs?.filter(
    p => activeTrack === 'all' || p.role_track === activeTrack
  );

  return (
    <div className="container mx-auto px-4 max-w-6xl py-6 space-y-6">
      <Link to="/oa" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to OA Arena
      </Link>

      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">All OA Packs</h1>
      </div>

      <OARoleTrackFilters activeTrack={activeTrack} onTrackChange={setActiveTrack} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPacks?.map(pack => (
            <OAPackCard key={pack.id} pack={pack} />
          ))}
        </div>
      )}

      {!isLoading && filteredPacks?.length === 0 && (
        <div className="text-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No packs available for this track.</p>
        </div>
      )}
    </div>
  );
}
