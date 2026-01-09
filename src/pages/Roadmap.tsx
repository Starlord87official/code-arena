import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoadmapProgress } from '@/components/roadmap/RoadmapProgress';
import { useRoadmapWithProgress, useUserActiveRoadmaps } from '@/hooks/useRoadmap';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Roadmap() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useRoadmapWithProgress(roadmapId);
  const { data: activeRoadmaps, isLoading: activeLoading } = useUserActiveRoadmaps();

  // Check if user has started this roadmap
  const isStarted = activeRoadmaps?.some(r => r.roadmap_id === roadmapId);

  if (authLoading || isLoading || activeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If user hasn't started this roadmap, redirect to dashboard
  if (!isStarted) {
    return <Navigate to="/dashboard" replace />;
  }

  if (error || !data) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Roadmap not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{data.roadmap.name}</CardTitle>
              <CardDescription>{data.roadmap.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>
            Track your journey through {data.totalCount} topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoadmapProgress
            topics={data.topics}
            completedCount={data.completedCount}
            totalCount={data.totalCount}
            progressPercentage={data.progressPercentage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
