interface Props {
  step: string;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export function SectionLabel({ step, title, subtitle, rightSlot }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <div className="font-mono text-[10px] tracking-[0.22em] text-text-mute">
          {step} <span className="text-neon">/ {subtitle ?? ""}</span>
        </div>
        <h2 className="mt-1 font-display text-[22px] md:text-[26px] font-black tracking-tight text-text">
          {title}
        </h2>
      </div>
      {rightSlot}
    </div>
  );
}
