import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ChevronRight, Loader2, GraduationCap, Briefcase, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const roadmapOptions = [
  { id: 'dsa', label: 'Data Structures & Algorithms', description: 'Master DSA for interviews and competitions', icon: '🧠' },
];

const collegeYears = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
  { value: '5+', label: '5th Year or above' },
];

const experienceYears = [
  { value: '0', label: 'Less than 1 year' },
  { value: '1', label: '1-2 years' },
  { value: '3', label: '3-5 years' },
  { value: '5', label: '5-10 years' },
  { value: '10', label: '10+ years' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [primaryRoadmap, setPrimaryRoadmap] = useState('dsa');
  const [occupationType, setOccupationType] = useState<'student' | 'professional' | ''>('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeYear, setCollegeYear] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          primary_roadmap: primaryRoadmap,
          occupation_type: occupationType || null,
          college_name: collegeName.trim() || null,
          college_year: collegeYear || null,
          years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile to get updated data
      await refreshProfile();

      toast.success('Welcome to CodeLock! 🚀');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save your preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="h-10 w-10 text-primary" />
            <span className="font-display text-3xl font-bold text-gradient-electric">
              CodeLock
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Welcome to the Arena! 🎯
          </h1>
          <p className="text-muted-foreground">
            Let's personalize your experience. This only takes a minute.
          </p>
        </div>

        {/* Primary Roadmap Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Choose Your Path
            </CardTitle>
            <CardDescription>
              Select the roadmap you want to focus on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={primaryRoadmap} onValueChange={setPrimaryRoadmap}>
              {roadmapOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-heading font-semibold">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Occupation Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              What describes you best?
            </CardTitle>
            <CardDescription>
              This helps us tailor content to your needs (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOccupationType('student')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  occupationType === 'student'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <GraduationCap className={`h-8 w-8 mb-2 ${occupationType === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-heading font-semibold">Student</p>
                <p className="text-sm text-muted-foreground">Currently in college or university</p>
              </button>
              
              <button
                type="button"
                onClick={() => setOccupationType('professional')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  occupationType === 'professional'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Briefcase className={`h-8 w-8 mb-2 ${occupationType === 'professional' ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-heading font-semibold">Working Professional</p>
                <p className="text-sm text-muted-foreground">Currently employed or freelancing</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Conditional Fields based on occupation */}
        {occupationType === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle>College Details</CardTitle>
              <CardDescription>Optional - helps us connect you with peers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input
                  id="collegeName"
                  placeholder="e.g., IIT Delhi"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collegeYear">Year of Study</Label>
                <Select value={collegeYear} onValueChange={setCollegeYear}>
                  <SelectTrigger id="collegeYear">
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    {collegeYears.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {occupationType === 'professional' && (
          <Card>
            <CardHeader>
              <CardTitle>Experience Level</CardTitle>
              <CardDescription>Optional - helps us recommend appropriate challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select your experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceYears.map((exp) => (
                      <SelectItem key={exp.value} value={exp.value}>
                        {exp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full md:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Start Learning
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can update these preferences anytime in Settings
        </p>
      </div>
    </div>
  );
}
