import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Users, Star, GraduationCap, LayoutDashboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MentorCard } from '@/components/mentor/MentorCard';
import { mockMentors, TeachingFocus, getFocusColor } from '@/lib/mentorData';
import { useAuth } from '@/contexts/AuthContext';

const focusOptions: TeachingFocus[] = [
  'DSA',
  'Competitive Programming',
  'Web Development',
  'System Design',
  'Machine Learning',
];

export default function Mentors() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<TeachingFocus | 'all'>('all');

  const filteredMentors = mockMentors.filter(mentor => {
    const matchesSearch = mentor.username.toLowerCase().includes(search.toLowerCase()) ||
                          mentor.bio.toLowerCase().includes(search.toLowerCase());
    const matchesFocus = selectedFocus === 'all' || mentor.teachingFocus.includes(selectedFocus);
    return matchesSearch && matchesFocus;
  });

  const totalStudents = mockMentors.reduce((sum, m) => sum + m.totalStudents, 0);
  const avgRating = (mockMentors.reduce((sum, m) => sum + m.rating, 0) / mockMentors.length).toFixed(1);

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative py-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <GraduationCap className="h-3 w-3 mr-1" />
              MENTOR NETWORK
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Find Your <span className="text-gradient-electric">Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Learn from experienced developers and competitive programmers. 
              Join a clan, attend live sessions, and accelerate your growth.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-display text-2xl font-bold text-primary">{mockMentors.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Active Mentors</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-status-warning fill-current" />
                  <span className="font-display text-2xl font-bold text-status-warning">{avgRating}</span>
                </div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <GraduationCap className="h-5 w-5 text-success" />
                  <span className="font-display text-2xl font-bold text-success">{totalStudents}</span>
                </div>
                <p className="text-sm text-muted-foreground">Students Taught</p>
              </div>
              {isAuthenticated && (
                <>
                  <div className="h-8 w-px bg-border" />
                  <Link to="/mentor/dashboard">
                    <Button variant="outline" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      My Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur-xl z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Focus Filter */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={selectedFocus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFocus('all')}
              >
                All
              </Button>
              {focusOptions.map(focus => (
                <Button
                  key={focus}
                  variant={selectedFocus === focus ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFocus(focus)}
                  className={selectedFocus === focus ? '' : getFocusColor(focus)}
                >
                  {focus}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {filteredMentors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No mentors found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map(mentor => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
