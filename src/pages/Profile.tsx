import { 
  Trophy, Zap, Flame, Target, Calendar, TrendingUp, 
  Code2, Clock, Award, Shield, Star, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { mockUser, mockChallenges, getDivisionColor, getDivisionAura, getXpForNextLevel, getXpProgress } from '@/lib/mockData';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const recentActivity = [
  { type: 'solve', title: 'Solved "Binary Tree Dominance"', xp: 100, time: '2 hours ago' },
  { type: 'solve', title: 'Solved "Two Sum Annihilation"', xp: 50, time: '5 hours ago' },
  { type: 'rank', title: 'Promoted to Diamond Division', xp: 0, time: '1 day ago' },
  { type: 'streak', title: 'Achieved 7-day streak', xp: 50, time: '1 day ago' },
  { type: 'contest', title: 'Participated in Weekly Arena #46', xp: 300, time: '3 days ago' },
];

const skillTags = [
  { name: 'Arrays', level: 85 },
  { name: 'Dynamic Programming', level: 62 },
  { name: 'Trees', level: 78 },
  { name: 'Graphs', level: 55 },
  { name: 'Hash Maps', level: 90 },
  { name: 'Recursion', level: 70 },
];

export default function Profile() {
  const user = mockUser;
  const xpProgress = getXpProgress(user.xp, user.level);
  const xpForNext = getXpForNextLevel(user.level);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className={`arena-card p-8 mb-8 ${getDivisionAura(user.division)}`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-current opacity-20 rounded-full ${getDivisionColor(user.division)}`} />
              <Avatar className={`h-32 w-32 border-4 ${getDivisionColor(user.division).replace('text-', 'border-')} ring-4 ring-current/20`}>
                <AvatarFallback className="bg-card text-4xl font-display font-bold text-foreground">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge className={`${getDivisionColor(user.division)} border border-current/30 bg-current/20 uppercase font-bold px-3`}>
                  {user.division}
                </Badge>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="font-display text-4xl font-bold text-foreground">{user.username}</h1>
                <Badge variant="outline" className="text-primary border-primary">
                  #{user.rank}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">"{user.division === 'legend' ? 'There is only one #1.' : 'Climbing the ranks, one solve at a time.'}"</p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="arena-card p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="font-bold text-xl">{user.xp.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Total XP</span>
                </div>
                <div className="arena-card p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-status-warning mb-1">
                    <Flame className="h-4 w-4" />
                    <span className="font-bold text-xl">{user.streak}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Day Streak</span>
                </div>
                <div className="arena-card p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-status-success mb-1">
                    <Target className="h-4 w-4" />
                    <span className="font-bold text-xl">{user.solvedChallenges}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Solved</span>
                </div>
                <div className="arena-card p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-bold text-xl">{user.elo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">ELO Rating</span>
                </div>
              </div>

              {/* Level Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level {user.level}</span>
                  <span className="text-primary font-medium">{Math.round(xpProgress)}% to Level {user.level + 1}</span>
                </div>
                <Progress value={xpProgress} className="h-3" />
                <div className="text-xs text-muted-foreground text-right">
                  {xpForNext - (user.xp % 500)} XP to next level
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link to="/settings">
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </Link>
              <Button variant="arena">Challenge</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                Skill Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillTags.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
                      <span className="text-xs text-primary font-bold">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'solve' ? 'bg-status-success/20' :
                      activity.type === 'rank' ? 'bg-rank-gold/20' :
                      activity.type === 'streak' ? 'bg-status-warning/20' :
                      'bg-primary/20'
                    }`}>
                      {activity.type === 'solve' && <Target className="h-4 w-4 text-status-success" />}
                      {activity.type === 'rank' && <Star className="h-4 w-4 text-rank-gold" />}
                      {activity.type === 'streak' && <Flame className="h-4 w-4 text-status-warning" />}
                      {activity.type === 'contest' && <Trophy className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    {activity.xp > 0 && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        +{activity.xp} XP
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Achievements */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Achievements
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Flame, label: '7 Day Streak', unlocked: true },
                  { icon: Target, label: '50 Solves', unlocked: true },
                  { icon: Trophy, label: 'Contest Win', unlocked: false },
                  { icon: Star, label: 'Diamond', unlocked: true },
                  { icon: Shield, label: 'Top 100', unlocked: false },
                  { icon: Zap, label: '1000 XP', unlocked: true },
                ].map((achievement, i) => (
                  <div 
                    key={i}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 ${
                      achievement.unlocked 
                        ? 'bg-primary/20 border border-primary/30' 
                        : 'bg-muted/50 border border-border opacity-50'
                    }`}
                  >
                    <achievement.icon className={`h-6 w-6 mb-1 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs text-center text-foreground">{achievement.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="text-foreground font-medium">
                    {format(user.joinedAt, 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contests Joined</span>
                  <span className="text-foreground font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Best Rank</span>
                  <span className="text-primary font-bold">#89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Longest Streak</span>
                  <span className="text-status-warning font-bold">14 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. Solve Time</span>
                  <span className="text-foreground font-medium">18 min</span>
                </div>
              </div>
            </div>

            {/* Recommended */}
            <div className="arena-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Next Challenge
                </h2>
                <Link to="/challenges" className="text-primary text-sm hover:underline">
                  View all
                </Link>
              </div>
              <Link to={`/solve/${mockChallenges[2].id}`} className="block">
                <div className="p-4 bg-background rounded-lg hover:bg-primary/5 transition-colors group">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {mockChallenges[2].title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">+{mockChallenges[2].xpReward} XP</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge className="bg-destructive/20 text-destructive border-destructive/30 uppercase text-xs">
                      {mockChallenges[2].difficulty}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
