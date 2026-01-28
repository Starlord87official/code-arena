import { cn } from '@/lib/utils';
import { CheckCircle, BarChart3, FileText, Trophy } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: CheckCircle },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'solved', label: 'Solved Problems', icon: FileText },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            
            {/* Active indicator */}
            {isActive && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                style={{
                  boxShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary))',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
