import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, Trophy, User, Users, Shield, ChevronRight, Star,
  Calendar, Timer, Target, Medal, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarWithFrame } from "@/components/championship/AvatarWithFrame";
import { 
  TRACKS,
  TrackType,
} from "@/lib/championshipData";
import { cn } from "@/lib/utils";

// Main Hall of Champions Page
export default function HallOfChampions() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTrack, setActiveTrack] = useState<TrackType>('solo');
  
  const availableYears = [2026];

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-600/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/10 blur-[150px] rounded-full" />
        
        {/* Decorative crowns */}
        <div className="absolute top-8 left-8 opacity-10">
          <Crown className="h-24 w-24 text-yellow-400 rotate-[-15deg]" />
        </div>
        <div className="absolute bottom-8 right-8 opacity-10">
          <Crown className="h-20 w-20 text-yellow-400 rotate-[15deg]" />
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <Crown className="h-16 w-16 text-yellow-400 drop-shadow-[0_0_30px_hsla(45,90%,55%,0.6)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              <span className="text-yellow-400">Hall of Champions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Legends who conquered the CodeLock Championship. Their names are etched in history.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Tabs value={activeTrack} onValueChange={(v) => setActiveTrack(v as TrackType)}>
            <TabsList>
              <TabsTrigger value="solo" className="gap-2">
                <User className="h-4 w-4" />
                Solo
              </TabsTrigger>
              <TabsTrigger value="duo" className="gap-2">
                <Users className="h-4 w-4" />
                Duo
              </TabsTrigger>
              <TabsTrigger value="clan" className="gap-2">
                <Shield className="h-4 w-4" />
                Clan
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content — Always empty state since no real champions yet */}
      <div className="container mx-auto px-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="py-16 text-center">
            <div className="relative mb-6 inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 blur-3xl rounded-full" />
              <Trophy className="relative h-16 w-16 mx-auto text-yellow-400/40 mb-4" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">First Champion Not Yet Crowned</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The {TRACKS[activeTrack].title} champion for {selectedYear} has not been crowned yet. 
              Compete in the Championship to become the first legend.
            </p>
            <Link to="/championship">
              <Button className="mt-6">
                View Current Season <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Back to Championship */}
      <div className="container mx-auto px-4 mt-8">
        <Link to="/championship">
          <Button variant="outline" className="gap-2">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Championship
          </Button>
        </Link>
      </div>
    </div>
  );
}
