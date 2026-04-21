import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, Filter, MessageCircleQuestion, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useDoubts, useEligibleTopics, DoubtCategory, DoubtDifficulty } from '@/hooks/useDoubts';
import { AskDoubtDialog } from '@/components/doubts/AskDoubtDialog';
import { DoubtCard } from '@/components/doubts/DoubtCard';
import { PageHeader } from '@/components/bl/PageHeader';

const CATEGORIES: { value: DoubtCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'study', label: 'Study' },
  { value: 'job', label: 'Job' },
  { value: 'internship', label: 'Internship' },
  { value: 'referral', label: 'Referral' },
];

const DIFFICULTIES: { value: DoubtDifficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function Doubts() {
  const { isAuthenticated, isLoading: authLoading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'unsolved' | 'solved'>('unsolved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DoubtCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DoubtDifficulty | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const { data: topics = [] } = useEligibleTopics();

  const { data: doubts = [], isLoading } = useDoubts({
    showSolved: activeTab === 'solved',
    category: selectedCategory === 'all' ? null : selectedCategory,
    difficulty: selectedDifficulty === 'all' ? null : selectedDifficulty,
    topicId: selectedTopic === 'all' ? null : selectedTopic,
    search: searchQuery.trim() || null,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  const unsolvedCount = doubts.filter(d => !d.is_solved).length;
  const solvedCount = doubts.filter(d => d.is_solved).length;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          sector="014"
          tag="DOUBT_FORUM"
          title={<>Doubt <span className="text-neon text-glow">Forum</span></>}
          subtitle="Ask questions, help others, and grow together"
          right={<AskDoubtDialog />}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'unsolved' | 'solved')}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="unsolved" className="gap-2">
                <MessageCircleQuestion className="h-4 w-4" />
                Unsolved
              </TabsTrigger>
              <TabsTrigger value="solved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Solved
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filters */}
          <div className="arena-card p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doubts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as DoubtCategory | 'all')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as DoubtDifficulty | 'all')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Topic Filter */}
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.topic_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <TabsContent value="unsolved" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : doubts.length === 0 ? (
              <div className="text-center py-12 arena-card rounded-xl">
                <MessageCircleQuestion className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No unsolved doubts</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedTopic !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Be the first to ask a question!'}
                </p>
                <AskDoubtDialog />
              </div>
            ) : (
              <div className="space-y-4">
                {doubts.map((doubt) => (
                  <DoubtCard key={doubt.id} doubt={doubt} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="solved" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : doubts.length === 0 ? (
              <div className="text-center py-12 arena-card rounded-xl">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No solved doubts yet</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedTopic !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Solved doubts will appear here for reference'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {doubts.map((doubt) => (
                  <DoubtCard key={doubt.id} doubt={doubt} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
