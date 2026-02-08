import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Timer, BarChart3, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function OAHeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12"
    >
      {/* Glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <span className="text-xs font-heading uppercase tracking-widest text-primary">
            OA Arena
          </span>
        </div>

        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          Train for Real OAs.{' '}
          <span className="text-primary">Timed. Scored. Reviewed.</span>
        </h1>

        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mb-8">
          Simulate company-grade online assessments with real pressure, sectioned formats,
          integrity monitoring, and detailed post-OA analysis. Not practice — preparation.
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/oa/packs">
            <Button variant="arena" size="lg">
              Start a Mock OA
            </Button>
          </Link>
          <Link to="/oa/history">
            <Button variant="arenaOutline" size="lg">
              View History
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <span>Timed Sections</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Detailed Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Integrity Tracking</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
