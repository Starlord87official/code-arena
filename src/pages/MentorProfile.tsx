import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Star, 
  BookOpen, 
  Calendar, 
  Clock, 
  ChevronRight,
  Shield,
  Target,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ClassSessionCard } from '@/components/clan/ClassSessionCard';
import { 
  getMentorById, 
  getClanByMentorId, 
  getClanSessions,
  getMentorRoleLabel, 
  getMentorRoleColor, 
  getFocusColor 
} from '@/lib/mentorData';
import { format } from 'date-fns';

export default function MentorProfile() {
  const { id } = useParams<{ id: string }>();
  const mentor = getMentorById(id || '');
  const clan = mentor ? getClanByMentorId(mentor.id) : undefined;
  const sessions = clan ? getClanSessions(clan.id).filter(s => s.status !== 'ended').slice(0, 2) : [];

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Mentor Not Found</h2>
          <p className="text-muted-foreground mb-4">This mentor doesn't exist or has been removed.</p>
          <Link to="/mentors">
            <Button>Browse Mentors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative py-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display text-4xl font-bold text-primary-foreground shadow-arena">
                  {mentor.avatar}
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1 text-status-warning">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-display font-bold">{mentor.rating}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold">{mentor.username}</h1>
                  <Badge variant="outline" className={`${getMentorRoleColor(mentor.role)} border-current`}>
                    {getMentorRoleLabel(mentor.role)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.teachingFocus.map(focus => (
                    <Badge key={focus} variant="outline" className={getFocusColor(focus)}>
                      {focus}
                    </Badge>
                  ))}
                </div>

                <p className="text-muted-foreground mb-6">{mentor.bio}</p>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold text-lg">{mentor.totalStudents}</span>
                    <span className="text-muted-foreground">students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold text-lg">{mentor.totalClasses}</span>
                    <span className="text-muted-foreground">classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Mentoring since {format(mentor.joinedAt, 'MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Experience */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="font-heading font-bold text-lg">Experience</h2>
                  </div>
                  <p className="text-muted-foreground">{mentor.experience}</p>
                </div>

                {/* Why Follow */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h2 className="font-heading font-bold text-lg">Why Students Follow</h2>
                  </div>
                  <p className="text-muted-foreground italic">"{mentor.whyFollow}"</p>
                </div>

                {/* Availability */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="font-heading font-bold text-lg">Availability</h2>
                  </div>
                  <p className="text-muted-foreground">{mentor.availability}</p>
                </div>

                {/* Upcoming Classes */}
                {sessions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-5 w-5 text-primary" />
                      <h2 className="font-heading font-bold text-lg">Upcoming Classes</h2>
                    </div>
                    <div className="space-y-4">
                      {sessions.map(session => (
                        <ClassSessionCard key={session.id} session={session} showActions={false} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Clan Preview */}
              <div className="space-y-6">
                {clan ? (
                  <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-24">
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
                      <h3 className="font-heading font-bold text-lg">Leading Clan</h3>
                    </div>
                    <div className="p-6">
                      <h4 className="font-display text-xl font-bold mb-2">{clan.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{clan.description}</p>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Members</span>
                          <span className="font-display font-bold">
                            {clan.memberCount}/{clan.maxMembers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Clan XP</span>
                          <span className="font-display font-bold text-primary">
                            {clan.totalXP.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="outline" className={clan.isOpen ? 'text-success border-success' : 'text-destructive border-destructive'}>
                            {clan.isOpen ? 'Open' : 'Full'}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-secondary/50 border border-border mb-6">
                        <p className="text-xs text-muted-foreground mb-1">Weekly Focus</p>
                        <p className="font-heading font-semibold text-sm">{clan.weeklyFocus}</p>
                      </div>

                      <Link to={`/clan/${clan.id}`}>
                        <Button className="w-full" disabled={!clan.isOpen}>
                          {clan.isOpen ? 'Join Clan' : 'Clan Full'}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <p className="text-muted-foreground">This mentor hasn't created a clan yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
