import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { useRoadmapWithProgress, useStartRoadmap, useUserActiveRoadmaps } from '@/hooks/useRoadmap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{data.roadmap.name}</CardTitle>
        </div>
        <CardDescription>{data.roadmap.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStarted ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{data.progressPercentage}%</span>
              </div>
              <Progress value={data.progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {data.completedCount} of {data.totalCount} topics completed
              </p>
            </div>
            <Button onClick={handleContinue} className="w-full" variant="outline">
              Continue Learning
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        ) : showStartButton ? (
          <>
            <p className="text-sm text-muted-foreground">
              {data.totalCount} topics to master
            </p>
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
                  Start DSA Journey
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
