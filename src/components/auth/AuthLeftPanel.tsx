import { Code2, UserPlus, Settings, Swords } from 'lucide-react';
import codelockBg from '@/assets/codelockbg.jpg';

interface AuthLeftPanelProps {
  activeStep: 'create' | 'preferences' | 'challenges';
}

const steps = [
  { id: 'create' as const, label: 'Create Account', icon: UserPlus },
  { id: 'preferences' as const, label: 'Set Preferences', icon: Settings },
  { id: 'challenges' as const, label: 'Start Challenges', icon: Swords },
];

export function AuthLeftPanel({ activeStep }: AuthLeftPanelProps) {
  return (
    <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${codelockBg})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
        {/* Logo + headline */}
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="relative">
              <Code2 className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-lg" />
            </div>
            <span className="font-display text-lg font-bold text-foreground tracking-wide">
              CodeTrackX{' '}
              <span className="text-xs text-muted-foreground font-normal">(Private Beta)</span>
            </span>
          </div>

          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight text-foreground mb-4">
            Get Started with{' '}
            <span className="text-primary">CodeTrackX</span>
          </h1>
          <p className="text-base xl:text-lg text-muted-foreground max-w-sm leading-relaxed">
            Join the arena. Track XP. Climb ranks.
          </p>
        </div>

        {/* Step cards */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const isActive = step.id === activeStep;
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`
                  flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300
                  ${isActive
                    ? 'bg-primary/15 border border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                    : 'bg-card/20 border border-border/20 backdrop-blur-sm'
                  }
                `}
              >
                <div
                  className={`
                    flex items-center justify-center h-9 w-9 rounded-xl text-sm font-bold shrink-0
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]'
                      : 'bg-muted/40 text-muted-foreground'
                    }
                  `}
                >
                  {i + 1}
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
