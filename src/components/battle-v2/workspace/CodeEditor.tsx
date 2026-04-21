interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  language?: string;
}

/**
 * Lightweight editable code surface — Blue Lock styled.
 * Pure textarea on top of a void backdrop; no external deps.
 */
export function CodeEditor({ value, onChange, disabled, language = "Python 3.11" }: Props) {
  const lines = value.split("\n");

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#050912]">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-10" />
      <div className="pointer-events-none absolute inset-0 bl-scanline opacity-60" />

      {/* Line gutter */}
      <div className="relative w-12 shrink-0 border-r border-line/40 bg-[#050912] py-3 font-mono text-[11px] text-text-mute/60 text-right pr-2 select-none overflow-hidden">
        {lines.map((_, i) => (
          <div key={i} className="leading-[1.55]">{i + 1}</div>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        spellCheck={false}
        placeholder="// Write your solution here…"
        className="relative flex-1 resize-none bg-transparent py-3 px-4 font-mono text-[13px] leading-[1.55] text-text outline-none disabled:opacity-60"
      />

      <div className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 border border-line/60 bg-panel/70 px-2 py-1 font-mono text-[10px] text-text-mute backdrop-blur md:flex">
        <span className="text-neon">{language}</span>
      </div>
    </div>
  );
}
