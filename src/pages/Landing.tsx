import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Code2, Trophy, Flame, Swords, ChevronRight, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-float" style={{ animationDelay: '3s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
              <Code2 className="h-12 w-12 text-primary" />
              <span className="font-display text-4xl font-bold text-gradient-electric">CodeTrackX</span>
              <span className="text-sm text-muted-foreground">(Private Beta)</span>
            </div>

            {/* Tagline */}
            <p className="font-heading text-primary uppercase tracking-[0.3em] text-sm mb-6 animate-fade-in delay-100">
              The Competitive Coding Arena
            </p>

            {/* Main Headline */}
            <h1 className="font-display text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in delay-200">
              <span className="text-foreground">There is only</span>
              <br />
              <span className="text-gradient-electric neon-text">ONE #1</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in delay-300">
              Enter the arena. Compete against elite coders. Climb the divisions. 
              Prove your ego is worthy of the top.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-400">
              <Link to="/register">
                <Button variant="arena" size="xl" className="group">
                  Enter the Arena
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="arenaOutline" size="xl">
                  Return to Battle
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in delay-500">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-primary neon-text">500+</p>
                <p className="text-sm text-muted-foreground mt-1">Challenges</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-accent neon-text-cyan">10K+</p>
                <p className="text-sm text-muted-foreground mt-1">Warriors</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-status-warning">Weekly</p>
                <p className="text-sm text-muted-foreground mt-1">Contests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">
            Forge Your <span className="text-gradient-electric">Legend</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Swords, title: 'Challenge Arena', desc: 'Hundreds of DSA challenges. Easy to Extreme.' },
              { icon: Trophy, title: 'Division System', desc: 'Climb from Bronze to Legend. Prove your rank.' },
              { icon: Flame, title: 'Streak System', desc: 'Daily discipline. Break the streak, lose the fire.' },
              { icon: Zap, title: 'Live Contests', desc: 'Weekly battles. Real-time competition.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="arena-card p-6 rounded-xl text-center group">
                <div className="h-14 w-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to <span className="text-gradient-electric">Compete?</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              The arena awaits. Join thousands of coders pushing their limits every day.
            </p>
            <Link to="/register">
              <Button variant="arena" size="xl">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 CodeTrackX. There is only one #1.</p>
        </div>
      </footer>
    </div>
  );
}
