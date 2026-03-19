interface Props {
  insights: string[];
}

export default function InsightLines({ insights }: Props) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
      {insights.map((text, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
          {text}
        </span>
      ))}
    </div>
  );
}
