import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Target, 
  Calendar, 
  Shield, 
  ArrowRight, 
  Zap,
  Clock,
  Trophy,
  CheckCircle2
} from 'lucide-react';
import { useMyTrainingCard } from '@/hooks/usePartnerData';
import { useAuth } from '@/contexts/AuthContext';
import PartnerMatches from './PartnerMatches';

const PartnerLanding = () => {
  const { user } = useAuth();
  const { data: myCard, isLoading } = useMyTrainingCard();

  // While checking if user has a training card, show loading
  if (user && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // If user has an active training card, show matches view directly
  if (user && myCard) {
    return <PartnerMatches embedded />;
  }

  // Otherwise show the hero landing page
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-primary/50 bg-primary/5">
              <Shield className="w-3.5 h-3.5 mr-2" />
              Structured Training System
            </Badge>
            
            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Find a serious partner.
              <br />
              <span className="text-primary">Lock in for 7 days.</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Structured training. Accountability. Weekly trials.
              <br className="hidden sm:block" />
              No random DMs. No low-effort connections.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 shadow-neon">
                <Link to="/partner/training-card">
                  <Target className="w-5 h-5 mr-2" />
                  Create Training Card
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/partner/matches">
                  <Users className="w-5 h-5 mr-2" />
                  Browse Matches
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Three steps to elite-level accountability
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="relative p-8 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <div className="mt-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Create Training Card</h3>
                  <p className="text-muted-foreground">
                    Define your goals, schedule, pace, and accountability preferences. 
                    This card represents how seriously you train.
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="relative p-8 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-bold text-primary">
                  2
                </div>
                <div className="mt-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Match with Partner</h3>
                  <p className="text-muted-foreground">
                    Get matched based on discipline, not popularity. 
                    Compatible schedules, goals, and training styles.
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="relative p-8 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-bold text-primary">
                  3
                </div>
                <div className="mt-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Lock-In Contract</h3>
                  <p className="text-muted-foreground">
                    7-day commitment with daily missions and weekly trials. 
                    Build real discipline with measurable progress.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Serious Candidates</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need for structured, accountable training
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Daily Missions',
                description: '1 new problem + 1 revision daily. No excuses.'
              },
              {
                icon: Trophy,
                title: 'Weekly Trials',
                description: 'Timed selection trials to test your progress.'
              },
              {
                icon: Zap,
                title: 'Discipline Score',
                description: 'Track reliability and build your training reputation.'
              },
              {
                icon: Shield,
                title: 'Anti-Ghosting',
                description: 'Auto-rematch after 3 misses. Zero tolerance.'
              },
              {
                icon: CheckCircle2,
                title: 'Training Reports',
                description: 'Auto-generated analysis with revision plans.'
              },
              {
                icon: ArrowRight,
                title: 'Recovery Mode',
                description: 'Soft consequences, not harsh punishment.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-card/30 backdrop-blur border-border/50 hover:border-primary/20 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to train seriously?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              If you enter this program, you are here to train. No excuses.
            </p>
            <Button asChild size="lg" className="text-lg px-10 shadow-neon">
              <Link to="/partner/training-card">
                Create Your Training Card
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PartnerLanding;
