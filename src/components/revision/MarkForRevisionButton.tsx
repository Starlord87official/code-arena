import { useState } from 'react';
import { BookmarkPlus, Calendar, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAddToRevisionQueue } from '@/hooks/useRevisionQueue';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface MarkForRevisionButtonProps {
  problemId: string;
  problemTitle: string;
  topic?: string;
  variant?: 'default' | 'compact';
}

const PRESET_DAYS = [
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '21 Days', days: 21 },
];

export function MarkForRevisionButton({
  problemId,
  problemTitle,
  topic,
  variant = 'default',
}: MarkForRevisionButtonProps) {
  const [open, setOpen] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const { mutate: addToQueue, isPending } = useAddToRevisionQueue();
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user) return null;

  const handleAddToQueue = (days: number) => {
    addToQueue(
      {
        problemId,
        problemTitle,
        topic,
        daysUntilRevision: days,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Added to Revision Queue',
            description: `Scheduled for ${format(addDays(new Date(), days), 'MMM d, yyyy')}`,
          });
          setOpen(false);
          setShowCustomDate(false);
        },
        onError: (error) => {
          toast({
            title: 'Failed to add',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleCustomDate = () => {
    if (!customDate) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = customDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      toast({
        title: 'Invalid date',
        description: 'Please select a future date',
        variant: 'destructive',
      });
      return;
    }
    
    handleAddToQueue(diffDays);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={variant === 'compact' ? 'sm' : 'default'}
          className="gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <BookmarkPlus className="h-4 w-4" />
          {variant === 'default' && 'Mark for Revision'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <div className="text-sm font-medium">Schedule Revision</div>
          
          {!showCustomDate ? (
            <>
              <div className="space-y-2">
                {PRESET_DAYS.map(({ label, days }) => (
                  <Button
                    key={days}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => handleAddToQueue(days)}
                    disabled={isPending}
                  >
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(addDays(new Date(), days), 'MMM d')}
                    </span>
                  </Button>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={() => setShowCustomDate(true)}
              >
                <Calendar className="h-4 w-4" />
                Custom Date
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <CalendarComponent
                mode="single"
                selected={customDate}
                onSelect={setCustomDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowCustomDate(false)}
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={handleCustomDate}
                  disabled={!customDate || isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
