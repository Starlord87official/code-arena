import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, MapPin, Crown, UserPlus, UserCheck, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDivisionColor } from '@/lib/mockData';
import { format } from 'date-fns';

interface ProfileHeroBannerProps {
  profile: {
    id?: string;
    username: string;
    avatar_url?: string | null;
    division?: string;
    xp: number;
    streak: number;
    college_name?: string | null;
    college_year?: string | null;
    occupation_type?: string | null;
    years_of_experience?: number | null;
    joined_at: string;
    battles_played: number;
    battles_won: number;
  };
  isOwnProfile: boolean;
  friendshipStatus: { status: string };
  onSendFriendRequest: () => void;
  onRespondToRequest: (accept: boolean) => void;
}

export function ProfileHeroBanner({
  profile,
  isOwnProfile,
  friendshipStatus,
  onSendFriendRequest,
  onRespondToRequest,
}: ProfileHeroBannerProps) {
  const division = (profile.division || 'gold') as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';
  const level = Math.floor(profile.xp / 500) + 1;

  const renderFriendButton = () => {
    if (isOwnProfile) return null;

    switch (friendshipStatus.status) {
      case 'friends':
        return (
          <Button variant="outline" size="sm" disabled className="border-rank-gold text-rank-gold">
            <UserCheck className="h-4 w-4 mr-2" />
            Friends
          </Button>
        );
      case 'pending_sent':
        return (
          <Button variant="outline" size="sm" disabled className="border-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button variant="arena" size="sm" onClick={() => onRespondToRequest(true)}>
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button variant="outline" size="sm" onClick={() => onRespondToRequest(false)}>
              Decline
            </Button>
          </div>
        );
      default:
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSendFriendRequest}
            className="border-rank-gold text-rank-gold hover:bg-rank-gold/10"
          >
            FRIEND ▼
          </Button>
        );
    }
  };

  return (
    <div className="relative">
      {/* Main Banner Card */}
      <div className="arena-card overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40" />
        
        {/* Cosmic dust effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, hsla(45, 90%, 55%, 0.1) 0%, transparent 50%)',
          }}
        />

        <div className="relative flex">
          {/* Avatar Section */}
          <div className="relative w-64 h-72 flex-shrink-0 overflow-hidden">
            {/* Placeholder avatar background */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-card" />
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, hsla(30, 50%, 30%, 0.3) 0%, hsla(200, 50%, 20%, 0.3) 100%)',
              }}
            />
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.username}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="h-32 w-32 border-4 border-rank-gold">
                  <AvatarFallback className="bg-card text-4xl font-display font-bold text-foreground">
                    {profile.username?.slice(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            {/* Gold glow effect around avatar */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-24"
              style={{
                background: 'radial-gradient(ellipse at center bottom, hsla(45, 90%, 55%, 0.3) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            {/* Top section - Username and info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold text-foreground tracking-wide">
                  {profile.username}
                </h1>
                <Badge className="bg-primary/20 text-primary border-primary/30 font-display text-xs px-2">
                  LV {level}
                </Badge>
                <Badge className={cn(
                  "border font-display text-xs px-3",
                  division === 'gold' ? 'bg-rank-gold/20 text-rank-gold border-rank-gold/30' :
                  division === 'platinum' ? 'bg-rank-platinum/20 text-rank-platinum border-rank-platinum/30' :
                  division === 'diamond' ? 'bg-rank-diamond/20 text-rank-diamond border-rank-diamond/30' :
                  'bg-rank-gold/20 text-rank-gold border-rank-gold/30'
                )}>
                  <Crown className="h-3 w-3 mr-1" />
                </Badge>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.college_name || 'IIT Delhi'}</span>
                <span className="text-muted-foreground/50">- 1 ★</span>
              </div>

              {/* Division Badge */}
              <Badge className={cn(
                "mt-2 font-display uppercase text-xs px-3 py-1",
                division === 'gold' ? 'bg-rank-gold text-black' :
                division === 'platinum' ? 'bg-rank-platinum text-black' :
                division === 'diamond' ? 'bg-rank-diamond text-black' :
                'bg-rank-gold text-black'
              )}>
                {division} 1 <Crown className="h-3 w-3 ml-1 inline" />
              </Badge>
            </div>

            {/* Right side - Stats and buttons */}
            <div className="flex items-center justify-end gap-6 absolute top-6 right-6">
              <div className="text-right">
                <span className="font-display font-bold text-foreground">1,056</span>
                <span className="text-muted-foreground text-sm"> Following</span>
                <span className="mx-2 text-muted-foreground">.</span>
                <span className="font-display font-bold text-foreground">974</span>
                <span className="text-muted-foreground text-sm"> Followers</span>
              </div>
              <div className="flex gap-3">
                {isOwnProfile && (
                  <Button variant="outline" className="border-muted-foreground/30">
                    EDIT PROFILE
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="border border-muted-foreground/30">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Card */}
      <div className="absolute top-0 right-0 translate-x-[calc(100%+1.5rem)] w-64">
        <div className="arena-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="font-display font-bold text-2xl text-foreground">1056</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-2xl text-foreground">974</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <Badge className="bg-primary text-primary-foreground text-xs font-display">
              Pro
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {renderFriendButton()}
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              ↓ RETRER
            </Button>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-6">
            <h3 className="font-display text-sm font-bold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { title: 'Custom Sort String', time: '1aria - 20 ms', lang: 'C++' },
                { title: 'Binary Tree Maximum Path Sum', time: 'Yesterday C++ - 157 ms', lang: 'C++' },
                { title: 'Majority Element II', time: 'Yesterday C++ - 23 ms', lang: 'C++' },
                { title: 'String to Integer (atoi)', time: '9 4days ago C++ - 16 ms', lang: 'C++' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-bold">Q</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground">
              Show All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
