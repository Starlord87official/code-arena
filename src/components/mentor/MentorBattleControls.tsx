import { useState } from 'react';
import { 
  Swords, 
  Target, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  Zap,
  AlertTriangle,
  Send,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockClans } from '@/lib/mentorData';
import { BattleRequest, mockBattleRequests } from '@/lib/clanLeagueData';
import { format, formatDistanceToNow } from 'date-fns';

interface MentorBattleControlsProps {
  clanId: string;
  clanName: string;
}

export function MentorBattleControls({ clanId, clanName }: MentorBattleControlsProps) {
  const { toast } = useToast();
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'mixed' | 'hard'>('mixed');
  const [problemCount, setProblemCount] = useState('5');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [strategyMessage, setStrategyMessage] = useState('');

  // Filter out current clan from opponents
  const availableOpponents = mockClans.filter(c => c.id !== clanId);
  
  // Get pending requests for this clan
  const pendingRequests = mockBattleRequests.filter(
    r => r.toClanId === clanId && r.status === 'pending'
  );

  const handleInitiateBattle = () => {
    if (!selectedOpponent || !scheduledDate || !scheduledTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select an opponent and schedule date/time.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Battle Request Sent!',
      description: `Challenge sent to ${availableOpponents.find(c => c.id === selectedOpponent)?.name}. Waiting for response.`,
    });

    // Reset form
    setSelectedOpponent('');
    setScheduledDate('');
    setScheduledTime('');
  };

  const handleAcceptBattle = (request: BattleRequest) => {
    toast({
      title: 'Battle Accepted!',
      description: `Battle against ${request.fromClanName} scheduled for ${format(request.scheduledAt, 'MMM d at h:mm a')}.`,
    });
  };

  const handleDeclineBattle = (request: BattleRequest) => {
    toast({
      title: 'Battle Declined',
      description: `Challenge from ${request.fromClanName} has been declined.`,
    });
  };

  const handlePinStrategy = () => {
    if (!strategyMessage.trim()) {
      toast({
        title: 'Empty Message',
        description: 'Please enter a strategy message.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Strategy Pinned',
      description: 'Your strategy message is now visible in the battle chat.',
    });
    setStrategyMessage('');
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-status-success bg-status-success/20 border-status-success/50';
      case 'mixed': return 'text-status-warning bg-status-warning/20 border-status-warning/50';
      case 'hard': return 'text-destructive bg-destructive/20 border-destructive/50';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Battle Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-status-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-status-warning">
              <AlertTriangle className="h-5 w-5" />
              Pending Battle Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Other clans want to challenge you!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div 
                key={request.id} 
                className="p-4 rounded-xl bg-secondary/50 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-heading font-bold">{request.fromClanName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Led by {request.fromMentorName}
                    </p>
                  </div>
                  <Badge className={getDifficultyColor(request.difficulty)}>
                    {request.difficulty.toUpperCase()} MIX
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(request.scheduledAt, 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(request.scheduledAt, 'h:mm a')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {request.problemCount} problems
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAcceptBattle(request)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDeclineBattle(request)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Initiate Battle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Challenge Another Clan
          </CardTitle>
          <CardDescription>
            Send a battle request to compete for glory and XP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Opponent</Label>
            <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a clan to challenge" />
              </SelectTrigger>
              <SelectContent>
                {availableOpponents.map((clan) => (
                  <SelectItem key={clan.id} value={clan.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {clan.name} ({clan.memberCount} members)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty Mix</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <div className="flex items-center gap-2">
                    <span className="text-status-success">●</span>
                    Easy - More Easy & Medium problems
                  </div>
                </SelectItem>
                <SelectItem value="mixed">
                  <div className="flex items-center gap-2">
                    <span className="text-status-warning">●</span>
                    Mixed - Balanced difficulty
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex items-center gap-2">
                    <span className="text-destructive">●</span>
                    Hard - More Medium & Hard problems
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Battle Date</Label>
              <Input 
                type="date" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Battle Time</Label>
              <Input 
                type="time" 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Problem Count</Label>
            <Select value={problemCount} onValueChange={setProblemCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Problems (Quick Battle)</SelectItem>
                <SelectItem value="5">5 Problems (Standard)</SelectItem>
                <SelectItem value="7">7 Problems (Extended)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleInitiateBattle} className="w-full">
            <Swords className="h-4 w-4 mr-2" />
            Send Battle Request
          </Button>
        </CardContent>
      </Card>

      {/* Strategy Pin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Pin Strategy Message
          </CardTitle>
          <CardDescription>
            Share battle strategy that will be highlighted in clan chat during battles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., Focus on DP problems first, we have strength there. Save Graph Coloring for our top solvers."
            value={strategyMessage}
            onChange={(e) => setStrategyMessage(e.target.value)}
            rows={3}
          />
          <Button onClick={handlePinStrategy} variant="outline" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Pin to Battle Chat
          </Button>
        </CardContent>
      </Card>

      {/* Bonus XP Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-status-warning" />
            Contributor Bonus XP
          </CardTitle>
          <CardDescription>
            Grant up to 100 bonus XP to outstanding contributors after a battle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-secondary/50 border border-dashed border-border text-center">
            <p className="text-muted-foreground text-sm">
              Bonus XP can be granted after a battle ends.
              <br />
              <span className="text-primary">3 bonus grants remaining this week.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
