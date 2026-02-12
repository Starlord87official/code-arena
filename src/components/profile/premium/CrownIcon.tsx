import crownSvg from '@/assets/crown_logo.svg';

type CrownVariant = 'solo' | 'duo' | 'clan' | 'clan-alt';

interface CrownIconProps {
  size?: number;
  variant?: CrownVariant;
  className?: string;
  locked?: boolean;
}

const glowStyles: Record<CrownVariant, string> = {
  solo: 'brightness(1.5) contrast(1.3) drop-shadow(0 0 8px rgba(0,229,255,0.4)) drop-shadow(0 0 18px rgba(0,229,255,0.25)) drop-shadow(0 0 36px rgba(0,229,255,0.12))',
  duo: 'brightness(1.45) contrast(1.25) drop-shadow(0 0 8px rgba(0,229,255,0.35)) drop-shadow(0 0 16px rgba(255,215,100,0.3)) drop-shadow(0 0 32px rgba(0,229,255,0.15))',
  clan: 'brightness(1.5) contrast(1.3) drop-shadow(0 0 10px rgba(255,215,0,0.5)) drop-shadow(0 0 22px rgba(255,215,0,0.3)) drop-shadow(0 0 40px rgba(255,180,70,0.18))',
  'clan-alt': 'brightness(1.45) contrast(1.25) drop-shadow(0 0 10px rgba(255,215,0,0.45)) drop-shadow(0 0 20px rgba(255,200,60,0.25)) drop-shadow(0 0 36px rgba(255,180,70,0.15))',
};

const haloGradients: Record<CrownVariant, string> = {
  solo: 'radial-gradient(circle, rgba(0,229,255,0.18) 0%, rgba(0,229,255,0.08) 40%, transparent 70%)',
  duo: 'radial-gradient(circle, rgba(255,215,100,0.16) 0%, rgba(0,229,255,0.10) 40%, transparent 70%)',
  clan: 'radial-gradient(circle, rgba(255,215,0,0.22) 0%, rgba(255,180,70,0.10) 40%, transparent 70%)',
  'clan-alt': 'radial-gradient(circle, rgba(255,215,100,0.18) 0%, rgba(255,200,60,0.08) 40%, transparent 70%)',
};

export function CrownIcon({ size = 140, variant = 'solo', className = '', locked = false }: CrownIconProps) {
  // 25% larger than requested size
  const displaySize = Math.round(size * 1.25);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: displaySize, height: displaySize * 0.75 }}
    >
      {/* Halo backplate */}
      {!locked && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: displaySize * 1.6,
            height: displaySize * 1.2,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: haloGradients[variant],
            borderRadius: '50%',
            animation: 'crownHaloPulse 4s ease-in-out infinite',
          }}
        />
      )}
      <img
        src={crownSvg}
        alt="Crown achievement"
        width={displaySize}
        height={displaySize * 0.75}
        style={{
          filter: locked ? 'grayscale(1) brightness(0.4)' : glowStyles[variant],
          animation: locked ? 'none' : 'crownBreath 4s ease-in-out infinite',
          transition: 'filter 0.3s ease, transform 0.3s ease',
          willChange: 'transform, filter',
        }}
        className={locked ? '' : 'crown-img-active'}
      />
      <style>{`
        @keyframes crownBreath {
          0%, 100% { transform: scale(1); opacity: 0.88; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes crownHaloPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
        }
        .crown-img-active:hover {
          transform: scale(1.06) !important;
          animation: none !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
