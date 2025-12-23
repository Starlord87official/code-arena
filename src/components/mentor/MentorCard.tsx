import { Link } from 'react-router-dom';
import { Users, Star, BookOpen, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mentor, getMentorRoleLabel, getMentorRoleColor, getFocusColor, getClanByMentorId } from '@/lib/mentorData';

interface MentorCardProps {
  mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const clan = getClanByMentorId(mentor.id);

  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-arena">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display text-xl font-bold text-primary-foreground">
            {mentor.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-heading font-bold text-lg truncate">{mentor.username}</h3>
              <div className="flex items-center gap-1 text-status-warning">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">{mentor.rating}</span>
              </div>
            </div>
            <p className={`text-sm font-medium ${getMentorRoleColor(mentor.role)}`}>
              {getMentorRoleLabel(mentor.role)}
            </p>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.teachingFocus.map(focus => (
            <Badge key={focus} variant="outline" className={`text-xs ${getFocusColor(focus)}`}>
              {focus}
            </Badge>
          ))}
        </div>

        {/* Bio Preview */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {mentor.bio}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold">{mentor.totalStudents}</span> students
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold">{mentor.totalClasses}</span> classes
            </span>
          </div>
        </div>

        {/* Clan Info */}
        {clan && (
          <div className="p-3 rounded-lg bg-secondary/50 border border-border mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Leading Clan</p>
                <p className="font-heading font-semibold text-sm">{clan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-0.5">Members</p>
                <p className="font-display font-bold text-primary">
                  {clan.memberCount}/{clan.maxMembers}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <Link to={`/mentor/${mentor.id}`}>
          <Button variant="outline" className="w-full group/btn">
            <span>View Profile</span>
            <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
