import { useParams, Link } from 'react-router-dom';
import { useOAPackDetail } from '@/hooks/useOAPacks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, FileText, Play, Shield, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  medium: { label: 'Medium', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  hard: { label: 'Hard', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export default function OAPackDetail() {
  const { packId } = useParams<{ packId: string }>();
  const { data, isLoading } = useOAPackDetail(packId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-6 text-center">
        <p className="text-muted-foreground">Pack not found.</p>
        <Link to="/oa">
          <Button variant="outline" className="mt-4">Back to OA Arena</Button>
        </Link>
      </div>
    );
  }

  const { pack, assessments } = data;
  const diff = difficultyConfig[pack.difficulty] || difficultyConfig.medium;

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
      {/* Back */}
      <Link to="/oa" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to OA Arena
      </Link>

      {/* Pack Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="arena-card rounded-xl p-8"
      >
        <div className="flex items-start justify-between mb-4">
          <Badge variant="outline" className={diff.className}>{diff.label}</Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs uppercase font-heading">
            {pack.role_track}
          </Badge>
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground mb-3">{pack.title}</h1>
        <p className="text-muted-foreground mb-6 max-w-2xl">{pack.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>{pack.duration_minutes} min per assessment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            <span>{assessments.length} assessments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-primary" />
            <span>Integrity Tracked</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {pack.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Assessments */}
      <div className="space-y-4">
        <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Assessments
        </h2>

        {assessments.map((assessment, index) => {
          const sections = assessment.sections_json || [];
          return (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="arena-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                        {assessment.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {assessment.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {sections.reduce((a: number, s: { questionCount: number }) => a + s.questionCount, 0)} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          {sections.length} sections
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sections.map((s: { name: string }, i: number) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Link to={`/oa/start/${assessment.id}`}>
                      <Button variant="arena" size="sm" className="ml-4">
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {assessments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No assessments available in this pack yet.
          </div>
        )}
      </div>
    </div>
  );
}
