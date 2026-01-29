import { Navigate, useNavigate } from 'react-router-dom';
import { 
  Swords, Network, Server, Code2, 
  Zap, ArrowRight, Sparkles, Database, Cpu, Terminal,
  Layers, Box, FileCode, Table2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Animated floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${8 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          50% { 
            transform: translateY(-100px) translateX(20px); 
          }
        }
      `}</style>
    </div>
  );
}

// Animated glow line component
function GlowLine({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  return (
    <div className={`hidden md:flex items-center gap-2 ${direction === 'right' ? 'flex-row-reverse' : ''}`}>
      <Swords className="h-5 w-5 text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]" />
      <div className="w-16 lg:w-24 h-[2px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent"
          style={{
            animation: 'glowSweep 2s ease-in-out infinite',
            animationDirection: direction === 'right' ? 'reverse' : 'normal'
          }}
        />
      </div>
      <style>{`
        @keyframes glowSweep {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

type AccentColor = 'blue' | 'gold' | 'cyan' | 'teal' | 'emerald';

interface ChallengePathCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  accentColor: AccentColor;
  isElite?: boolean;
  isPrimary?: boolean;
  onClick: () => void;
  delay?: number;
}

const colorClasses: Record<AccentColor, {
  glow: string;
  border: string;
  bg: string;
  iconBg: string;
  iconGlow: string;
  btnBg: string;
  btnGlow: string;
  accentLine: string;
  textColor: string;
}> = {
  blue: {
    glow: 'group-hover:shadow-[0_0_60px_hsla(199,100%,50%,0.4)]',
    border: 'group-hover:border-primary/60',
    bg: 'from-primary/5 via-transparent to-transparent',
    iconBg: 'bg-primary/10 group-hover:bg-primary/20',
    iconGlow: 'group-hover:drop-shadow-[0_0_20px_hsl(var(--primary))]',
    btnBg: 'bg-primary hover:bg-primary/90',
    btnGlow: 'hover:shadow-[0_0_30px_hsla(199,100%,50%,0.5)]',
    accentLine: 'bg-primary',
    textColor: 'text-primary',
  },
  gold: {
    glow: 'group-hover:shadow-[0_0_80px_hsla(45,90%,55%,0.5)]',
    border: 'group-hover:border-rank-gold/70',
    bg: 'from-rank-gold/10 via-rank-gold/5 to-transparent',
    iconBg: 'bg-rank-gold/15 group-hover:bg-rank-gold/25',
    iconGlow: 'group-hover:drop-shadow-[0_0_25px_hsl(var(--rank-gold))]',
    btnBg: 'bg-gradient-to-r from-rank-gold to-amber-600 hover:from-rank-gold/90 hover:to-amber-600/90',
    btnGlow: 'hover:shadow-[0_0_40px_hsla(45,90%,55%,0.6)]',
    accentLine: 'bg-gradient-to-r from-rank-gold via-amber-400 to-rank-gold',
    textColor: 'text-rank-gold',
  },
  cyan: {
    glow: 'group-hover:shadow-[0_0_50px_hsla(185,100%,50%,0.35)]',
    border: 'group-hover:border-accent/60',
    bg: 'from-accent/5 via-transparent to-transparent',
    iconBg: 'bg-accent/10 group-hover:bg-accent/20',
    iconGlow: 'group-hover:drop-shadow-[0_0_18px_hsl(var(--accent))]',
    btnBg: 'bg-accent hover:bg-accent/90',
    btnGlow: 'hover:shadow-[0_0_25px_hsla(185,100%,50%,0.4)]',
    accentLine: 'bg-accent',
    textColor: 'text-accent',
  },
  teal: {
    glow: 'group-hover:shadow-[0_0_50px_hsla(175,70%,45%,0.35)]',
    border: 'group-hover:border-teal-400/60',
    bg: 'from-teal-500/5 via-transparent to-transparent',
    iconBg: 'bg-teal-500/10 group-hover:bg-teal-500/20',
    iconGlow: 'group-hover:drop-shadow-[0_0_18px_hsl(175,70%,45%)]',
    btnBg: 'bg-teal-500 hover:bg-teal-500/90',
    btnGlow: 'hover:shadow-[0_0_25px_hsla(175,70%,45%,0.4)]',
    accentLine: 'bg-teal-500',
    textColor: 'text-teal-400',
  },
  emerald: {
    glow: 'group-hover:shadow-[0_0_50px_hsla(160,70%,45%,0.35)]',
    border: 'group-hover:border-emerald-400/60',
    bg: 'from-emerald-500/5 via-transparent to-transparent',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconGlow: 'group-hover:drop-shadow-[0_0_18px_hsl(160,70%,45%)]',
    btnBg: 'bg-emerald-500 hover:bg-emerald-500/90',
    btnGlow: 'hover:shadow-[0_0_25px_hsla(160,70%,45%,0.4)]',
    accentLine: 'bg-emerald-500',
    textColor: 'text-emerald-400',
  },
};

function ChallengePathCard({ 
  title, 
  subtitle, 
  icon, 
  secondaryIcon,
  accentColor, 
  isElite, 
  isPrimary = true,
  onClick,
  delay = 0
}: ChallengePathCardProps) {
  const colors = colorClasses[accentColor];

  return (
    <div
      onClick={onClick}
      className={`
        group relative cursor-pointer
        ${isElite ? 'md:-mt-4 md:scale-105 z-10' : ''}
      `}
      style={{
        animation: `fadeSlideUp 0.6s ease-out ${delay}s both`
      }}
    >
      {/* Elite badge */}
      {isElite && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rank-gold/20 to-amber-600/20 border border-rank-gold/40 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-rank-gold" />
            <span className="text-xs font-heading font-bold text-rank-gold tracking-wider uppercase">Elite Path</span>
          </div>
        </div>
      )}

      {/* Card */}
      <div className={`
        relative overflow-hidden rounded-2xl border border-border/50
        bg-gradient-to-b ${colors.bg}
        backdrop-blur-sm
        transition-all duration-500 ease-out
        ${colors.glow} ${colors.border}
        group-hover:-translate-y-2
        ${isPrimary 
          ? (isElite ? 'min-h-[380px] md:min-h-[420px]' : 'min-h-[340px] md:min-h-[380px]')
          : 'min-h-[260px] md:min-h-[280px]'
        }
      `}>
        {/* Inner glow border effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute inset-[1px] rounded-2xl bg-gradient-to-b ${colors.bg}`} />
        </div>

        {/* Accent line at top */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] ${colors.accentLine} opacity-60 group-hover:opacity-100 group-hover:w-3/4 transition-all duration-500`} />

        {/* Content */}
        <div className={`relative z-10 flex flex-col items-center text-center h-full ${isPrimary ? 'p-6 md:p-8' : 'p-5 md:p-6'}`}>
          {/* Icon container */}
          <div className={`
            relative mb-4 ${isPrimary ? 'mb-6' : 'mb-4'} rounded-2xl ${colors.iconBg}
            transition-all duration-500
            ${isPrimary ? (isElite ? 'p-6' : 'p-5') : 'p-4'}
          `}>
            <div className={`transition-all duration-500 ${colors.iconGlow}`}>
              {icon}
            </div>
            {secondaryIcon && (
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-card border border-border">
                {secondaryIcon}
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className={`
            font-display font-bold tracking-wider uppercase mb-2
            ${isPrimary 
              ? (isElite ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl')
              : 'text-xl md:text-2xl'
            }
            ${colors.textColor}
          `}>
            {title}
          </h2>

          {/* Subtitle */}
          <p className={`text-muted-foreground mb-6 max-w-[200px] ${isPrimary ? 'text-sm md:text-base mb-8' : 'text-xs md:text-sm mb-6'}`}>
            {subtitle}
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA Button */}
          <button className={`
            relative flex items-center gap-2 rounded-lg
            font-heading font-bold uppercase tracking-widest
            ${colors.btnBg} text-background
            transition-all duration-300
            ${colors.btnGlow}
            group-hover:scale-105
            ${isPrimary ? 'px-8 py-3 text-sm' : 'px-6 py-2.5 text-xs'}
          `}>
            <span>Start</span>
            <ArrowRight className={`transition-transform group-hover:translate-x-1 ${isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
            
            {/* Button glow pulse */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className={`absolute inset-0 rounded-lg ${colors.btnBg} animate-pulse`} style={{ filter: 'blur(8px)' }} />
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function Challenges() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handlePathSelect = (path: string) => {
    navigate(`/challenges/${path}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-arena-dark via-background to-arena-dark" />
      <FloatingParticles />
      
      {/* Subtle radial glow in center */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          {/* Title with sword decorations */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
            <GlowLine direction="left" />
            
            <h1 
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider"
              style={{ animation: 'fadeSlideUp 0.6s ease-out both' }}
            >
              <span className="text-foreground">CHALLENGE</span>{' '}
              <span className="text-primary neon-text">ARENA</span>
            </h1>
            
            <GlowLine direction="right" />
          </div>

          {/* Subtitle */}
          <p 
            className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.1s both' }}
          >
            Choose your training path. Every arena prepares you for real interviews.
          </p>
        </div>

        {/* Primary Cards - DSA & System Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-8 md:mb-12">
          
          {/* DSA Card */}
          <ChallengePathCard
            title="DSA"
            subtitle="Data Structures & Algorithms"
            icon={<Network className="h-12 w-12 md:h-14 md:w-14 text-primary" />}
            secondaryIcon={<Zap className="h-4 w-4 text-primary" />}
            accentColor="blue"
            isPrimary
            onClick={() => handlePathSelect('dsa')}
            delay={0.2}
          />

          {/* System Design Card - Elite/Featured */}
          <ChallengePathCard
            title="System Design"
            subtitle="High-Level System Design"
            icon={<Server className="h-14 w-14 md:h-16 md:w-16 text-rank-gold" />}
            secondaryIcon={<Database className="h-4 w-4 text-rank-gold" />}
            accentColor="gold"
            isElite
            isPrimary
            onClick={() => handlePathSelect('system-design')}
            delay={0.3}
          />
          
        </div>

        {/* Secondary Cards - LLD, Machine Coding, SQL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          
          {/* LLD Card */}
          <ChallengePathCard
            title="LLD"
            subtitle="Low-Level Design"
            icon={<Layers className="h-10 w-10 md:h-11 md:w-11 text-accent" />}
            secondaryIcon={<Box className="h-3.5 w-3.5 text-accent" />}
            accentColor="cyan"
            isPrimary={false}
            onClick={() => handlePathSelect('lld')}
            delay={0.4}
          />

          {/* Machine Coding Card */}
          <ChallengePathCard
            title="Machine Coding"
            subtitle="Real-world coding rounds"
            icon={<FileCode className="h-10 w-10 md:h-11 md:w-11 text-teal-400" />}
            secondaryIcon={<Terminal className="h-3.5 w-3.5 text-teal-400" />}
            accentColor="teal"
            isPrimary={false}
            onClick={() => handlePathSelect('machine-coding')}
            delay={0.45}
          />

          {/* SQL Card */}
          <ChallengePathCard
            title="SQL"
            subtitle="Queries & Database Logic"
            icon={<Table2 className="h-10 w-10 md:h-11 md:w-11 text-emerald-400" />}
            secondaryIcon={<Database className="h-3.5 w-3.5 text-emerald-400" />}
            accentColor="emerald"
            isPrimary={false}
            onClick={() => handlePathSelect('sql')}
            delay={0.5}
          />
          
        </div>

        {/* Subtle footer hint */}
        <div 
          className="text-center mt-12 md:mt-16"
          style={{ animation: 'fadeSlideUp 0.6s ease-out 0.6s both' }}
        >
          <p className="text-muted-foreground/60 text-sm flex items-center justify-center gap-2">
            <Cpu className="h-4 w-4" />
            <span>More challenge types coming soon</span>
          </p>
        </div>
      </div>

      {/* Global animation styles */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
