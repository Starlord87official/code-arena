import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Code2, Trophy, Flame, Swords, ChevronRight, Zap, Target, BookOpen,
  BarChart3, Shield, Timer, Users, Crown, Cpu, Database,
  Brain, TrendingUp, Calendar, CheckCircle2, Star, ArrowRight,
  Layers, Monitor, Activity, Crosshair, ClipboardCheck,
  Twitter, Github, Linkedin, Mail,
  ChevronDown, Rocket, Menu, X, Eye
} from 'lucide-react';

/* ══════════════════════════════════════════════
   FLOATING PARTICLES CANVAS
   ══════════════════════════════════════════════ */
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number; }
    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() > 0.7 ? 45 : 199,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity * 0.15})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ─── Animated counter ─── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!inView || displayed > 0) return;
    const duration = 1400;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, displayed]);

  return <span ref={ref}>{inView ? displayed : 0}{suffix}</span>;
}

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0, direction = 'up' }: { children: React.ReactNode; className?: string; delay?: number; direction?: 'up' | 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const initial = direction === 'up' ? { opacity: 0, y: 60 } : direction === 'left' ? { opacity: 0, x: -60 } : { opacity: 0, x: 60 };
  const target = { opacity: 1, y: 0, x: 0 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? target : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Tilt card wrapper ─── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Glow line separator ─── */
function GlowDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  return (
    <div ref={ref} className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-border/30" />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent origin-center"
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   NAVBAR (glassmorphism + scroll-aware)
   ══════════════════════════════════════════════ */
function PremiumNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navLinks = ['Features', 'Arenas', 'OA Prep', 'Contests', 'Championship'];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-[0_4px_30px_hsla(0,0%,0%,0.4)]' : ''}`}>
      {/* Top accent line */}
      <div className={`h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-60'}`} />
      <div className={`border-b transition-all duration-500 ${scrolled ? 'border-border/40 bg-background/70 backdrop-blur-2xl backdrop-saturate-150' : 'border-transparent bg-transparent backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Code2 className="h-7 w-7 text-primary relative z-10 group-hover:drop-shadow-[0_0_8px_hsla(199,100%,50%,0.6)] transition-all duration-300" />
              <div className="absolute -inset-2 bg-primary/15 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 group-hover:w-2/3 h-[2px] bg-gradient-to-r from-primary/80 to-accent/80 transition-all duration-400 rounded-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-heading hover:bg-secondary/40">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="arena" size="sm" className="shadow-neon shimmer-sweep">Start Free</Button>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-2xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-heading text-muted-foreground hover:text-primary hover:bg-secondary/30 rounded-md transition-colors">
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
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] flex items-center overflow-hidden pt-16">
      {/* Animated cyber grid */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 cyber-grid-animated" />
      {/* Floor gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-background/60 to-transparent z-[1] pointer-events-none" />
      {/* Orbs */}
      <div className="absolute top-[18%] left-[3%] w-[650px] h-[650px] bg-primary/8 rounded-full blur-[220px] animate-float" />
      <div className="absolute bottom-[5%] right-[3%] w-[550px] h-[550px] bg-accent/6 rounded-full blur-[200px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[8%] right-[20%] w-[350px] h-[350px] bg-neon-purple/6 rounded-full blur-[180px] animate-float" style={{ animationDelay: '6s' }} />
      {/* Gold prestige orb */}
      <div className="absolute bottom-[30%] left-[40%] w-[200px] h-[200px] bg-rank-gold/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }} />

      <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-20 items-center">
          {/* ── LEFT: Copy ── */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
              <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8 glass-card">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[11px] font-heading uppercase tracking-[0.2em] text-primary font-semibold">Private Beta — Now Open</span>
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4.2rem] font-black leading-[1.05] mb-6 tracking-tight"
            >
              <span className="text-foreground">Train Like a</span>
              <br />
              <span className="text-foreground">Contender. </span>
              <span className="text-gradient-electric neon-text inline-block">Compete</span>
              <br />
              <span className="text-foreground">Like a </span>
              <span className="relative inline-block">
                <span className="text-gradient-gold">Champion.</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-rank-gold via-status-warning to-rank-gold rounded-full origin-left"
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
                <Button variant="arena" size="xl" className="group shimmer-sweep shadow-neon-strong">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Training
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>
              <a href="#arenas">
                <Button variant="arenaOutline" size="xl" className="group shimmer-sweep">
                  <Eye className="h-4 w-4 mr-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                  Explore Arena
                </Button>
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
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
                <motion.span
                  key={label}
                  whileHover={{ scale: 1.05, borderColor: 'hsla(199,100%,50%,0.4)' }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-secondary/20 backdrop-blur-sm text-[11px] font-heading text-muted-foreground cursor-default transition-colors duration-300 hover:text-primary"
                >
                  <Icon className="h-3 w-3 text-primary/60" />
                  {label}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Cinematic Product Mockup ── */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-12 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 rounded-3xl blur-3xl pointer-events-none animate-pulse-glow" />

            <TiltCard className="relative">
              {/* Main dashboard card */}
              <div className="glass-card p-6 rounded-2xl shadow-[0_8px_40px_hsla(0,0%,0%,0.4)] relative overflow-hidden">
                {/* Scan line effect */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(var(--foreground)) 3px, hsl(var(--foreground)) 4px)' }} />
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-accent/[0.03] pointer-events-none rounded-2xl" />
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-primary/60 to-transparent" />
                <div className="absolute top-0 left-0 h-8 w-[1px] bg-gradient-to-b from-primary/60 to-transparent" />
                <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-gradient-to-l from-accent/60 to-transparent" />
                <div className="absolute bottom-0 right-0 h-8 w-[1px] bg-gradient-to-t from-accent/60 to-transparent" />

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
                    <div className="flex items-center gap-1 text-status-warning bg-status-warning/10 px-2 py-1 rounded-md border border-status-warning/20">
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
                    { label: 'Solved', value: '347', color: 'text-primary' },
                    { label: 'Win Rate', value: '73%', color: 'text-status-success' },
                    { label: 'Rating', value: '1,847', color: 'text-rank-diamond' },
                    { label: 'OA Score', value: '78%', color: 'text-accent' },
                  ].map(s => (
                    <div key={s.label} className="bg-secondary/30 rounded-lg p-2.5 text-center border border-border/20 backdrop-blur-sm">
                      <p className={`font-display text-base font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mini activity bar */}
                <div className="flex items-end gap-[3px]">
                  <span className="text-[10px] text-muted-foreground font-heading mr-1.5 mb-0.5">24h</span>
                  {[20, 35, 15, 55, 70, 45, 80, 60, 90, 40, 65, 85, 50, 75, 30, 95, 55, 70, 45, 60, 80, 35, 50, 65].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h * 0.22 + 2}px` }}
                      transition={{ delay: 1 + i * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-1 bg-primary/50 rounded-sm hover:bg-primary transition-colors duration-200"
                      style={{ opacity: 0.4 + h / 200 }}
                    />
                  ))}
                </div>
              </div>

              {/* ── Floating: Live Contest ── */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-8 -right-4 w-56"
              >
                <div className="glass-card p-4 rounded-xl shadow-neon relative overflow-hidden">
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
                <div className="glass-card p-3.5 rounded-xl relative overflow-hidden" style={{ borderColor: 'hsla(199, 100%, 60%, 0.15)' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-rank-diamond/5 to-transparent pointer-events-none" />
                  <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rank-diamond/10 flex items-center justify-center border border-rank-diamond/30 rank-aura-diamond">
                      <Crown className="h-5 w-5 text-rank-diamond" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm text-foreground">Diamond III</p>
                      <p className="text-[10px] text-muted-foreground">Top 5% · Rank #247</p>
                      <div className="w-20 h-1 rounded-full bg-secondary mt-1.5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ delay: 1.5, duration: 1 }} className="h-full rounded-full bg-rank-diamond" />
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
                <div className="glass-card p-3.5 rounded-xl relative overflow-hidden" style={{ borderColor: 'hsla(185, 100%, 50%, 0.15)' }}>
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
                          <motion.circle
                            cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5"
                            strokeDasharray="88" strokeLinecap="round"
                            initial={{ strokeDashoffset: 88 }}
                            animate={{ strokeDashoffset: 19 }}
                            transition={{ delay: 2, duration: 1.5, ease: 'easeOut' }}
                          />
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
                <div className="glass-card p-3 rounded-xl" style={{ borderColor: 'hsla(142, 76%, 45%, 0.15)' }}>
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
            </TiltCard>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em] font-heading">Discover</span>
          <ChevronDown className="h-4 w-4 text-primary/50" />
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
    <section className="relative z-10">
      <GlowDivider />
      <div className="bg-secondary/5 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 500, suffix: '+', label: 'Elite Challenges', icon: Code2 },
            { value: 50, suffix: '+', label: 'Company OA Sets', icon: ClipboardCheck },
            { value: 10, suffix: 'K+', label: 'Active Warriors', icon: Users },
            { value: 47, suffix: '', label: 'Weekly Contests', icon: Trophy },
          ].map(({ value, suffix, label, icon: Icon }, i) => (
            <Reveal key={label} delay={i * 0.06} className="text-center">
              <Icon className="h-4 w-4 text-primary/50 mx-auto mb-3" />
              <p className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                <AnimatedNumber value={value} suffix={suffix} />
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5 font-heading uppercase tracking-[0.15em]">{label}</p>
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
    { icon: Swords, title: 'DSA Arena', desc: 'Curated problems across arrays, trees, graphs, DP & more. Difficulty-tagged. Company-filtered. XP-rewarded.' },
    { icon: ClipboardCheck, title: 'OA Arena', desc: 'Timed, scored, integrity-tracked mock OAs. Realistic company-format simulations with post-OA analysis.' },
    { icon: Trophy, title: 'Live Contests', desc: 'Rated weekly contests with ICPC & IOI formats. Real-time leaderboards. Rating impact on every match.' },
    { icon: Target, title: 'Company-wise Prep', desc: 'Amazon, Google, Goldman Sachs — filter by company, role, and pattern. Practice what actually gets asked.' },
    { icon: Zap, title: 'Battle Mode', desc: '1v1 coding duels under real pressure. Solve faster, earn ELO, and prove dominance in real-time matchups.' },
    { icon: Users, title: 'Clan Arena', desc: 'Build your squad. Compete in clan wars, complete weekly quests, and dominate the collective leaderboard.' },
    { icon: Crown, title: 'Championship', desc: 'Seasonal qualifiers, global standings, and the Hall of Champions. The ultimate competitive endgame.' },
    { icon: BookOpen, title: 'Revision + Planner', desc: 'Spaced repetition revision queue, daily targets, and a personal planner to weaponize your consistency.' },
  ];

  return (
    <section id="features" className="py-28 relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/[0.03] rounded-full blur-[250px] pointer-events-none" />
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
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group relative rounded-xl border border-border/40 glass-card p-6 h-full overflow-hidden"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-600" />
                {/* Hover corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsla(199,100%,50%,0.2)] transition-all duration-400">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
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
    <section className="py-28 relative overflow-hidden z-10">
      <GlowDivider />
      <div className="absolute inset-0 cyber-grid-animated opacity-[0.03]" />
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
                {i < 3 && <div className="hidden md:block absolute top-12 left-[calc(100%+4px)] w-[calc(100%-8px)] h-px z-0">
                  <div className="h-full bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary/30" />
                </div>}

                <motion.div
                  whileHover={{ y: -3 }}
                  className="relative z-10 rounded-xl border border-border/40 glass-card p-6 h-full"
                >
                  <span className="font-display text-4xl font-black text-primary/8 group-hover:text-primary/15 transition-colors duration-500 block mb-3">{s.num}</span>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:shadow-neon transition-all duration-300">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
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
    { icon: Code2, title: 'DSA', desc: 'Arrays, Trees, Graphs, DP, Greedy, Backtracking — full topic coverage.', problems: '300+' },
    { icon: Layers, title: 'System Design', desc: 'Scalable systems, load balancers, caches — real HLD rounds.', problems: '50+' },
    { icon: Cpu, title: 'Low Level Design', desc: 'OOP, SOLID, design patterns, class modeling challenges.', problems: '40+' },
    { icon: Monitor, title: 'Machine Coding', desc: 'Build working apps under timed pressure. Frontend & backend.', problems: '30+' },
    { icon: Database, title: 'SQL', desc: 'Complex queries, window functions, optimization challenges.', problems: '80+' },
  ];

  return (
    <section id="arenas" className="py-28 relative z-10">
      <GlowDivider />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.03] rounded-full blur-[200px] pointer-events-none" />
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
              <motion.div
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                className="group relative rounded-xl border border-border/40 glass-card p-6 text-center h-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_25px_hsla(199,100%,50%,0.2)] transition-all duration-400">
                    <a.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{a.title}</h3>
                  <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{a.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                    {a.problems} problems
                  </span>
                </div>
              </motion.div>
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
    <section id="oa-prep" className="py-28 relative overflow-hidden z-10">
      <GlowDivider />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-accent mb-4 font-semibold">OA Arena</p>
            <h2 className="font-display text-3xl md:text-5xl font-black text-foreground mb-5 leading-tight tracking-tight">
              Not Practice.<br /><span className="text-gradient-electric">Preparation.</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Simulate company-grade online assessments under real pressure. Timed sections, scored results, integrity monitoring, and detailed post-OA breakdowns.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: Timer, label: 'Timed Sections', desc: 'Real exam pressure' },
                { icon: BarChart3, label: 'Score Analysis', desc: 'Post-OA breakdown' },
                { icon: Shield, label: 'Integrity Monitor', desc: 'Tab-switch tracking' },
                { icon: Target, label: 'Company Formats', desc: 'Amazon, Google, GS' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-lg glass-card border-border/30 hover:border-accent/30 transition-all duration-300">
                  <Icon className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/oa">
              <Button variant="arena" size="lg" className="group shadow-neon shimmer-sweep">
                Enter OA Arena
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Button>
            </Link>
          </Reveal>

          <Reveal direction="right" delay={0.15}>
            <TiltCard>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-accent/8 via-transparent to-primary/5 rounded-3xl blur-2xl pointer-events-none" />
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden shadow-[0_8px_40px_hsla(0,0%,0%,0.3)]" style={{ borderColor: 'hsla(185, 100%, 50%, 0.12)' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent pointer-events-none" />
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full glass-card text-[10px] font-heading uppercase tracking-widest text-accent font-semibold" style={{ borderColor: 'hsla(185, 100%, 50%, 0.2)' }}>
                    Mock OA — Amazon SDE
                  </div>
                  <div className="relative mt-5 space-y-3.5">
                    <div className="flex items-center justify-between pb-3 border-b border-border/30">
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
                      { label: 'Q3 — Graph Shortest Path', status: 'Locked', color: 'text-muted-foreground', bg: 'bg-secondary/30', icon: Eye },
                    ].map(q => (
                      <div key={q.label} className={`flex items-center justify-between p-3 rounded-lg ${q.bg} border border-border/20`}>
                        <div className="flex items-center gap-2">
                          <q.icon className={`h-3.5 w-3.5 ${q.color}`} />
                          <span className="text-sm text-foreground">{q.label}</span>
                        </div>
                        <span className={`text-[11px] font-heading font-semibold ${q.color}`}>{q.status}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <span className="text-xs text-muted-foreground font-heading">Current Score</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-xl font-bold text-primary neon-text">145</span>
                        <span className="text-xs text-muted-foreground font-heading">/ 300</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   COMPETITIVE SECTION (Gold accents for Championship)
   ══════════════════════════════════════════════ */
function CompetitiveSection() {
  const items = [
    { icon: Trophy, title: 'Live Contests', desc: 'Weekly rated contests with ICPC/IOI formats. Real-time standings. Rating on the line.', color: 'text-primary', badge: 'RATED', badgeStyle: 'text-primary bg-primary/10 border-primary/20', gold: false },
    { icon: Swords, title: 'Battle Mode', desc: '1v1 coding duels. Solve faster, outthink your opponent, earn ELO. Real-time pressure.', color: 'text-accent', badge: 'REAL-TIME', badgeStyle: 'text-accent bg-accent/10 border-accent/20', gold: false },
    { icon: Users, title: 'Clan Arena', desc: 'Build your squad. Clan wars, weekly quests, collective XP. Lead or be carried.', color: 'text-status-warning', badge: 'TEAM', badgeStyle: 'text-status-warning bg-status-warning/10 border-status-warning/20', gold: false },
    { icon: Crown, title: 'Championship', desc: 'Seasonal qualifiers, global standings, and the Hall of Champions. The ultimate endgame.', color: 'text-rank-gold', badge: 'PRESTIGE', badgeStyle: 'text-rank-gold bg-rank-gold/10 border-rank-gold/20', gold: true },
  ];

  return (
    <section id="contests" className="py-28 relative z-10">
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
              <motion.div
                whileHover={{ y: -4 }}
                className={`group relative rounded-xl border border-border/40 glass-card p-7 h-full overflow-hidden ${item.gold ? 'shimmer-gold' : ''}`}
              >
                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${item.gold ? 'via-rank-gold/50' : 'via-primary/40'} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-600`} />
                {/* Gold corner glow for championship */}
                {item.gold && <div className="absolute top-0 right-0 w-32 h-32 bg-rank-gold/8 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2" />}

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`h-12 w-12 rounded-xl bg-secondary/40 border border-border/40 flex items-center justify-center ${item.color} group-hover:scale-110 ${item.gold ? 'group-hover:shadow-[0_0_20px_hsla(45,90%,55%,0.25)]' : 'group-hover:shadow-neon'} transition-all duration-300`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-heading uppercase tracking-wider border font-semibold ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className={`font-heading font-bold text-xl text-foreground mb-2 transition-colors duration-300 ${item.gold ? 'group-hover:text-rank-gold' : 'group-hover:text-primary'}`}>{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
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
    <section className="py-28 relative overflow-hidden z-10">
      <GlowDivider />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <div className="space-y-4">
              <div className="glass-card p-5 rounded-xl border-border/40">
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
                  <motion.div key={s.label} whileHover={{ scale: 1.05 }} className="glass-card p-3 rounded-lg text-center border-border/30">
                    <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                    <p className={`font-display text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="glass-card p-4 rounded-xl border-border/30">
                <p className="text-[10px] font-heading text-muted-foreground uppercase tracking-wider mb-3 font-semibold">52-Week Activity</p>
                <div className="flex gap-[3px] flex-wrap">
                  {Array.from({ length: 52 }, (_, i) => {
                    const seed = (i * 7 + 13) % 100;
                    const bg = seed > 75 ? 'bg-primary' : seed > 50 ? 'bg-primary/50' : seed > 25 ? 'bg-primary/20' : 'bg-secondary/40';
                    return <div key={i} className={`h-3 w-3 rounded-[2px] ${bg} hover:scale-125 transition-transform duration-200`} />;
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.12}>
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
                <div key={text} className="flex items-start gap-3 group/item">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:shadow-neon group-hover/item:border-primary/40 transition-all duration-300">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed group-hover/item:text-foreground/80 transition-colors duration-300">{text}</span>
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
    <section className="py-28 relative z-10">
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
              <motion.div whileHover={{ y: -3 }} className="group glass-card rounded-xl border-border/40 p-5 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-sm font-bold text-primary group-hover:scale-110 group-hover:shadow-neon transition-all duration-300">
                    {c.name[0]}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors duration-300">{c.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{c.count}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-secondary/40 text-muted-foreground border border-border/30 font-heading">{tag}</span>
                  ))}
                </div>
              </motion.div>
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
    { feature: 'Static Problem Practice', generic: true },
    { feature: 'Realistic OA Simulations', generic: false },
    { feature: 'Competitive Rating Ladder', generic: false },
    { feature: 'Live 1v1 Battle Mode', generic: false },
    { feature: 'Clan Team Competition', generic: false },
    { feature: 'Championship Ecosystem', generic: false },
    { feature: 'Smart Revision System', generic: false },
    { feature: 'Interview Readiness Score', generic: false },
    { feature: 'Company-wise Targeting', generic: false },
  ];

  return (
    <section className="py-28 relative z-10">
      <GlowDivider />
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <Reveal className="text-center mb-16">
          <p className="text-[11px] font-heading uppercase tracking-[0.35em] text-primary mb-4 font-semibold">The Difference</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Beyond <span className="text-gradient-electric">Generic Practice</span>
          </h2>
        </Reveal>

        <Reveal>
          <div className="glass-card rounded-xl overflow-hidden border-border/40">
            <div className="grid grid-cols-3 p-4 border-b border-border/30 bg-secondary/10">
              <span className="text-sm font-heading font-bold text-foreground">Capability</span>
              <span className="text-sm font-heading text-muted-foreground text-center">Others</span>
              <span className="text-sm font-heading text-primary text-center font-bold">CodeTrackX</span>
            </div>
            {rows.map((row, i) => (
              <motion.div
                key={row.feature}
                whileHover={{ backgroundColor: 'hsla(222, 47%, 12%, 0.5)' }}
                className={`grid grid-cols-3 p-4 items-center group transition-colors ${i < rows.length - 1 ? 'border-b border-border/15' : ''}`}
              >
                <span className="text-sm text-foreground/90">{row.feature}</span>
                <div className="flex justify-center">
                  {row.generic ? (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" />
                  ) : (
                    <X className="h-4 w-4 text-destructive/30" />
                  )}
                </div>
                <div className="flex justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary group-hover:drop-shadow-[0_0_8px_hsla(199,100%,50%,0.6)] transition-all duration-300" />
                </div>
              </motion.div>
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
    <section className="py-28 relative z-10">
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
              <motion.div
                whileHover={{ y: -4 }}
                className="group glass-card rounded-xl border-border/40 p-6 h-full flex flex-col"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className="h-3.5 w-3.5 text-status-warning fill-status-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-[11px] font-bold text-primary group-hover:shadow-neon transition-all duration-300">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FINAL CTA (Gold championship accent)
   ══════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section id="championship" className="py-36 relative overflow-hidden z-10">
      <GlowDivider />
      <div className="absolute inset-0 cyber-grid-animated opacity-[0.04]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-primary/6 rounded-full blur-[250px] pointer-events-none" />
      {/* Gold prestige glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-rank-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />

      <div className="max-w-3xl mx-auto px-4 relative z-10 text-center pt-12">
        <Reveal>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rank-gold/30 bg-rank-gold/5 backdrop-blur-sm mb-8">
            <Crown className="h-3.5 w-3.5 text-rank-gold" />
            <span className="text-[11px] font-heading uppercase tracking-[0.2em] text-rank-gold font-semibold">Your climb starts here</span>
          </span>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-6 leading-[1.05] tracking-tight">
            Enter the<br />
            <span className="text-gradient-gold neon-text" style={{ textShadow: '0 0 30px hsla(45, 90%, 55%, 0.4), 0 0 60px hsla(45, 90%, 55%, 0.2)' }}>Arena.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Train harder. Rank higher. Walk into interviews knowing you've already been tested under pressure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="arena" size="xl" className="group shadow-neon-strong shimmer-sweep text-base">
                Start Free
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="arenaOutline" size="xl" className="text-base shimmer-sweep">
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
    <footer className="border-t border-border/30 bg-secondary/5 relative z-10">
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
                <motion.a key={i} href="#" whileHover={{ scale: 1.1 }} className="h-8 w-8 rounded-lg glass-card border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:shadow-neon transition-all duration-300">
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {['DSA Arena', 'OA Arena', 'Live Contests', 'Battle Mode', 'Revision Queue', 'Planner'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Compete</h4>
            <ul className="space-y-2.5">
              {['Challenge Arena', 'Clan Arena', 'Championship', 'Company-wise', 'Leaderboard', 'Hall of Champions'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact Us'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">© 2026 CodeTrackX. There is only one #1.</p>
          <p className="text-xs text-muted-foreground/60">Built for the ambitious. Powered by discipline.</p>
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
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <FloatingParticles />
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
