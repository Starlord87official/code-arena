import crownSvg from '@/assets/crown_logo.svg';

type CrownVariant = 'solo' | 'duo' | 'clan' | 'clan-alt';

interface CrownIconProps {
  size?: number;
  variant?: CrownVariant;
  className?: string;
  locked?: boolean;
}

const glowStyles: Record<CrownVariant, string> = {
  solo: 'drop-shadow(0 0 10px rgba(255,180,70,0.4)) drop-shadow(0 0 20px rgba(255,180,70,0.2))',
  duo: 'drop-shadow(0 0 10px rgba(0,230,255,0.35)) drop-shadow(0 0 14px rgba(255,200,60,0.3))',
  clan: 'drop-shadow(0 0 14px rgba(255,215,0,0.5)) drop-shadow(0 0 28px rgba(255,215,0,0.25))',
  'clan-alt': 'drop-shadow(0 0 12px rgba(255,215,0,0.45)) drop-shadow(0 0 22px rgba(255,180,70,0.2))',
};

const bgGradients: Record<CrownVariant, string> = {
  solo: 'radial-gradient(circle, rgba(255,200,80,0.10) 0%, transparent 65%)',
  duo: 'radial-gradient(circle, rgba(0,220,255,0.08) 0%, rgba(255,215,100,0.06) 40%, transparent 65%)',
  clan: 'radial-gradient(circle, rgba(255,215,100,0.14) 0%, transparent 65%)',
  'clan-alt': 'radial-gradient(circle, rgba(255,215,100,0.12) 0%, transparent 65%)',
};

export function CrownIcon({ size = 140, variant = 'solo', className = '', locked = false }: CrownIconProps) {
  const imgSize = size;

  return (
    <div
      className={`crown-icon-wrapper relative inline-flex items-center justify-center ${className}`}
      style={{
        width: imgSize,
        height: imgSize * 0.75,
      }}
    >
      {/* Radial background glow */}
      {!locked && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: bgGradients[variant] }}
        />
      )}
      <img
        src={crownSvg}
        alt="Crown achievement"
        width={imgSize}
        height={imgSize * 0.75}
        className={locked ? 'crown-locked' : 'crown-active'}
        style={{
          filter: locked
            ? 'grayscale(1) opacity(0.4)'
            : glowStyles[variant],
          transition: 'filter 0.3s ease, transform 0.3s ease',
          animation: locked ? 'none' : 'crownPulse 4.5s ease-in-out infinite',
          willChange: 'transform, filter',
        }}
      />
      <style>{`
        @keyframes crownPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.95; }
        }
        .crown-icon-wrapper:hover .crown-active {
          transform: translateY(-3px);
          filter: ${glowStyles[variant].replace(/0\.\d+\)/g, (m) => {
            const val = parseFloat(m);
            return (Math.min(val * 1.2, 1)).toFixed(2) + ')';
          })} brightness(1.08) !important;
          animation: none !important;
        }
        .crown-locked {
          filter: grayscale(1) opacity(0.4) !important;
        }
      `}</style>
    </div>
  );
}
