import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIInsightButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const AI_TOOLTIP_SHOWN_KEY = 'codelock_ai_tooltip_shown';

export function AIInsightButton({
  onClick,
  isLoading = false,
  disabled = false,
  label,
  variant = 'outline',
  size = 'sm',
  className,
}: AIInsightButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Check if user has seen the AI trust tooltip before
    const hasSeenTooltip = localStorage.getItem(AI_TOOLTIP_SHOWN_KEY);
    if (!hasSeenTooltip) {
      setShowTooltip(true);
    }
  }, []);

  const handleClick = () => {
    // Mark tooltip as shown on first click
    if (showTooltip) {
      localStorage.setItem(AI_TOOLTIP_SHOWN_KEY, 'true');
      setShowTooltip(false);
    }
    onClick();
  };

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        "gap-1.5 text-xs",
        variant === 'outline' && "border-primary/30 text-primary hover:bg-primary/10 hover:text-primary",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip defaultOpen={true}>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px] text-center">
            <p className="text-sm font-medium mb-1">AI helps you understand mistakes and improve thinking.</p>
            <p className="text-xs text-muted-foreground">It will never give full solutions.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
