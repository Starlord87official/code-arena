import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Code2, Trophy, Flame, Swords, ChevronRight, Zap, Target, BookOpen,
  BarChart3, Shield, Timer, Users, Crown, Cpu, Database,
  Brain, TrendingUp, Calendar, CheckCircle2, Star, ArrowRight,
  Layers, Monitor, Activity, Crosshair, ClipboardCheck,
  Radio, Twitter, Github, Linkedin, Mail,
  ChevronDown, Rocket, Menu, X, Award, Eye
} from 'lucide-react';

/* ─── Animated counter ─── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  if (inView && displayed === 0) {
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number, startTime?: number) => {
      const st = startTime || timestamp;
      const progress = Math.min((timestamp - st) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame((t) => step(t, st));
    };
    requestAnimationFrame((t) => step(t));
  }

  return <span ref={ref}>{inView ? displayed : 0}{suffix}</span>;
}

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Glow line separator ─── */
function GlowDivider() {
  return (
    <div className="relative h-px w-full">
      <div className="absolute inset-0 bg-border/50" />
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    </div>
  );
}

/* ══════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════ */
function PremiumNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = ['Features', 'Arenas', 'OA Prep', 'Contests', 'Championship'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Top accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="border-b border-border/30 bg-background/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Code2 className="h-7 w-7 text-primary relative z-10" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-lg font-bold text-gradient-electric">CodeTrackX</span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md group"
              >
                {item}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-[2px] bg-primary transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-heading">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="arena" size="sm" className="shadow-neon">Start Free</Button>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-heading text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors">
                  {item}
                </a>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-heading text-muted-foreground hover:text-primary">
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════ */
function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] flex items-center overflow-hidden pt-16">
      {/* Background layers */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 grid-pattern opacity-[0.08]" />
      {/* Radial gradient floor */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background via-background/50 to-transparent z-[1] pointer-events-none" />
      {/* Orbs */}
      <div className="absolute top-[20%] left-[5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px] animate-float" />
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-accent/8 rounded-full blur-[180px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[10%] right-[25%] w-[300px] h-[300px] bg-neon-purple/8 rounded-full blur-[160px] animate-float" style={{ animationDelay: '6s' }} />
      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">
          {/* ── LEFT: Copy ── */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[11px] font-heading uppercase tracking-[0.2em] text-primary font-semibold">Private Beta — Now Open</span>
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
              className="font-display text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4.2rem] font-black leading-[1.05] mb-6 tracking-tight"
            >
              <span className="text-foreground">Train Like a</span>
              <br />
              <span className="text-foreground">Contender. </span>
              <span className="text-gradient-electric neon-text inline-block">Compete</span>
              <br />
              <span className="text-foreground">Like a </span>
              <span className="relative inline-block">
                <span className="text-gradient-electric neon-text">Champion.</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-accent rounded-full origin-left"
                />
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg text-muted-foreground max-w-[480px] mb-8 leading-relaxed"
            >
              The high-performance coding arena for serious candidates. Company-wise DSA, real OA simulations, 1v1 battles, clan wars, and a ranked championship ladder&nbsp;— unified into one elite system.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link to="/register">
                <Button variant="arena" size="xl" className="group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Training
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <a href="#arenas">
                <Button variant="arenaOutline" size="xl" className="group">
                  <Eye className="h-4 w-4 mr-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                  Explore Arena
                </Button>
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65, duration: 0.6 }}
              className="flex flex-wrap gap-2"
            >
              {[
                { icon: Swords, label: 'DSA Arena' },
                { icon: ClipboardCheck, label: 'OA Arena' },
                { icon: Trophy, label: 'Contests' },
                { icon: Zap, label: 'Battle Mode' },
                { icon: Users, label: 'Clans' },
                { icon: Crown, label: 'Championship' },
                { icon: BookOpen, label: 'Revision' },
                { icon: Target, label: 'Company-wise' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/60 bg-secondary/30 backdrop-blur-sm text-[11px] font-heading text-muted-foreground hover:border-primary/40 hover:text-primary transition-all duration-300 cursor-default">
                  <Icon className="h-3 w-3 text-primary/70" />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Cinematic Product Mockup ── */}
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl blur-3xl pointer-events-none" />

            <div className="relative perspective-[1200px]">
              {/* Main dashboard card — slight 3D tilt */}
              <motion.div
                whileHover={{ rotateY: -2, rotateX: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="arena-card p-6 rounded-2xl border border-border/60 shadow-arena relative overflow-hidden"
              >
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.03] pointer-events-none" />

                {/* Header row */}
                <div className="relative flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm text-foreground">Command Center</p>
                    <p className="text-[11px] text-muted-foreground">Level 24 · Diamond III · Top 5%</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1 text-status-warning bg-status-warning/10 px-2 py-1 rounded-md">
                      <Flame className="h-3.5 w-3.5" />
                      <span className="font-display text-xs font-bold">47</span>
                    </div>
                  </div>
                </div>

                {/* XP progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span className="font-heading">XP to Level 25</span>
                    <span className="text-primary font-heading font-semibold">8,420 / 10,000</span>
                  </div>
                  <div className="xp-bar-intense"><div className="xp-bar-fill" style={{ width: '84%' }} /></div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-2.5 mb-5">
                  {[
                    { label: 'Solved', value: '347', color: 'text-primary', sub: '+12 this week' },
                    { label: 'Win Rate', value: '73%', color: 'text-status-success', sub: '29W / 11L' },
                    { label: 'Rating', value: '1,847', color: 'text-rank-diamond', sub: 'Diamond III' },
                    { label: 'OA Score', value: '78%', color: 'text-accent', sub: 'Interview Ready' },
                  ].map(s => (
                    <div key={s.label} className="bg-secondary/40 rounded-lg p-2.5 text-center border border-border/30">
                      <p className={`font-display text-base font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mini activity bar */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-heading mr-1">Activity</span>
                  {Array.from({ length: 24 }, (_, i) => {
                    const h = [20, 35, 15, 55, 70, 45, 80, 60, 90, 40, 65, 85, 50, 75, 30, 95, 55, 70, 45, 60, 80, 35, 50, 65][i];
                    return <div key={i} className="flex-1 bg-primary/40 rounded-sm" style={{ height: `${h * 0.2 + 2}px`, opacity: 0.4 + h / 200 }} />;
                  })}
                </div>
              </motion.div>

              {/* ── Floating: Live Contest ── */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-8 -right-4 w-56"
              >
                <div className="arena-card p-4 rounded-xl border border-primary/30 shadow-neon relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success" />
                      </div>
                      <span className="text-[10px] font-heading uppercase tracking-widest text-status-success font-semibold">Live Now</span>
                    </div>
                    <p className="font-heading font-bold text-sm text-foreground mb-1">Weekly Arena #47</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3 text-primary" />
                        <span className="font-display text-[11px]">01:23:45</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>342</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Floating: Rank Badge ── */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-6 -left-10 w-52"
              >
                <div className="arena-card p-3.5 rounded-xl border border-rank-diamond/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-rank-diamond/5 to-transparent pointer-events-none" />
                  <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rank-diamond/10 flex items-center justify-center border border-rank-diamond/30 rank-aura-diamond">
                      <Crown className="h-5 w-5 text-rank-diamond" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm text-foreground">Diamond III</p>
                      <p className="text-[10px] text-muted-foreground">Top 5% · Rank #247</p>
                      <div className="w-20 h-1 rounded-full bg-secondary mt-1.5">
                        <div className="h-full w-[72%] rounded-full bg-rank-diamond" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Floating: OA Readiness ── */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                className="absolute top-[45%] -right-8 w-48"
              >
                <div className="arena-card p-3.5 rounded-xl border border-accent/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardCheck className="h-3.5 w-3.5 text-accent" />
                      <span className="text-[10px] font-heading uppercase tracking-widest text-accent font-semibold">OA Ready</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 flex-shrink-0">
                        <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2.5" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeDasharray="88" strokeDashoffset="19" strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-display text-[11px] font-bold text-accent">78%</span>
                      </div>
                      <div>
                        <p className="font-heading text-xs font-bold text-foreground">Interview Ready</p>
                        <p className="text-[10px] text-muted-foreground">12 OAs cleared</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Floating: Battle Win ── */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-[15%] -left-6 w-44"
              >
                <div className="arena-card p-3 rounded-xl border border-status-success/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Swords className="h-3.5 w-3.5 text-status-success" />
                    <span className="text-[10px] font-heading uppercase tracking-widest text-status-success font-semibold">Battle Won</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground font-heading">vs. CodeNinja42</span>
                    <span className="text-[10px] font-display text-status-success font-bold">+28 ELO</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.3em] font-heading">Discover</span>
          <ChevronDown className="h-4 w-4 text-primary/60" />
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   STATS STRIP
   ══════════════════════════════════════════════ */
function StatsStrip() {
  return (
    <section className="relative">
      <GlowDivider />
      <div className="bg-secondary/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 500, suffix: '+', label: 'Elite Challenges', icon: Code2 },
            { value: 50, suffix: '+', label: 'Company OA Sets', icon: ClipboardCheck },
            { value: 10, suffix: 'K+', label: 'Active Warriors', icon: Users },
            { value: 47, suffix: '', label: 'Weekly Contests', icon: Trophy },
          ].map(({ value, suffix, label, icon: Icon }, i) => (
            <Reveal key={label} delay={i * 0.05} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-primary/70" />
              </div>
              <p className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                <AnimatedNumber value={value} suffix={suffix} />
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-heading uppercase tracking-wider">{label}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <GlowDivider />
    </section>
  );
}

/* ══════════════════════════════════════════════
   VALUE PROPS
   ══════════════════════════════════════════════ */
function ValueProps() {
  const features = [
    { icon: Swords, title: 'DSA Arena', desc: 'Curated problems across arrays, trees, graphs, DP & more. Difficulty-tagged. Company-filtered. XP-rewarded.', accent: 'from-primary/10 to-primary/5' },
    { icon: ClipboardCheck, title: 'OA Arena', desc: 'Timed, scored, integrity-tracked mock OAs. Realistic company-format simulations with post-OA analysis.', accent: 'from-accent/10 to-accent/5' },
    { icon: Trophy, title: 'Live Contests', desc: 'Rated weekly contests with ICPC & IOI formats. Real-time leaderboards. Rating impact on every match.', accent: 'from-primary/10 to-primary/5' },
    { icon: Target, title: 'Company-wise Prep', desc: 'Amazon, Google, Goldman Sachs — filter by company, role, and pattern. Practice what actually gets asked.', accent: 'from-status-warning/10 to-status-warning/5' },
    { icon: Zap, title: 'Battle Mode', desc: '1v1 coding duels under real pressure. Solve faster, earn ELO, and prove dominance in real-time matchups.', accent: 'from-accent/10 to-accent/5' },
    { icon: Users, title: 'Clan Arena', desc: 'Build your squad. Compete in clan wars, complete weekly quests, and dominate the collective leaderboard.', accent: 'from-status-warning/10 to-status-warning/5' },
    { icon: Crown, title: 'Championship', desc: 'Seasonal qualifiers, global standings, and the Hall of Champions. The ultimate competitive endgame.', accent: 'from-rank-gold/10 to-rank-gold/5' },
    { icon: BookOpen, title: 'Revision + Planner', desc: 'Spaced repetition revision queue, daily targets, and a personal planner to weaponize your consistency.', accent: 'from-primary/10 to-primary/5' },
  ];

  return (
    <section id="features" className="py-28 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/[0.04] rounded-full blur-[250px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal className="text-center mb-20">
          <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-primary mb-4 font-semibold">The Complete Ecosystem</p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-[3.5rem] font-black text-foreground mb-5 tracking-tight">
            Eight Arenas. <span className="text-gradient-electric">One System.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">Every module is built to sharpen a specific edge. Together, they form the most complete competitive prep platform available.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.04}>
              <div className="group relative rounded-xl border border-border/50 bg-card p-6 h-full overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsla(199,100%,50%,0.08)]">
                {/* Hover glow bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="relative z-10">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsla(199,100%,50%,0.15)] transition-all duration-400">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   HOW IT WORKS
   ══════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { num: '01', icon: Crosshair, title: 'Choose Your Arena', desc: 'DSA, OA, Contests, Battles, or Company-wise — pick your battleground and enter.' },
    { num: '02', icon: Brain, title: 'Train with Precision', desc: 'Follow skill-tree roadmaps, daily missions, and pattern-focused revision paths.' },
    { num: '03', icon: Swords, title: 'Compete Under Pressure', desc: 'Battle opponents, join live contests, simulate OAs — all under real time constraints.' },
    { num: '04', icon: TrendingUp, title: 'Climb the Ladder', desc: 'Earn XP, maintain streaks, ascend divisions, and track your interview readiness score.' },
  ];

  return (
    <section className="py-28 relative overflow-hidden">
      <GlowDivider />
      <div className="absolute inset-0 grid-pattern opacity-[0.06]" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-12">
        <Reveal className="text-center mb-20">
          <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-primary mb-4 font-semibold">The Protocol</p>
          <h2 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Four Phases. <span className="text-gradient-electric">One Path.</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.1}>
              <div className="relative group h-full">
                {/* Connector line */}
                {i < 3 && <div className="hidden md:block absolute top-12 left-[calc(100%+4px)] w-[calc(100%-8px)] h-px z-0">
                  <div className="h-full bg-gradient-to-r from-primary/30 via-primary/15 to-transparent" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary/30" />
                </div>}

                <div className="relative z-10 rounded-xl border border-border/50 bg-card p-6 h-full transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-[0_0_25px_hsla(199,100%,50%,0.06)]">
                  <span className="font-display text-4xl font-black text-primary/10 group-hover:text-primary/20 transition-colors block mb-3">{s.num}</span>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:shadow-neon transition-all duration-300">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   CHALLENGE ARENA SHOWCASE
   ══════════════════════════════════════════════ */
function ChallengeArenaShowcase() {
  const arenas = [
    { icon: Code2, title: 'DSA', desc: 'Arrays, Trees, Graphs, DP, Greedy, Backtracking — full topic coverage.', problems: '300+', color: 'border-primary/30' },
    { icon: Layers, title: 'System Design', desc: 'Scalable systems, load balancers, caches — real HLD rounds.', problems: '50+', color: 'border-accent/30' },
    { icon: Cpu, title: 'Low Level Design', desc: 'OOP, SOLID, design patterns, class modeling challenges.', problems: '40+', color: 'border-neon-purple/30' },
    { icon: Monitor, title: 'Machine Coding', desc: 'Build working apps under timed pressure. Frontend & backend.', problems: '30+', color: 'border-status-warning/30' },
    { icon: Database, title: 'SQL', desc: 'Complex queries, window functions, optimization challenges.', problems: '80+', color: 'border-status-success/30' },
  ];

  return (
    <section id="arenas" className="py-28 relative">
      <GlowDivider />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.04] rounded-full blur-[200px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-12">
        <Reveal className="text-center mb-20">
          <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-primary mb-4 font-semibold">Challenge Arena</p>
          <h2 className="font-display text-3xl md:text-5xl font-black text-foreground mb-5 tracking-tight">
            Five Gates. <span className="text-gradient-electric">Every Round Covered.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Every arena maps directly to a real interview round. Topic-level progression with XP, rank impact, and company alignment.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {arenas.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.06}>
              <div className={`group relative rounded-xl border ${a.color} bg-card p-6 text-center h-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_hsla(199,100%,50%,0.08)] hover:border-primary/40`}>
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_25px_hsla(199,100%,50%,0.15)] transition-all duration-400">
                    <a.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{a.title}</h3>
                  <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{a.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                    {a.problems} problems
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   OA ARENA
   ══════════════════════════════════════════════ */
function OAArenaSection() {
  return (
    <section id="oa-prep" className="py-28 relative overflow-hidden">
      <GlowDivider />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-primary/[0.02] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-accent mb-4 font-semibold">OA Arena</p>
            <h2 className="font-display text-3xl md:text-5xl font-black text-foreground mb-5 leading-tight tracking-tight">
              Not Practice.<br /><span className="text-gradient-electric">Preparation.</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Simulate company-grade online assessments under real pressure. Timed sections, scored results, integrity monitoring, and detailed post-OA breakdowns. Walk into your OA with proof you're ready.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: Timer, label: 'Timed Sections', desc: 'Real exam pressure' },
                { icon: BarChart3, label: 'Score Analysis', desc: 'Post-OA breakdown' },
                { icon: Shield, label: 'Integrity Monitor', desc: 'Tab-switch tracking' },
                { icon: Target, label: 'Company Formats', desc: 'Amazon, Google, GS' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/40 hover:border-accent/30 transition-colors">
                  <Icon className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/oa">
              <Button variant="arena" size="lg" className="group shadow-neon">
                Enter OA Arena
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/10 via-transparent to-primary/5 rounded-3xl blur-2xl pointer-events-none" />
              <div className="arena-card p-6 rounded-2xl border border-accent/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent pointer-events-none" />
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-[10px] font-heading uppercase tracking-widest text-accent font-semibold">
                  Mock OA — Amazon SDE
                </div>
                <div className="relative mt-5 space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                      </div>
                      <span className="text-sm font-heading text-foreground font-semibold">Section 2 of 3</span>
                    </div>
                    <span className="font-display text-sm font-bold text-destructive">00:34:12</span>
                  </div>
                  {[
                    { label: 'Q1 — Two Sum Variant', status: 'Accepted', color: 'text-status-success', bg: 'bg-status-success/10', icon: CheckCircle2 },
                    { label: 'Q2 — LRU Cache Design', status: 'In Progress', color: 'text-status-warning', bg: 'bg-status-warning/10', icon: Activity },
                    { label: 'Q3 — Graph Shortest Path', status: 'Locked', color: 'text-muted-foreground', bg: 'bg-secondary/50', icon: Eye },
                  ].map(q => (
                    <div key={q.label} className={`flex items-center justify-between p-3 rounded-lg ${q.bg} border border-border/30`}>
                      <div className="flex items-center gap-2">
                        <q.icon className={`h-3.5 w-3.5 ${q.color}`} />
                        <span className="text-sm text-foreground">{q.label}</span>
                      </div>
                      <span className={`text-[11px] font-heading font-semibold ${q.color}`}>{q.status}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground font-heading">Current Score</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-xl font-bold text-primary">145</span>
                      <span className="text-xs text-muted-foreground font-heading">/ 300</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   COMPETITIVE SECTION
   ══════════════════════════════════════════════ */
function CompetitiveSection() {
  const items = [
    { icon: Trophy, title: 'Live Contests', desc: 'Weekly rated contests with ICPC/IOI formats. Real-time standings. Rating on the line.', color: 'text-primary', borderColor: 'hover:border-primary/40', badge: 'RATED', badgeColor: 'text-primary bg-primary/10 border-primary/20' },
    { icon: Swords, title: 'Battle Mode', desc: '1v1 coding duels. Solve faster, outthink your opponent, earn ELO. Real-time pressure.', color: 'text-accent', borderColor: 'hover:border-accent/40', badge: 'REAL-TIME', badgeColor: 'text-accent bg-accent/10 border-accent/20' },
    { icon: Users, title: 'Clan Arena', desc: 'Build your squad. Clan wars, weekly quests, collective XP. Lead or be carried.', color: 'text-status-warning', borderColor: 'hover:border-status-warning/40', badge: 'TEAM', badgeColor: 'text-status-warning bg-status-warning/10 border-status-warning/20' },
    { icon: Crown, title: 'Championship', desc: 'Seasonal qualifiers, global standings, and the Hall of Champions. The ultimate endgame.', color: 'text-rank-gold', borderColor: 'hover:border-rank-gold/40', badge: 'PRESTIGE', badgeColor: 'text-rank-gold bg-rank-gold/10 border-rank-gold/20' },
  ];

  return (
    <section id="contests" className="py-28 relative">
      <GlowDivider />
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <Reveal className="text-center mb-20">
          <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-status-warning mb-4 font-semibold">Competitive Systems</p>
          <h2 className="font-display text-3xl md:text-5xl font-black text-foreground mb-5 tracking-tight">
            Solo Isn't Enough. <span className="text-gradient-electric">Compete.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Real-time competition systems that test your speed, strategy, and composure under fire.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className={`group relative rounded-xl border border-border/50 bg-card p-7 h-full overflow-hidden transition-all duration-500 ${item.borderColor} hover:shadow-[0_0_30px_hsla(199,100%,50%,0.06)]`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`h-12 w-12 rounded-xl bg-secondary/60 border border-border/50 flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:shadow-neon transition-all duration-300`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-heading uppercase tracking-wider border font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   PROGRESS / GAMIFICATION
   ══════════════════════════════════════════════ */
function ProgressSection() {
  return (
    <section className="py-28 relative overflow-hidden">
      <GlowDivider />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <Reveal>
            <div className="space-y-4">
              <div className="arena-card p-5 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-heading font-bold text-foreground">Division Progress</h4>
                  <span className="text-[11px] font-heading font-semibold text-rank-diamond bg-rank-diamond/10 px-2.5 py-1 rounded-full border border-rank-diamond/20">Diamond III</span>
                </div>
                <div className="xp-bar-intense mb-2"><div className="xp-bar-fill" style={{ width: '72%' }} /></div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-heading">
                  <span>1,847 RP</span>
                  <span>2,000 RP — Diamond II</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { icon: Flame, label: 'Streak', value: '47d', color: 'text-status-warning' },
                  { icon: Zap, label: 'XP', value: '24.5K', color: 'text-primary' },
                  { icon: Star, label: 'Level', value: '24', color: 'text-rank-gold' },
                  { icon: Target, label: 'Goals', value: '3/4', color: 'text-status-success' },
                ].map(s => (
                  <div key={s.label} className="arena-card p-3 rounded-lg text-center border border-border/40">
                    <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                    <p className={`font-display text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="arena-card p-4 rounded-xl border border-border/40">
                <p className="text-[10px] font-heading text-muted-foreground uppercase tracking-wider mb-3 font-semibold">52-Week Activity</p>
                <div className="flex gap-[3px] flex-wrap">
                  {Array.from({ length: 52 }, (_, i) => {
                    const seed = (i * 7 + 13) % 100;
                    const bg = seed > 75 ? 'bg-primary' : seed > 50 ? 'bg-primary/50' : seed > 25 ? 'bg-primary/20' : 'bg-secondary/60';
                    return <div key={i} className={`h-3 w-3 rounded-[2px] ${bg} transition-colors`} />;
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <Reveal delay={0.12}>
            <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-primary mb-4 font-semibold">Ranked Progression</p>
            <h2 className="font-display text-3xl md:text-5xl font-black text-foreground mb-5 leading-tight tracking-tight">
              Every Session<br />Moves Your <span className="text-gradient-electric">Rank.</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-lg">
              XP, streaks, divisions, heatmaps, revision queues, and interview readiness scores — your preparation becomes a visible, measurable system with stakes.
            </p>
            <div className="space-y-3.5">
              {[
                { icon: TrendingUp, text: 'Division system from Bronze to Legend with promotion/demotion zones' },
                { icon: Flame, text: 'Daily streak fire indicators with progressive rewards' },
                { icon: BookOpen, text: 'Smart revision queue with spaced repetition algorithms' },
                { icon: BarChart3, text: 'Interview readiness score across DSA, OA, and system design' },
                { icon: Calendar, text: 'Personal planner with daily targets and accountability' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 group">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:shadow-neon transition-all duration-300">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   COMPANY-WISE
   ══════════════════════════════════════════════ */
function CompanySection() {
  const companies = [
    { name: 'Amazon', tags: ['DSA', 'System Design', 'Leadership'], count: '120+ problems' },
    { name: 'Google', tags: ['DSA', 'Graphs', 'Dynamic Programming'], count: '95+ problems' },
    { name: 'Goldman Sachs', tags: ['DSA', 'SQL', 'Arrays'], count: '60+ problems' },
    { name: 'Microsoft', tags: ['DSA', 'Trees', 'System Design'], count: '85+ problems' },
    { name: 'Meta', tags: ['DSA', 'Graphs', 'Strings'], count: '75+ problems' },
    { name: 'Apple', tags: ['DSA', 'Arrays', 'Linked Lists'], count: '55+ problems' },
  ];

  return (
    <section className="py-28 relative">
      <GlowDivider />
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <Reveal className="text-center mb-20">
          <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-primary mb-4 font-semibold">Company-Wise Intelligence</p>
          <h2 className="font-display text-3xl md:text-5xl font-black text-foreground mb-5 tracking-tight">
            Know What They <span className="text-gradient-electric">Ask.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Filter by company, role, and pattern. Practice the exact problems your target company tests on.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.05}>
              <div className="group rounded-xl border border-border/50 bg-card p-5 h-full transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_25px_hsla(199,100%,50%,0.06)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-sm font-bold text-primary group-hover:scale-110 group-hover:shadow-neon transition-all duration-300">
                    {c.name[0]}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{c.count}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-secondary/60 text-muted-foreground border border-border/40 font-heading">{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   DIFFERENTIATOR
   ══════════════════════════════════════════════ */
function DifferentiatorSection() {
  const rows = [
    { feature: 'Static Problem Practice', generic: true, ctx: true },
    { feature: 'Realistic OA Simulations', generic: false, ctx: true },
    { feature: 'Competitive Rating Ladder', generic: false, ctx: true },
    { feature: 'Live 1v1 Battle Mode', generic: false, ctx: true },
    { feature: 'Clan Team Competition', generic: false, ctx: true },
    { feature: 'Championship Ecosystem', generic: false, ctx: true },
    { feature: 'Smart Revision System', generic: false, ctx: true },
    { feature: 'Interview Readiness Score', generic: false, ctx: true },
    { feature: 'Company-wise Targeting', generic: false, ctx: true },
  ];

  return (
    <section className="py-28 relative">
      <GlowDivider />
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <Reveal className="text-center mb-16">
          <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-primary mb-4 font-semibold">The Difference</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Beyond <span className="text-gradient-electric">Generic Practice</span>
          </h2>
        </Reveal>

        <Reveal>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-3 p-4 border-b border-border/40 bg-secondary/20">
              <span className="text-sm font-heading font-bold text-foreground">Capability</span>
              <span className="text-sm font-heading text-muted-foreground text-center">Others</span>
              <span className="text-sm font-heading text-primary text-center font-bold">CodeTrackX</span>
            </div>
            {rows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 p-4 items-center group hover:bg-secondary/10 transition-colors ${i < rows.length - 1 ? 'border-b border-border/20' : ''}`}>
                <span className="text-sm text-foreground/90">{row.feature}</span>
                <div className="flex justify-center">
                  {row.generic ? (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground/50" />
                  ) : (
                    <X className="h-4 w-4 text-destructive/40" />
                  )}
                </div>
                <div className="flex justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary group-hover:drop-shadow-[0_0_6px_hsla(199,100%,50%,0.5)] transition-all" />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   TESTIMONIALS
   ══════════════════════════════════════════════ */
function TestimonialSection() {
  const testimonials = [
    { name: 'Arjun S.', role: 'SDE Intern @ Amazon', quote: 'CodeTrackX replaced 4 different tools for me. The OA simulations and revision system are exactly what got me through Amazon\'s OA in one shot.', avatar: 'AS' },
    { name: 'Priya M.', role: 'SWE @ Google', quote: 'The battle mode and clan system kept me accountable like nothing else. Climbing the ranked ladder made DSA practice genuinely addictive.', avatar: 'PM' },
    { name: 'Rahul K.', role: 'Intern @ Goldman Sachs', quote: 'Company-wise filtering saved me weeks of unfocused practice. I tracked my readiness score and walked into the GS OA genuinely confident.', avatar: 'RK' },
  ];

  return (
    <section className="py-28 relative">
      <GlowDivider />
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <Reveal className="text-center mb-20">
          <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-primary mb-4 font-semibold">From the Arena</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Warriors Who <span className="text-gradient-electric">Made It</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="group rounded-xl border border-border/50 bg-card p-6 h-full flex flex-col transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_25px_hsla(199,100%,50%,0.06)]">
                <div className="flex items-center gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className="h-3.5 w-3.5 text-status-warning fill-status-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-[11px] font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FINAL CTA
   ══════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section id="championship" className="py-36 relative overflow-hidden">
      <GlowDivider />
      <div className="absolute inset-0 grid-pattern opacity-[0.06]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-primary/8 rounded-full blur-[250px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />

      <div className="max-w-3xl mx-auto px-4 relative z-10 text-center pt-12">
        <Reveal>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
            <Rocket className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-heading uppercase tracking-[0.2em] text-primary font-semibold">Your climb starts here</span>
          </span>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-6 leading-[1.05] tracking-tight">
            Enter the<br />
            <span className="text-gradient-electric neon-text">Arena.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Train harder. Rank higher. Walk into interviews knowing you've already been tested under pressure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="arena" size="xl" className="group shadow-neon-strong text-base">
                Start Free
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="arenaOutline" size="xl" className="text-base">
                Explore Challenges
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary/5">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-display text-base font-bold text-gradient-electric">CodeTrackX</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The high-performance coding arena for serious candidates. Practice, compete, climb.
            </p>
            <div className="flex items-center gap-2.5">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="h-8 w-8 rounded-lg bg-secondary/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:shadow-neon transition-all duration-300">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {['DSA Arena', 'OA Arena', 'Live Contests', 'Battle Mode', 'Revision Queue', 'Planner'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Compete</h4>
            <ul className="space-y-2.5">
              {['Challenge Arena', 'Clan Arena', 'Championship', 'Company-wise', 'Leaderboard', 'Hall of Champions'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact Us'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/70">© 2026 CodeTrackX. There is only one #1.</p>
          <p className="text-xs text-muted-foreground/70">Built for the ambitious. Powered by discipline.</p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════
   MAIN LANDING PAGE
   ══════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PremiumNavbar />
      <HeroSection />
      <StatsStrip />
      <ValueProps />
      <HowItWorks />
      <ChallengeArenaShowcase />
      <OAArenaSection />
      <CompetitiveSection />
      <ProgressSection />
      <CompanySection />
      <DifferentiatorSection />
      <TestimonialSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
