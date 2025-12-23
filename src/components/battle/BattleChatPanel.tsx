import { useState } from 'react';
import { MessageSquare, Radio, Command, Send, Flame, AlertTriangle, Eye, ChevronRight, ChevronLeft, Target, Zap, Hand } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BattleChatMessage, BattleFeedMessage, MentorCommand, mentorCommands } from '@/lib/battleData';
import { toast } from '@/hooks/use-toast';

interface BattleChatPanelProps {
  clanChat: BattleChatMessage[];
  battleFeed: BattleFeedMessage[];
  isMentor?: boolean;
  battleEnded?: boolean;
}

export function BattleChatPanel({ clanChat, battleFeed, isMentor = false, battleEnded = false }: BattleChatPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('clan');

  const handleSendMessage = () => {
    if (!message.trim() || battleEnded) return;
    toast({
      title: "Message sent",
      description: message,
    });
    setMessage('');
  };

  const handleReaction = (emoji: string) => {
    if (battleEnded) return;
    toast({
      title: "Reaction sent",
      description: emoji,
    });
  };

  const handleMentorCommand = (command: MentorCommand) => {
    if (battleEnded) return;
    toast({
      title: "Command activated",
      description: command.label,
    });
  };

  const getCommandIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target': return <Target className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Hand': return <Hand className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      default: return <Command className="w-4 h-4" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="rounded-l-lg rounded-r-none border-r-0 bg-card border-primary/30 hover:bg-primary/10"
        >
          <ChevronLeft className="w-4 h-4 text-primary" />
          <MessageSquare className="w-4 h-4 ml-1 text-primary" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="arena-card bg-card/95 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Battle Chat
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {battleEnded && (
          <Badge variant="outline" className="w-fit border-muted-foreground/30 text-muted-foreground">
            Battle ended - Chat is read-only
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0 p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 mb-3 flex-shrink-0">
            <TabsTrigger value="clan" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Clan
            </TabsTrigger>
            <TabsTrigger value="feed" className="text-xs">
              <Radio className="w-3 h-3 mr-1" />
              Feed
            </TabsTrigger>
            {isMentor && (
              <TabsTrigger value="commands" className="text-xs">
                <Command className="w-3 h-3 mr-1" />
                Commands
              </TabsTrigger>
            )}
          </TabsList>

          {/* Clan Chat Tab */}
          <TabsContent value="clan" className="flex-1 flex flex-col min-h-0 mt-0">
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {clanChat.map((msg) => (
                  <div key={msg.id} className="group">
                    <div className={`flex items-start gap-2 p-2 rounded-lg transition-all ${
                      msg.type === 'mentor' 
                        ? 'bg-rank-gold/10 border border-rank-gold/30' 
                        : msg.type === 'command'
                          ? 'bg-primary/10 border border-primary/30'
                          : msg.type === 'reaction'
                            ? 'bg-transparent'
                            : 'bg-secondary/30'
                    }`}>
                      <Avatar className={`w-8 h-8 flex-shrink-0 ${
                        msg.type === 'mentor' ? 'ring-2 ring-rank-gold' : ''
                      }`}>
                        <AvatarFallback className={`text-xs ${
                          msg.type === 'mentor' 
                            ? 'bg-rank-gold/20 text-rank-gold' 
                            : 'bg-secondary text-foreground'
                        }`}>
                          {msg.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${
                            msg.type === 'mentor' ? 'text-rank-gold' : 'text-foreground'
                          }`}>
                            {msg.username}
                          </span>
                          {msg.type === 'mentor' && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 border-rank-gold/30 text-rank-gold">
                              MENTOR
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {Math.round((Date.now() - msg.timestamp.getTime()) / 60000)}m
                          </span>
                        </div>
                        
                        {msg.type === 'reaction' ? (
                          <span className="text-2xl">{msg.content}</span>
                        ) : msg.type === 'command' ? (
                          <div className="flex items-center gap-2 mt-1 text-primary font-semibold">
                            <Zap className="w-4 h-4" />
                            {msg.content}
                          </div>
                        ) : (
                          <p className="text-sm text-foreground/90 break-words">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Quick Reactions */}
            {!battleEnded && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border flex-shrink-0">
                <div className="flex gap-1">
                  {['🔥', '⚠️', '👀'].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(emoji)}
                      className="h-8 w-8 p-0 hover:bg-secondary"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message your clan..."
                    className="h-8 text-sm bg-secondary/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    className="h-8 px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Battle Feed Tab */}
          <TabsContent value="feed" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  <Radio className="w-3 h-3 inline mr-1" />
                  Public system messages only
                </p>
                {battleFeed.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg border text-sm ${
                      msg.type === 'lead-change'
                        ? 'bg-status-warning/10 border-status-warning/30 text-status-warning'
                        : msg.type === 'solve'
                          ? 'bg-status-success/10 border-status-success/30 text-status-success'
                          : msg.type === 'streak'
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : msg.type === 'warning'
                              ? 'bg-destructive/10 border-destructive/30 text-destructive'
                              : 'bg-accent/10 border-accent/30 text-accent'
                    }`}
                    style={{ opacity: 1 - (index * 0.08) }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{msg.message}</span>
                      <span className="text-xs opacity-70">
                        {Math.round((Date.now() - msg.timestamp.getTime()) / 60000)}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Mentor Commands Tab */}
          {isMentor && (
            <TabsContent value="commands" className="flex-1 min-h-0 mt-0">
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Commands appear as system messages in clan chat
                  </p>
                  {mentorCommands.map((cmd) => (
                    <Button
                      key={cmd.id}
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto p-3 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                      onClick={() => handleMentorCommand(cmd)}
                      disabled={battleEnded}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        {getCommandIcon(cmd.icon)}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{cmd.label}</div>
                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
