import { StoryInsight } from '@/lib/glyphHeatmapData';
import { cn } from '@/lib/utils';

interface GlyphStoryInsightsProps {
  insights: StoryInsight[];
}

export function GlyphStoryInsights({ insights }: GlyphStoryInsightsProps) {
  if (insights.length === 0) return null;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={cn(
            "p-4 rounded-xl",
            "bg-card/50 backdrop-blur-sm border border-border/50",
            "hover:border-primary/30 transition-colors"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {insight.title}
              </p>
              <p className="font-display font-bold text-lg text-foreground truncate">
                {insight.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {insight.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
