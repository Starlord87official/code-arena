import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Code2, Trophy, Flame, Swords, ChevronRight, Zap, Target, BookOpen,
  BarChart3, Shield, Timer, Users, Crown, Cpu, GitBranch, Database,
  Brain, TrendingUp, Calendar, CheckCircle2, Star, ArrowRight,
  Layers, Monitor, Award, Activity, Crosshair, ClipboardCheck,
  Sparkles, Radio, Globe, Twitter, Github, Linkedin, Mail,
  ChevronDown, Play, Eye, Lock, Rocket, Medal
} from 'lucide-react';

/* ─── scroll-reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── SECTION: Premium Navbar ─── */
function PremiumNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Code2 className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold text-gradient-electric">CodeTrackX</span>
        </Link>
        <div className="hidden lg:flex items-center gap-1">
          {['Features', 'Arenas', 'OA Prep', 'Contests', 'Championship', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary/50">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="arena" size="sm">Start Free</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── SECTION: Hero ─── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* bg layers */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/3 left-[10%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[180px] animate-float" />
      <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[15%] right-[30%] w-[200px] h-[200px] bg-neon-purple/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '5s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT: Copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
              <Radio className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-xs font-heading uppercase tracking-widest text-primary">Private Beta — Now Open</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] mb-6">
              <span className="text-foreground">Crack OAs.</span>
              <br />
              <span className="text-foreground">Climb the </span>
              <span className="text-gradient-electric neon-text">Arena.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              The competitive coding platform for serious candidates. Practice company-wise DSA, simulate real OAs, battle opponents in real-time, and climb through ranks — all in one elite system.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-wrap gap-4 mb-10">
              <Link to="/register">
                <Button variant="arena" size="xl" className="group">
                  Start Training
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="arenaOutline" size="xl">
                  Explore Arena
                </Button>
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="flex flex-wrap gap-2">
              {[
                { icon: Swords, label: 'DSA Arena' },
                { icon: ClipboardCheck, label: 'OA Arena' },
                { icon: Trophy, label: 'Contests' },
                { icon: Zap, label: 'Battle Mode' },
                { icon: Users, label: 'Clan System' },
                { icon: Crown, label: 'Championship' },
                { icon: BookOpen, label: 'Revision Queue' },
                { icon: Target, label: 'Company-wise' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-xs font-heading text-muted-foreground">
                  <Icon className="h-3 w-3 text-primary" />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Product Mockup */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative hidden lg:block">
            <div className="relative">
              {/* Main dashboard card */}
              <div className="arena-card p-5 rounded-2xl border border-border/80 shadow-arena">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm text-foreground">Dashboard</p>
                    <p className="text-xs text-muted-foreground">Level 24 · Diamond III</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-status-warning">
                    <Flame className="h-4 w-4" />
                    <span className="font-display text-sm font-bold">47</span>
                  </div>
                </div>
                {/* XP bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>XP Progress</span>
                    <span className="text-primary">8,420 / 10,000</span>
                  </div>
                  <div className="xp-bar"><div className="xp-bar-fill" style={{ width: '84%' }} /></div>
                </div>
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Solved', value: '347', color: 'text-primary' },
                    { label: 'Win Rate', value: '73%', color: 'text-status-success' },
                    { label: 'Rating', value: '1,847', color: 'text-rank-diamond' },
                  ].map(s => (
                    <div key={s.label} className="bg-secondary/50 rounded-lg p-2.5 text-center">
                      <p className={`font-display text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating contest card */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-6 -right-6 arena-card p-3.5 rounded-xl border border-primary/30 shadow-neon w-52">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                  <span className="text-[10px] font-heading uppercase tracking-widest text-status-success">Live Contest</span>
                </div>
                <p className="font-heading font-bold text-sm text-foreground mb-1">Weekly Arena #47</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3 text-primary" />
                  <span>01:23:45 remaining</span>
                </div>
              </motion.div>

              {/* Floating rank card */}
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute -bottom-4 -left-8 arena-card p-3 rounded-xl border border-rank-diamond/30 w-48">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-rank-diamond/20 flex items-center justify-center rank-aura-diamond">
                    <Crown className="h-4 w-4 text-rank-diamond" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-xs text-foreground">Diamond III</p>
                    <p className="text-[10px] text-muted-foreground">Top 5% — Rank #247</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating OA card */}
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute top-1/2 -right-10 arena-card p-3 rounded-xl border border-accent/30 w-44">
                <div className="flex items-center gap-2 mb-1.5">
                  <ClipboardCheck className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[10px] font-heading uppercase tracking-widest text-accent">OA Ready</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10">
                    <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-display text-[10px] font-bold text-accent">78%</span>
                  </div>
                  <div>
                    <p className="font-heading text-xs font-bold text-foreground">Interview Ready</p>
                    <p className="text-[10px] text-muted-foreground">12 OAs completed</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4 text-primary" />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── SECTION: Stats strip ─── */
function StatsStrip() {
  return (
    <section className="border-y border-border/50 bg-secondary/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: '500+', label: 'DSA Challenges', icon: Code2 },
          { value: '50+', label: 'Company OA Sets', icon: ClipboardCheck },
          { value: '10K+', label: 'Active Warriors', icon: Users },
          { value: 'Weekly', label: 'Live Contests', icon: Trophy },
        ].map(({ value, label, icon: Icon }) => (
          <Reveal key={label} className="text-center">
            <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="font-display text-2xl md:text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── SECTION: Value Props ─── */
function ValueProps() {
  const features = [
    { icon: Swords, title: 'DSA Arena', desc: 'Hundreds of curated problems across arrays, trees, graphs, DP, and more. Difficulty-tagged, company-filtered, XP-rewarded.' },
    { icon: ClipboardCheck, title: 'OA Arena', desc: 'Timed, scored, integrity-tracked mock OAs. Simulate real company assessments with sectioned formats and post-OA analysis.' },
    { icon: Trophy, title: 'Live Contests', desc: 'Weekly rated contests with real-time leaderboards. ICPC & IOI formats. Climb the rating ladder.' },
    { icon: Target, title: 'Company-wise Prep', desc: 'Filter problems by Amazon, Google, Goldman Sachs, and more. Role-relevant, pattern-focused preparation.' },
    { icon: Zap, title: 'Battle Mode', desc: 'Challenge opponents to 1v1 coding duels. Solve under pressure, earn ELO, prove your skill in real-time.' },
    { icon: Users, title: 'Clan Arena', desc: 'Form squads, compete in clan wars, earn collective XP. Build your team, dominate the leaderboard.' },
    { icon: Crown, title: 'Championship', desc: 'Seasonal championship events with qualifiers, standings, and Hall of Champions. Earn your crown.' },
    { icon: BookOpen, title: 'Revision + Planner', desc: 'Smart revision queue, spaced repetition, daily targets, and a personal planner to structure your grind.' },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-heading uppercase tracking-[0.3em] text-primary mb-3">Everything You Need</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Forge Your <span className="text-gradient-electric">Legend</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">One platform that replaces scattered tools with a unified competitive system for interview domination.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="arena-card p-6 rounded-xl h-full group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-neon transition-all duration-300">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: How It Works ─── */
function HowItWorks() {
  const steps = [
    { num: '01', icon: Crosshair, title: 'Choose Your Arena', desc: 'Pick from DSA, OA, Contests, Battles, or Company-wise modules.' },
    { num: '02', icon: Brain, title: 'Train with Structure', desc: 'Follow skill-tree roadmaps, daily targets, and guided revision paths.' },
    { num: '03', icon: Swords, title: 'Compete Under Pressure', desc: 'Battle opponents, join live contests, and simulate real OAs with time constraints.' },
    { num: '04', icon: TrendingUp, title: 'Track & Climb', desc: 'Earn XP, maintain streaks, climb divisions, and track your interview readiness.' },
  ];

  return (
    <section className="py-24 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-heading uppercase tracking-[0.3em] text-primary mb-3">The System</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            How <span className="text-gradient-electric">It Works</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.1}>
              <div className="relative group">
                {i < 3 && <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent z-0" />}
                <div className="arena-card p-6 rounded-xl relative z-10 h-full">
                  <span className="font-display text-3xl font-black text-primary/20 mb-2 block">{s.num}</span>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:shadow-neon transition-all">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: Challenge Arena Showcase ─── */
function ChallengeArenaShowcase() {
  const arenas = [
    { icon: Code2, title: 'DSA', desc: 'Arrays, Trees, Graphs, DP, Greedy, Backtracking — full coverage.', problems: '300+' },
    { icon: Layers, title: 'System Design', desc: 'Design scalable systems, load balancers, caches, and databases.', problems: '50+' },
    { icon: Cpu, title: 'Low Level Design', desc: 'Object-oriented design, SOLID, design patterns, class modeling.', problems: '40+' },
    { icon: Monitor, title: 'Machine Coding', desc: 'Build working apps in timed sessions. Frontend & backend rounds.', problems: '30+' },
    { icon: Database, title: 'SQL', desc: 'Complex queries, joins, window functions, optimization challenges.', problems: '80+' },
  ];

  return (
    <section id="arenas" className="py-24 border-t border-border/50 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-heading uppercase tracking-[0.3em] text-primary mb-3">Challenge Arena</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Focused Skill <span className="text-gradient-electric">Paths</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Every arena is mapped to real interview rounds. Topic-level progression with XP rewards and rank impact.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {arenas.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.08}>
              <div className="arena-card p-6 rounded-xl text-center group h-full relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-primary/10 to-transparent" />
                <div className="relative z-10">
                  <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-neon transition-all duration-300 border border-primary/20">
                    <a.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{a.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-heading text-primary bg-primary/10 px-2.5 py-1 rounded-full">
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

/* ─── SECTION: OA Arena ─── */
function OAArenaSection() {
  return (
    <section id="oa-prep" className="py-24 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-primary/[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-xs font-heading uppercase tracking-[0.3em] text-accent mb-3">OA Arena</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Not Practice.<br /><span className="text-gradient-electric">Preparation.</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Simulate company-grade online assessments with real pressure. Timed sections, scored results, integrity monitoring, and detailed post-OA analysis.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Timer, label: 'Timed Sections', desc: 'Real time pressure' },
                { icon: BarChart3, label: 'Detailed Reports', desc: 'Post-OA analysis' },
                { icon: Shield, label: 'Integrity Tracking', desc: 'Tab-switch monitoring' },
                { icon: Target, label: 'Company Formats', desc: 'Amazon, Google, etc.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <Icon className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/oa">
              <Button variant="arena" size="lg" className="group">
                Enter OA Arena
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="arena-card p-6 rounded-2xl border border-accent/20 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-[10px] font-heading uppercase tracking-widest text-accent">
                Mock OA — Amazon SDE
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-sm font-heading text-foreground">Section 2 of 3</span>
                  </div>
                  <span className="font-display text-sm font-bold text-destructive">00:34:12</span>
                </div>
                {/* Problem items */}
                {[
                  { label: 'Q1 — Two Sum Variant', status: 'Accepted', color: 'text-status-success' },
                  { label: 'Q2 — LRU Cache Design', status: 'In Progress', color: 'text-status-warning' },
                  { label: 'Q3 — Graph Shortest Path', status: 'Locked', color: 'text-muted-foreground' },
                ].map(q => (
                  <div key={q.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <span className="text-sm text-foreground">{q.label}</span>
                    <span className={`text-xs font-heading ${q.color}`}>{q.status}</span>
                  </div>
                ))}
                {/* Score preview */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Current Score</span>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-primary">145</span>
                    <span className="text-xs text-muted-foreground">/ 300</span>
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

/* ─── SECTION: Contests + Battle + Clans ─── */
function CompetitiveSection() {
  const items = [
    { icon: Trophy, title: 'Live Contests', desc: 'Weekly rated contests with ICPC/IOI formats, real-time leaderboards, and rating impact.', color: 'text-primary', badge: 'RATED' },
    { icon: Swords, title: 'Battle Mode', desc: '1v1 coding duels. Solve faster, earn ELO, and prove your dominance under pressure.', color: 'text-accent', badge: 'REAL-TIME' },
    { icon: Users, title: 'Clan Arena', desc: 'Form your squad. Compete in clan wars, complete weekly quests, and climb the clan leaderboard.', color: 'text-status-warning', badge: 'TEAM' },
    { icon: Crown, title: 'Championship', desc: 'Seasonal qualifiers, standings, and Hall of Champions. The ultimate competitive test.', color: 'text-rank-legend', badge: 'PRESTIGE' },
  ];

  return (
    <section id="contests" className="py-24 border-t border-border/50 relative">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-heading uppercase tracking-[0.3em] text-status-warning mb-3">Competitive Systems</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Not Just Solo. <span className="text-gradient-electric">Compete.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Real-time competition systems that push your limits and earn you prestige.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="arena-card p-6 rounded-xl group relative overflow-hidden h-full">
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-heading uppercase tracking-wider bg-secondary text-muted-foreground border border-border/50">
                  {item.badge}
                </div>
                <div className={`h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: Progress / Gamification ─── */
function ProgressSection() {
  return (
    <section className="py-24 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-accent/[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Visual */}
          <Reveal>
            <div className="space-y-4">
              {/* Rank card */}
              <div className="arena-card p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-heading font-bold text-foreground">Division Progress</h4>
                  <span className="text-xs font-heading text-rank-diamond bg-rank-diamond/10 px-2 py-1 rounded-full">Diamond III</span>
                </div>
                <div className="xp-bar-intense mb-2"><div className="xp-bar-fill" style={{ width: '72%' }} /></div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1,847 RP</span>
                  <span>2,000 RP — Diamond II</span>
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Flame, label: 'Streak', value: '47d', color: 'text-status-warning' },
                  { icon: Zap, label: 'XP', value: '24.5K', color: 'text-primary' },
                  { icon: Star, label: 'Level', value: '24', color: 'text-rank-gold' },
                  { icon: Target, label: 'Goals', value: '3/4', color: 'text-status-success' },
                ].map(s => (
                  <div key={s.label} className="arena-card p-3 rounded-lg text-center">
                    <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                    <p className={`font-display text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Heatmap snippet */}
              <div className="arena-card p-4 rounded-xl">
                <p className="text-xs font-heading text-muted-foreground uppercase tracking-wider mb-3">Activity Heatmap</p>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 52 }, (_, i) => {
                    const intensity = Math.random();
                    const bg = intensity > 0.7 ? 'bg-primary' : intensity > 0.4 ? 'bg-primary/50' : intensity > 0.15 ? 'bg-primary/20' : 'bg-secondary';
                    return <div key={i} className={`h-3 w-3 rounded-sm ${bg}`} />;
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: Copy */}
          <Reveal delay={0.15}>
            <p className="text-xs font-heading uppercase tracking-[0.3em] text-primary mb-3">Gamified Progression</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              See Your Grind.<br /><span className="text-gradient-electric">Track Your Climb.</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Every session moves your rank. XP, streaks, divisions, heatmaps, revision queues, and readiness scores — your preparation becomes a visible, trackable system.
            </p>
            <div className="space-y-4">
              {[
                { icon: TrendingUp, text: 'Division system from Bronze to Legend' },
                { icon: Flame, text: 'Daily streak tracking with fire indicators' },
                { icon: BookOpen, text: 'Smart revision queue with spaced repetition' },
                { icon: BarChart3, text: 'Interview readiness score across all areas' },
                { icon: Calendar, text: 'Personal planner with daily targets' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: Company-wise ─── */
function CompanySection() {
  const companies = [
    { name: 'Amazon', tags: ['DSA', 'System Design', 'Leadership'] },
    { name: 'Google', tags: ['DSA', 'Graphs', 'Dynamic Programming'] },
    { name: 'Goldman Sachs', tags: ['DSA', 'SQL', 'Arrays'] },
    { name: 'Microsoft', tags: ['DSA', 'Trees', 'System Design'] },
    { name: 'Meta', tags: ['DSA', 'Graphs', 'Strings'] },
    { name: 'Apple', tags: ['DSA', 'Arrays', 'Linked Lists'] },
  ];

  return (
    <section className="py-24 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-heading uppercase tracking-[0.3em] text-primary mb-3">Company-Wise Prep</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Train for <span className="text-gradient-electric">Your Target</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Filter problems by company, role, and pattern. Practice what actually gets asked.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <div className="arena-card p-5 rounded-xl group h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-display text-sm font-bold text-primary border border-primary/20">
                    {c.name[0]}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">Company-wise Problem Set</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded bg-secondary text-muted-foreground border border-border/50">{tag}</span>
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

/* ─── SECTION: Differentiator / Comparison ─── */
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
    <section className="py-24 border-t border-border/50 relative">
      <div className="max-w-4xl mx-auto px-4">
        <Reveal className="text-center mb-12">
          <p className="text-xs font-heading uppercase tracking-[0.3em] text-primary mb-3">Why CodeTrackX</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Beyond <span className="text-gradient-electric">Generic Practice</span>
          </h2>
        </Reveal>

        <Reveal>
          <div className="arena-card rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 p-4 border-b border-border/50 bg-secondary/30">
              <span className="text-sm font-heading font-bold text-foreground">Feature</span>
              <span className="text-sm font-heading text-muted-foreground text-center">Generic Platforms</span>
              <span className="text-sm font-heading text-primary text-center">CodeTrackX</span>
            </div>
            {rows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 p-4 ${i < rows.length - 1 ? 'border-b border-border/30' : ''}`}>
                <span className="text-sm text-foreground">{row.feature}</span>
                <div className="flex justify-center">
                  {row.generic ? (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="flex justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── SECTION: Testimonials ─── */
function TestimonialSection() {
  const testimonials = [
    { name: 'Arjun S.', role: 'SDE Intern @ Amazon', quote: 'CodeTrackX replaced 4 different tools for me. The OA simulations and revision system are what got me through Amazon\'s OA in one shot.', avatar: 'AS' },
    { name: 'Priya M.', role: 'SWE @ Google', quote: 'The battle mode and clan system kept me accountable like nothing else. Climbing the ranked ladder made DSA practice genuinely addictive.', avatar: 'PM' },
    { name: 'Rahul K.', role: 'Intern @ Goldman Sachs', quote: 'Company-wise filtering saved me weeks. I practiced exactly what Goldman asks, tracked my readiness score, and walked into the OA confident.', avatar: 'RK' },
  ];

  return (
    <section className="py-24 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-heading uppercase tracking-[0.3em] text-primary mb-3">From the Arena</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Warriors Who <span className="text-gradient-electric">Climbed</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="arena-card p-6 rounded-xl h-full flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className="h-3.5 w-3.5 text-status-warning fill-status-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-display text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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

/* ─── SECTION: Final CTA ─── */
function FinalCTA() {
  return (
    <section className="py-32 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <Rocket className="h-3 w-3 text-primary" />
            <span className="text-xs font-heading uppercase tracking-widest text-primary">Your climb starts now</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
            Enter the<br /><span className="text-gradient-electric neon-text">Arena.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Train harder. Rank higher. Get interview-ready with the most competitive coding platform built for serious candidates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="arena" size="xl" className="group">
                Start Free
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="arenaOutline" size="xl">
                Explore Challenges
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── SECTION: Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-display text-base font-bold text-gradient-electric">CodeTrackX</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The competitive coding platform for serious candidates. Practice, compete, climb.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Features</h4>
            <ul className="space-y-2.5">
              {['DSA Arena', 'OA Arena', 'Live Contests', 'Battle Mode', 'Revision Queue', 'Planner'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Arenas */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Arenas</h4>
            <ul className="space-y-2.5">
              {['Challenge Arena', 'Clan Arena', 'Championship', 'Company-wise', 'Leaderboard', 'Hall of Champions'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact Us'].map(l => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 CodeTrackX. There is only one #1.</p>
          <p className="text-xs text-muted-foreground">Built for the ambitious. Powered by discipline.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN LANDING PAGE ─── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
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
