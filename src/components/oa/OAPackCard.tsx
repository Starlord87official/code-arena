import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, GraduationCap, Briefcase, Code2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OAPack } from '@/hooks/useOAPacks';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'code': Code2,
  'layers': Layers,
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  medium: { label: 'Medium', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  hard: { label: 'Hard', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

interface OAPackCardProps {
  pack: OAPack;
}

export function OAPackCard({ pack }: OAPackCardProps) {
  const IconComp = iconMap[pack.icon || ''] || FileText;
  const diff = difficultyConfig[pack.difficulty] || difficultyConfig.medium;

  return (
    <div className="arena-card group flex flex-col p-6 rounded-xl min-w-[300px] max-w-[360px]">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl",
          "bg-primary/10 border border-primary/20"
        )}>
          <IconComp className="h-6 w-6 text-primary" />
        </div>
        <Badge variant="outline" className={cn("text-[10px] font-heading uppercase", diff.className)}>
          {diff.label}
        </Badge>
      </div>

      <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {pack.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
        {pack.description}
      </p>

      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{pack.duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          <span>{pack.assessment_count || 0} assessments</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {(pack.tags ?? []).slice(0, 4).map(tag => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border"
          >
            {tag}
          </span>
        ))}
        {(pack.tags ?? []).length > 4 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
            +{(pack.tags ?? []).length - 4}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/oa/pack/${pack.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Preview
          </Button>
        </Link>
        <Link to={`/oa/pack/${pack.id}`} className="flex-1">
          <Button variant="default" size="sm" className="w-full">
            Start
          </Button>
        </Link>
      </div>
    </div>
  );
}
