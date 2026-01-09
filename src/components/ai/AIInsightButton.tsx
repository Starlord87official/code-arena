import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsightButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AIInsightButton({
  onClick,
  isLoading = false,
  disabled = false,
  label,
  variant = 'outline',
  size = 'sm',
  className,
}: AIInsightButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
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
}
