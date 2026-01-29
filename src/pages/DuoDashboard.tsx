import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  Zap, 
  Calendar,
  Shield,
  Trophy,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Play,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  mockActiveContract, 
  mockCurrentUser,
  getTrialFormatLabel
} from '@/lib/partnerData';

const DuoDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contract = mockActiveContract;
  
  const [missions, setMissions] = useState(contract.missions[0]?.tasks || []);

  // Determine which partner is the current user's partner
  const partner = contract.partnerA.id === mockCurrentUser.id 
    ? contract.partnerB 
    : contract.partnerA;

  const currentUserDebt = contract.disciplineDebt.find(d => d.userId === mockCurrentUser.id);
  const partnerDebt = contract.disciplineDebt.find(d => d.userId === partner.id);

  const daysRemaining = Math.ceil(
    (new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const toggleTask = (taskId: string) => {
    setMissions(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } 
        : task
    ));
    toast.success('Task updated!');
  };

  const formatTrialDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }) + ' IST';
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
            onClick={() => navigate('/partner')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <Avatar className="w-12 h-12 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {mockCurrentUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Avatar className="w-12 h-12 border-2 border-background">
                  <AvatarFallback className="bg-accent/10 text-accent-foreground">
                    {partner.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Duo Dashboard</h1>
                <p className="text-muted-foreground">
                  {mockCurrentUser.username} × {partner.username}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              <Clock className="w-3 h-3 mr-1" />
              {daysRemaining} days left
            </Badge>
          </div>
        </motion.div>

        {/* Discipline Debt Warning */}
        {currentUserDebt && currentUserDebt.taskCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-amber-500">
                    Discipline Debt: {currentUserDebt.taskCount} task{currentUserDebt.taskCount > 1 ? 's' : ''}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Clear today to stay on track and maintain your streak.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
                  Clear Debt
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Flame className="w-5 h-5" />
              {contract.duoStreak}
            </div>
            <div className="text-xs text-muted-foreground">Duo Streak</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-emerald-500">
              {mockCurrentUser.disciplineScore}%
            </div>
            <div className="text-xs text-muted-foreground">Your Discipline</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {mockCurrentUser.chemistryScore}%
            </div>
            <div className="text-xs text-muted-foreground">Chemistry</div>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50 text-center">
            <div className="text-2xl font-bold text-amber-500">
              {mockCurrentUser.clutchScore}%
            </div>
            <div className="text-xs text-muted-foreground">Clutch Score</div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Missions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Today's Missions
                  </CardTitle>
                  <CardDescription>
                    Complete your daily tasks to maintain the streak
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {missions.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        task.status === 'completed'
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {task.type === 'new_problem' ? 'New Problem' : 
                             task.type === 'revision' ? 'Revision' : 'Trial Prep'}
                          </Badge>
                        </div>
                      </div>
                      {task.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Daily Progress</span>
                      <span className="font-medium">
                        {missions.filter(t => t.status === 'completed').length} / {missions.length}
                      </span>
                    </div>
                    <Progress 
                      value={(missions.filter(t => t.status === 'completed').length / missions.length) * 100} 
                      className="h-2 mt-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gap List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Shared Gap List
                  </CardTitle>
                  <CardDescription>
                    Topics both partners need to strengthen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {contract.gapList.map((topic, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="px-3 py-1.5 text-sm border-amber-500/30 bg-amber-500/5 text-amber-500"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Trial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="w-5 h-5 text-primary" />
                    Next Trial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Scheduled</div>
                    <div className="font-medium">{formatTrialDate(contract.nextTrialDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Format</div>
                    <div className="font-medium">{getTrialFormatLabel(contract.nextTrialFormat)}</div>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/partner/trials">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Trial Room
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Partner Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    Partner Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-accent/10">
                        {partner.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{partner.username}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Online now
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="p-2 rounded bg-secondary/50">
                      <div className="font-medium">{partner.disciplineScore}%</div>
                      <div className="text-xs text-muted-foreground">Discipline</div>
                    </div>
                    <div className="p-2 rounded bg-secondary/50">
                      <div className="font-medium">
                        {partnerDebt?.taskCount || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Debt Tasks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Start Sync Solve
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Trial
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Chat
                  </Button>
                  <Button className="w-full justify-start text-amber-500 hover:text-amber-400" variant="ghost">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Enter Recovery Mode
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuoDashboard;
