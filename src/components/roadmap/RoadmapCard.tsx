import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronRight, Loader2, Sparkles, PlayCircle } from 'lucide-react';
import { useRoadmapWithProgress, useStartRoadmap, useUserActiveRoadmaps } from '@/hooks/useRoadmap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface RoadmapCardProps {
  roadmapId: string;
  showStartButton?: boolean;
}

export function RoadmapCard({ roadmapId, showStartButton = true }: RoadmapCardProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useRoadmapWithProgress(roadmapId);
  const { data: activeRoadmaps } = useUserActiveRoadmaps();
  const startRoadmap = useStartRoadmap();

  const isStarted = activeRoadmaps?.some(r => r.roadmap_id === roadmapId);

  const handleStart = async () => {
    try {
      await startRoadmap.mutateAsync(roadmapId);
      toast.success('Roadmap started! Your progress is now being tracked.');
      navigate(`/roadmap/${roadmapId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start roadmap');
    }
  };

  const handleContinue = () => {
    navigate(`/roadmap/${roadmapId}`);
  };

  if (isLoading || !data) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Find current topic for display
  const currentTopic = data.topics.find(t => t.isCurrentTopic);
  const nextLockedTopic = data.topics.find(t => t.lockStatus === 'locked');

  return (
    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Gradient accent for active roadmaps */}
      {isStarted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{data.roadmap.name}</CardTitle>
          </div>
          {isStarted && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {data.progressPercentage}% Complete
            </Badge>
          )}
        </div>
        <CardDescription>{data.roadmap.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStarted ? (
          <>
            {/* Current Topic Highlight */}
            {currentTopic && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  {currentTopic.lockStatus === 'in_progress' ? (
                    <PlayCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {currentTopic.lockStatus === 'in_progress' ? 'Currently Learning' : 'Up Next'}
                  </span>
                </div>
                <p className="font-semibold">{currentTopic.topic_name}</p>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mastery Progress</span>
                <span className="font-medium">{data.completedCount}/{data.totalCount} topics</span>
              </div>
              <Progress value={data.progressPercentage} className="h-2" />
            </div>
            
            {/* Next Locked Topic Preview */}
            {nextLockedTopic && (
              <p className="text-xs text-muted-foreground">
                🔒 Next: {nextLockedTopic.topic_name}
              </p>
            )}
            
            <Button onClick={handleContinue} className="w-full" variant="outline">
              View Full Roadmap
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        ) : showStartButton ? (
          <>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{data.totalCount} topics</span>
              <span>•</span>
              <span>Mastery-first learning</span>
            </div>
            <Button 
              onClick={handleStart} 
              className="w-full"
              disabled={startRoadmap.isPending}
            >
              {startRoadmap.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start DSA Journey
                </>
              )}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
