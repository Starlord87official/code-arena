import { Navigate, useNavigate } from 'react-router-dom';
import {
  Network, Server, Code2,
  Zap, ArrowRight, Sparkles, Database, Cpu, Terminal,
  Layers, Box, FileCode, Table2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/bl/PageHeader';
import { SectionHeader } from '@/components/bl/SectionHeader';
import { GlassPanel } from '@/components/bl/GlassPanel';
import { cn } from '@/lib/utils';

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
}

const accentToken: Record<AccentColor, { text: string; iconBg: string; line: string; ctaBg: string; ctaText: string }> = {
  blue:    { text: 'text-neon',         iconBg: 'bg-neon/10',         line: 'bg-neon/70',         ctaBg: 'bg-neon hover:bg-neon/90',           ctaText: 'text-background' },
  gold:    { text: 'text-rank-gold',    iconBg: 'bg-rank-gold/15',    line: 'bg-rank-gold/80',    ctaBg: 'bg-rank-gold hover:bg-rank-gold/90', ctaText: 'text-background' },
  cyan:    { text: 'text-electric',     iconBg: 'bg-electric/10',     line: 'bg-electric/70',     ctaBg: 'bg-electric hover:bg-electric/90',   ctaText: 'text-background' },
  teal:    { text: 'text-teal-400',     iconBg: 'bg-teal-500/10',     line: 'bg-teal-500/70',     ctaBg: 'bg-teal-500 hover:bg-teal-500/90',   ctaText: 'text-background' },
  emerald: { text: 'text-emerald-400',  iconBg: 'bg-emerald-500/10',  line: 'bg-emerald-500/70',  ctaBg: 'bg-emerald-500 hover:bg-emerald-500/90', ctaText: 'text-background' },
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
}: ChallengePathCardProps) {
  const a = accentToken[accentColor];

  return (
    <GlassPanel
      onClick={onClick}
      corners
      sideStripe={isElite ? 'ember' : false}
      padding="none"
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:-translate-y-1',
        isPrimary
          ? (isElite ? 'min-h-[380px] md:min-h-[420px]' : 'min-h-[340px] md:min-h-[380px]')
          : 'min-h-[260px] md:min-h-[280px]',
        isElite && 'md:-mt-2',
      )}
    >
      {/* Elite badge */}
      {isElite && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rank-gold/15 border border-rank-gold/40 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-rank-gold" />
            <span className="font-mono text-[10px] font-bold text-rank-gold tracking-[0.25em] uppercase">Elite Path</span>
          </div>
        </div>
      )}

      {/* Top accent line */}
      <div className={cn('absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-60 group-hover:opacity-100 group-hover:w-3/4 transition-all duration-500', a.line)} />

      {/* Content */}
      <div className={cn('relative z-10 flex flex-col items-center text-center h-full', isPrimary ? 'p-6 md:p-8' : 'p-5 md:p-6')}>
        {/* Icon */}
        <div className={cn('relative mb-6 rounded-2xl transition-all duration-300', a.iconBg, isPrimary ? (isElite ? 'p-6' : 'p-5') : 'p-4')}>
          {icon}
          {secondaryIcon && (
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-card border border-border">
              {secondaryIcon}
            </div>
          )}
        </div>

        {/* Title */}
        <h2
          className={cn(
            'font-display font-bold tracking-wider uppercase mb-2',
            isPrimary ? (isElite ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl') : 'text-xl md:text-2xl',
            a.text,
          )}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p className={cn('text-text-dim max-w-[200px]', isPrimary ? 'text-sm md:text-base mb-8' : 'text-xs md:text-sm mb-6')}>
          {subtitle}
        </p>

        <div className="flex-1" />

        {/* CTA */}
        <button
          className={cn(
            'flex items-center gap-2 rounded-lg font-heading font-bold uppercase tracking-widest transition-all duration-300 group-hover:scale-105',
            a.ctaBg, a.ctaText,
            isPrimary ? 'px-8 py-3 text-sm' : 'px-6 py-2.5 text-xs',
          )}
        >
          <span>Start</span>
          <ArrowRight className={cn('transition-transform group-hover:translate-x-1', isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
        </button>
      </div>
    </GlassPanel>
  );
}

export default function Challenges() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handlePathSelect = (path: string) => {
    navigate(`/challenges/${path}`);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <PageHeader
          sector="002"
          tag="ARENA"
          title={
            <>
              Challenge{' '}
              <span className="text-neon text-glow">Arena</span>
            </>
          }
          subtitle="Choose your training path. Every arena prepares you for real interviews."
        />

        {/* Primary paths */}
        <section className="mb-10">
          <SectionHeader tag="Primary Tracks" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <ChallengePathCard
              title="DSA"
              subtitle="Data Structures & Algorithms"
              icon={<Network className="h-12 w-12 md:h-14 md:w-14 text-neon" />}
              secondaryIcon={<Zap className="h-4 w-4 text-neon" />}
              accentColor="blue"
              isPrimary
              onClick={() => handlePathSelect('dsa')}
            />
            <ChallengePathCard
              title="System Design"
              subtitle="High-Level System Design"
              icon={<Server className="h-14 w-14 md:h-16 md:w-16 text-rank-gold" />}
              secondaryIcon={<Database className="h-4 w-4 text-rank-gold" />}
              accentColor="gold"
              isElite
              isPrimary
              onClick={() => handlePathSelect('system-design')}
            />
          </div>
        </section>

        {/* Secondary paths */}
        <section>
          <SectionHeader tag="Specialized Arenas" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            <ChallengePathCard
              title="LLD"
              subtitle="Low-Level Design"
              icon={<Layers className="h-10 w-10 md:h-11 md:w-11 text-electric" />}
              secondaryIcon={<Box className="h-3.5 w-3.5 text-electric" />}
              accentColor="cyan"
              isPrimary={false}
              onClick={() => handlePathSelect('lld')}
            />
            <ChallengePathCard
              title="Machine Coding"
              subtitle="Real-world coding rounds"
              icon={<FileCode className="h-10 w-10 md:h-11 md:w-11 text-teal-400" />}
              secondaryIcon={<Terminal className="h-3.5 w-3.5 text-teal-400" />}
              accentColor="teal"
              isPrimary={false}
              onClick={() => handlePathSelect('machine-coding')}
            />
            <ChallengePathCard
              title="SQL"
              subtitle="Queries & Database Logic"
              icon={<Table2 className="h-10 w-10 md:h-11 md:w-11 text-emerald-400" />}
              secondaryIcon={<Database className="h-3.5 w-3.5 text-emerald-400" />}
              accentColor="emerald"
              isPrimary={false}
              onClick={() => handlePathSelect('sql')}
            />
          </div>
        </section>

        {/* Footer hint */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-text-mute text-sm flex items-center justify-center gap-2 font-mono">
            <Cpu className="h-4 w-4" />
            <span>More challenge types coming soon</span>
          </p>
        </div>
      </div>
    </div>
  );
}
