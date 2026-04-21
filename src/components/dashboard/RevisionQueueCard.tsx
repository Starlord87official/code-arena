import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { useRevisionQueue, useCompleteRevisionItem } from '@/hooks/useRevisionQueue';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function RevisionQueueCard() {
  const { data: items = [], isLoading } = useRevisionQueue();
  const { mutate: completeItem, isPending: isCompleting } = useCompleteRevisionItem();
  const { toast } = useToast();

  const handleComplete = (id: string, title: string) => {
    completeItem(id, {
      onSuccess: () => {
        toast({
          title: 'Revision Completed',
          description: `"${title}" marked as revised`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to complete',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const overdue = items.filter((i) => i.status === 'overdue');
  const due = items.filter((i) => i.status === 'due');
  const upcoming = items.filter((i) => i.status === 'upcoming');
  const ordered = [...overdue, ...due, ...upcoming].slice(0, 5);
  const total = items.length;

  return (
    <div className="relative bl-glass overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-neon" />
            <h3 className="font-display text-[14px] font-bold tracking-tight text-text">
              Revision Queue
            </h3>
          </div>
          {total > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-neon/40 bg-neon/10 text-neon font-display text-[10px] font-bold tracking-[0.2em]">
              <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_#00f0ff] bl-flicker" />
              {total} ACTIVE
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-neon" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="h-8 w-8 text-text-mute mx-auto mb-2 opacity-50" />
            <p className="text-[12px] text-text-dim">No revisions scheduled</p>
            <p className="text-[11px] text-text-mute mt-1 font-mono">
              // MARK PROBLEMS FOR REVISION
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {ordered.map((it, i) => {
              const dueLabel =
                it.status === 'overdue'
                  ? 'OVERDUE'
                  : it.status === 'due'
                    ? 'TODAY'
                    : 'UPCOMING';
              const dueClass =
                it.status === 'overdue' || it.status === 'due'
                  ? 'text-ember'
                  : 'text-text-dim';

              return (
                <li
                  key={it.id}
                  className="group relative border border-line/60 bg-void/40 p-2.5 flex items-center gap-3 hover:border-neon/40 hover:bg-neon/[0.03] transition-colors"
                >
                  <span className="font-mono text-[10px] text-text-mute w-5 text-center shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Link
                    to={`/solve/${it.problem_id}`}
                    className="min-w-0 flex-1"
                  >
                    <div className="font-display text-[13px] font-semibold text-text truncate group-hover:text-neon transition-colors">
                      {it.problem_title}
                    </div>
                    <div className="font-mono text-[10px] text-text-mute truncate">
                      {it.topic || '—'}
                    </div>
                  </Link>
                  <span
                    className={cn(
                      'font-display text-[10px] font-bold tracking-[0.18em] shrink-0',
                      dueClass,
                    )}
                  >
                    {dueLabel}
                  </span>
                  <button
                    onClick={() => handleComplete(it.id, it.problem_title)}
                    disabled={isCompleting}
                    className="shrink-0 p-1 hover:scale-110 transition-transform"
                    aria-label="Mark complete"
                  >
                    <CheckCircle2 className="h-4 w-4 text-text-mute group-hover:text-neon transition-colors" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {total > 5 && (
          <p className="text-center mt-3 font-mono text-[11px] text-text-mute">
            +{total - 5} MORE
          </p>
        )}
      </div>
    </div>
  );
}
