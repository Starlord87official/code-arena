import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Target, Clock, Code, Zap, MessageSquare, Shield,
  ArrowLeft, ArrowRight, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import type { PartnerGoal, PartnerFocus, PartnerPace, CommStyle, AccountabilityStyle, Language } from '@/lib/partnerData';
import { useCreateTrainingCard } from '@/hooks/usePartnerData';

interface FormData {
  goal: PartnerGoal | '';
  focus: PartnerFocus | '';
  solvedCount: number;
  internalRating: number;
  contestRating: string;
  dailyCommitment: 30 | 60 | 90;
  preferredSlots: string[];
  language: Language | '';
  pace: PartnerPace | '';
  commStyle: CommStyle | '';
  accountabilityStyle: AccountabilityStyle | '';
  noGhostingRule: boolean;
}

const TrainingCardBuilder = () => {
  const navigate = useNavigate();
  const createCard = useCreateTrainingCard();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    goal: '',
    focus: '',
    solvedCount: 0,
    internalRating: 1200,
    contestRating: '',
    dailyCommitment: 60,
    preferredSlots: [],
    language: '',
    pace: '',
    commStyle: '',
    accountabilityStyle: '',
    noGhostingRule: true
  });

  const totalSteps = 4;

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleSlot = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSlots: prev.preferredSlots.includes(slot)
        ? prev.preferredSlots.filter(s => s !== slot)
        : [...prev.preferredSlots, slot]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.goal && formData.focus;
      case 2: return formData.solvedCount > 0 && formData.language;
      case 3: return formData.dailyCommitment && formData.preferredSlots.length > 0 && formData.pace;
      case 4: return formData.commStyle && formData.accountabilityStyle;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    try {
      await createCard.mutateAsync({
        goal: formData.goal as PartnerGoal,
        focus: formData.focus as PartnerFocus,
        solvedCount: formData.solvedCount,
        internalRating: formData.internalRating,
        contestRating: formData.contestRating,
        dailyCommitment: formData.dailyCommitment,
        preferredSlots: formData.preferredSlots,
        language: formData.language as Language,
        pace: formData.pace as PartnerPace,
        commStyle: formData.commStyle as CommStyle,
        accountabilityStyle: formData.accountabilityStyle as AccountabilityStyle,
        noGhostingRule: formData.noGhostingRule,
      });
      toast.success('Training Card Created!', {
        description: 'You can now browse matches and find your Lock-In partner.'
      });
      navigate('/partner');
    } catch (err: any) {
      toast.error('Failed to create training card', { description: err.message });
    }
  };

  const timeSlots = [
    { id: 'morning', label: 'Morning (6-9 AM IST)', icon: '🌅' },
    { id: 'afternoon', label: 'Afternoon (12-3 PM IST)', icon: '☀️' },
    { id: 'evening', label: 'Evening (6-9 PM IST)', icon: '🌆' },
    { id: 'night', label: 'Night (9 PM-12 AM IST)', icon: '🌙' },
    { id: 'weekend_morning', label: 'Weekend Morning', icon: '🌤️' },
    { id: 'weekend_afternoon', label: 'Weekend Afternoon', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/partner')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Training Card Builder</h1>
              <p className="text-muted-foreground">This card defines how seriously you train.</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${(step / totalSteps) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Form Steps */}
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          {step === 1 && (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Goals & Focus</CardTitle>
                <CardDescription>What are you training for?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Training Goal</Label>
                  <RadioGroup value={formData.goal} onValueChange={(v) => updateField('goal', v as PartnerGoal)} className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'big_tech', label: 'Big Tech', desc: 'FAANG / Top companies' },
                      { value: 'product', label: 'Product Companies', desc: 'Mid to large tech' },
                      { value: 'oa_sprint', label: 'OA Sprint', desc: 'Online assessments' },
                      { value: 'placement', label: 'Placement Season', desc: 'Campus placements' }
                    ].map(option => (
                      <label key={option.value} className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.goal === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value={option.value} className="sr-only" />
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.desc}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">Training Focus</Label>
                  <RadioGroup value={formData.focus} onValueChange={(v) => updateField('focus', v as PartnerFocus)} className="space-y-2">
                    {[
                      { value: 'medium_focused', label: 'Medium-Focused', desc: 'Solve medium problems daily' },
                      { value: 'topic_focused', label: 'Topic-Focused', desc: 'Master one topic at a time' },
                      { value: 'company_focused', label: 'Company-Focused', desc: 'Target specific company patterns' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.focus === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <div><span className="font-medium">{option.label}</span><p className="text-xs text-muted-foreground">{option.desc}</p></div>
                        <RadioGroupItem value={option.value} />
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-primary" />Current Level</CardTitle>
                <CardDescription>Matching is based on discipline, not popularity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="solvedCount">Problems Solved</Label>
                  <Input id="solvedCount" type="number" min={0} value={formData.solvedCount || ''} onChange={(e) => updateField('solvedCount', parseInt(e.target.value) || 0)} placeholder="e.g., 350" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internalRating">Internal Rating (Estimated)</Label>
                  <Input id="internalRating" type="number" min={800} max={3000} value={formData.internalRating} onChange={(e) => updateField('internalRating', parseInt(e.target.value) || 1200)} placeholder="e.g., 1650" className="bg-background/50" />
                  <p className="text-xs text-muted-foreground">Based on your solve patterns (800-3000 range)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contestRating">Contest Rating (Optional)</Label>
                  <Input id="contestRating" value={formData.contestRating} onChange={(e) => updateField('contestRating', e.target.value)} placeholder="e.g., LeetCode 1756 / Codeforces 1400" className="bg-background/50" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">Primary Language</Label>
                  <RadioGroup value={formData.language} onValueChange={(v) => updateField('language', v as Language)} className="flex gap-4">
                    {[{ value: 'cpp', label: 'C++' }, { value: 'java', label: 'Java' }, { value: 'python', label: 'Python' }].map(option => (
                      <label key={option.value} className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.language === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value={option.value} className="sr-only" />
                        <span className="font-medium">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Schedule & Pace</CardTitle>
                <CardDescription>When and how do you want to train?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Daily Commitment</Label>
                  <RadioGroup value={String(formData.dailyCommitment)} onValueChange={(v) => updateField('dailyCommitment', parseInt(v) as 30 | 60 | 90)} className="flex gap-4">
                    {[{ value: '30', label: '30 min' }, { value: '60', label: '60 min' }, { value: '90', label: '90 min' }].map(option => (
                      <label key={option.value} className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${String(formData.dailyCommitment) === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value={option.value} className="sr-only" />
                        <span className="font-medium">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">Preferred Time Slots (IST)</Label>
                  <p className="text-xs text-muted-foreground">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(slot => (
                      <label key={slot.id} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.preferredSlots.includes(slot.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <Checkbox checked={formData.preferredSlots.includes(slot.id)} onCheckedChange={() => toggleSlot(slot.id)} />
                        <span className="mr-1">{slot.icon}</span>
                        <span className="text-sm">{slot.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">Training Pace</Label>
                  <RadioGroup value={formData.pace} onValueChange={(v) => updateField('pace', v as PartnerPace)} className="space-y-2">
                    {[
                      { value: 'fast', label: 'Fast', desc: 'Move quickly, cover more ground' },
                      { value: 'steady', label: 'Steady', desc: 'Balanced pace, consistent progress' },
                      { value: 'slow_deep', label: 'Slow + Deep', desc: 'Take time, master concepts fully' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.pace === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <div><span className="font-medium">{option.label}</span><p className="text-xs text-muted-foreground">{option.desc}</p></div>
                        <RadioGroupItem value={option.value} />
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Communication & Accountability</CardTitle>
                <CardDescription>How do you want to be held accountable?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Communication Style</Label>
                  <RadioGroup value={formData.commStyle} onValueChange={(v) => updateField('commStyle', v as CommStyle)} className="space-y-2">
                    {[
                      { value: 'chat_only', label: 'Chat Only', desc: 'Text messages only' },
                      { value: 'voice_weekends', label: 'Voice on Weekends', desc: 'Chat + optional voice calls' },
                      { value: 'text_summaries', label: 'Text Summaries', desc: 'Daily async progress updates' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.commStyle === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <div><span className="font-medium">{option.label}</span><p className="text-xs text-muted-foreground">{option.desc}</p></div>
                        <RadioGroupItem value={option.value} />
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">Accountability Style</Label>
                  <RadioGroup value={formData.accountabilityStyle} onValueChange={(v) => updateField('accountabilityStyle', v as AccountabilityStyle)} className="space-y-2">
                    {[
                      { value: 'strict', label: 'Strict', desc: 'No excuses, high expectations' },
                      { value: 'supportive', label: 'Supportive', desc: 'Encouraging, understanding' },
                      { value: 'mixed', label: 'Mixed', desc: 'Balance of both approaches' }
                    ].map(option => (
                      <label key={option.value} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.accountabilityStyle === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <div><span className="font-medium">{option.label}</span><p className="text-xs text-muted-foreground">{option.desc}</p></div>
                        <RadioGroupItem value={option.value} />
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="p-4 rounded-lg border-2 border-border bg-card/30">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox checked={formData.noGhostingRule} onCheckedChange={(checked) => updateField('noGhostingRule', !!checked)} className="mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="font-medium">No-Ghosting Rule</span>
                        <Badge variant="outline" className="text-xs">Recommended</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Auto-rematch after 3 consecutive misses. Protects both partners.</p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setStep(prev => prev - 1)} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(prev => prev + 1)} disabled={!canProceed()}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || createCard.isPending} className="shadow-neon">
              <Zap className="w-4 h-4 mr-2" />
              {createCard.isPending ? 'Creating...' : 'Create Training Card'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingCardBuilder;
