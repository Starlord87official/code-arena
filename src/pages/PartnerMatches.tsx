import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Target, 
  Zap,
  ChevronRight,
  ArrowLeft,
  Star,
  Shield,
  Trophy
} from 'lucide-react';
import { 
  mockMatchSuggestions, 
  getGoalLabel, 
  getFocusLabel, 
  getPaceLabel,
  getLanguageLabel
} from '@/lib/partnerData';
import type { MatchSuggestion, ReliabilityTier } from '@/lib/partnerData';

const reliabilityColors: Record<ReliabilityTier, string> = {
  platinum: 'bg-gradient-to-r from-slate-300 to-slate-100 text-slate-900',
  gold: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-900',
  silver: 'bg-gradient-to-r from-gray-400 to-gray-300 text-gray-900',
  bronze: 'bg-gradient-to-r from-orange-700 to-orange-500 text-white',
  unranked: 'bg-muted text-muted-foreground'
};

const reliabilityIcons: Record<ReliabilityTier, React.ReactNode> = {
  platinum: <Star className="w-3 h-3" />,
  gold: <Trophy className="w-3 h-3" />,
  silver: <Shield className="w-3 h-3" />,
  bronze: <Shield className="w-3 h-3" />,
  unranked: null
};

const PartnerMatches = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [paceFilter, setPaceFilter] = useState('all');
  const [reliabilityFilter, setReliabilityFilter] = useState('all');

  const filteredMatches = mockMatchSuggestions.filter(match => {
    const card = match.partner.trainingCard;
    if (!card) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!match.partner.username.toLowerCase().includes(query)) return false;
    }

    if (paceFilter !== 'all' && card.pace !== paceFilter) return false;
    if (reliabilityFilter !== 'all' && match.partner.reliabilityTier !== reliabilityFilter) return false;

    return true;
  });

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 5) return 'Online now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link to="/partner">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Top Matches</h1>
                <p className="text-muted-foreground">
                  {filteredMatches.length} candidates found
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/partner/training-card">
                Edit My Card
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <div className="flex gap-2">
                <Select value={paceFilter} onValueChange={setPaceFilter}>
                  <SelectTrigger className="w-[130px] bg-background/50">
                    <SelectValue placeholder="Pace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Paces</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                    <SelectItem value="steady">Steady</SelectItem>
                    <SelectItem value="slow_deep">Slow + Deep</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reliabilityFilter} onValueChange={setReliabilityFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50">
                    <SelectValue placeholder="Reliability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Match Cards */}
        <div className="space-y-4">
          {filteredMatches.map((match, index) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              index={index}
              getTimeAgo={getTimeAgo}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredMatches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or create a training card first.
            </p>
            <Button asChild>
              <Link to="/partner/training-card">Create Training Card</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface MatchCardProps {
  match: MatchSuggestion;
  index: number;
  getTimeAgo: (date: string) => string;
}

const MatchCard = ({ match, index, getTimeAgo }: MatchCardProps) => {
  const { partner, compatibilityScore, matchReasons, isOnline } = match;
  const card = partner.trainingCard!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-300 group">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage src={partner.avatarUrl} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {partner.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-lg">{partner.username}</span>
                <Badge className={`text-xs ${reliabilityColors[partner.reliabilityTier]}`}>
                  {reliabilityIcons[partner.reliabilityTier]}
                  <span className="ml-1 capitalize">{partner.reliabilityTier}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{card.currentLevel.solvedCount} solved</span>
                <span>•</span>
                <span>{getTimeAgo(partner.lastActive)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {getGoalLabel(card.goal)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getLanguageLabel(card.language)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getPaceLabel(card.pace)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Compatibility Score */}
          <div className="flex flex-col items-center px-6 py-2">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-secondary"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${compatibilityScore} 100`}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{compatibilityScore}%</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-1">Match</span>
          </div>

          {/* Match Reasons */}
          <div className="flex-1 lg:max-w-[200px]">
            <div className="flex flex-wrap gap-1.5">
              {matchReasons.slice(0, 3).map((reason, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-xs bg-primary/10 text-primary border-0"
                >
                  {reason}
                </Badge>
              ))}
              {matchReasons.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{matchReasons.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/partner/profile/${partner.id}`}>
                View Profile
              </Link>
            </Button>
            <Button size="sm" className="shadow-neon">
              <Zap className="w-4 h-4 mr-1" />
              Invite
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PartnerMatches;
