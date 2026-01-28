import { Badge } from '@/components/ui/badge';
import { Star, Zap, Award, SortAsc } from 'lucide-react';

interface SkillsCardProps {
  skills?: string[];
  languages?: { name: string; count: number }[];
}

export function SkillsCard({
  skills = ['Advanced', 'First 100', 'First 500', 'Sorting'],
  languages = [
    { name: 'C++', count: 179 },
    { name: 'MySQL', count: 0 },
  ],
}: SkillsCardProps) {
  const getSkillIcon = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'advanced':
        return <Star className="h-3 w-3" />;
      case 'first 100':
        return <Zap className="h-3 w-3" />;
      case 'first 500':
        return <Award className="h-3 w-3" />;
      case 'sorting':
        return <SortAsc className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="arena-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-foreground">Skills</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Star className="h-3 w-3" /> 50 GUNS
        </span>
      </div>

      {/* Skills dropdown placeholder */}
      <div className="mb-4">
        <select className="w-full bg-secondary text-foreground rounded-md px-3 py-2 text-sm border border-border">
          <option>Advanced</option>
        </select>
      </div>

      {/* Skill badges */}
      <div className="space-y-3 mb-6">
        {skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-muted-foreground">
              {getSkillIcon(skill)}
            </div>
            <span className="text-sm text-foreground">{skill}</span>
          </div>
        ))}
      </div>

      {/* Languages */}
      <h4 className="font-display font-bold text-sm text-foreground mb-3">Languages</h4>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang, i) => (
          <Badge 
            key={i} 
            variant="outline" 
            className="bg-secondary/50 text-foreground border-border"
          >
            {lang.name}
            {lang.count > 0 && <span className="ml-1 text-muted-foreground">{lang.count}*</span>}
          </Badge>
        ))}
      </div>
    </div>
  );
}
