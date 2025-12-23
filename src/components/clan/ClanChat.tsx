import { useState } from 'react';
import { Send, Crown, Info, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClanMessage, getClanMessages } from '@/lib/mentorData';
import { formatDistanceToNow } from 'date-fns';

interface ClanChatProps {
  clanId: string;
}

export function ClanChat({ clanId }: ClanChatProps) {
  const [message, setMessage] = useState('');
  const messages = getClanMessages(clanId);

  const handleSend = () => {
    if (message.trim()) {
      // Mock send - in real app would push to state/db
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const getMessageStyles = (type: ClanMessage['type']) => {
    switch (type) {
      case 'mentor':
        return 'bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary';
      case 'system':
        return 'bg-secondary/50 border-l-2 border-muted-foreground';
      case 'announcement':
        return 'bg-gradient-to-r from-status-warning/10 to-transparent border-l-2 border-status-warning';
      default:
        return 'hover:bg-secondary/30';
    }
  };

  const getMessageIcon = (type: ClanMessage['type']) => {
    switch (type) {
      case 'mentor':
        return <Crown className="h-3 w-3 text-primary" />;
      case 'system':
        return <Info className="h-3 w-3 text-muted-foreground" />;
      case 'announcement':
        return <Megaphone className="h-3 w-3 text-status-warning" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <h3 className="font-heading font-semibold">Clan Chat</h3>
        <p className="text-xs text-muted-foreground">Stay connected with your clan</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg transition-colors ${getMessageStyles(msg.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-display text-sm font-bold ${
                  msg.type === 'mentor' 
                    ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground' 
                    : msg.type === 'system'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-secondary text-foreground'
                }`}>
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-heading font-semibold text-sm ${
                      msg.type === 'mentor' ? 'text-primary' : 
                      msg.type === 'announcement' ? 'text-status-warning' : ''
                    }`}>
                      {msg.username}
                    </span>
                    {getMessageIcon(msg.type)}
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    msg.type === 'system' ? 'text-muted-foreground italic' : ''
                  }`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-secondary/30">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
