import { cn } from '@/lib/utils';

interface ProfileSubTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'skills', label: 'Skills' },
  { id: 'mocks', label: 'Mocks' },
  { id: 'community', label: 'Community' },
  { id: 'arena', label: 'Arena' },
];

export function ProfileSubTabs({ activeTab, onTabChange }: ProfileSubTabsProps) {
  return (
    <div className="flex items-center gap-6 border-t border-border pt-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "text-sm font-medium transition-colors pb-2",
            activeTab === tab.id
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
