import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import Solve from "./pages/Solve";
import Leaderboard from "./pages/Leaderboard";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Settings from "./pages/Settings";
import ContestsHome from "./pages/ContestsHome";
import ContestDetail from "./pages/ContestDetail";
import ContestLobby from "./pages/ContestLobby";
import ContestArena from "./pages/ContestArena";
import ContestLeaderboard from "./pages/ContestLeaderboard";
import ContestReport from "./pages/ContestReport";
import ContestHistory from "./pages/ContestHistory";
import Onboarding from "./pages/Onboarding";
import Battle from "./pages/Battle";
import ClanVsClanBattle from "./pages/ClanVsClanBattle";
import BattleHistory from "./pages/BattleHistory";
import BattleSession from "./pages/BattleSession";
import BattleResults from "./pages/BattleResults";
import Roadmap from "./pages/Roadmap";
import Planner from "./pages/Planner";
import Doubts from "./pages/Doubts";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import ChallengesList from "./pages/ChallengesList";
import NotFound from "./pages/NotFound";
// Partner Program Pages
import PartnerLanding from "./pages/PartnerLanding";
import TrainingCardBuilder from "./pages/TrainingCardBuilder";
import PartnerMatches from "./pages/PartnerMatches";
import PartnerProfile from "./pages/PartnerProfile";
import PartnerContract from "./pages/PartnerContract";
import DuoDashboard from "./pages/DuoDashboard";
import PartnerTrials from "./pages/PartnerTrials";
import PartnerReport from "./pages/PartnerReport";
// Championship Pages
import Championship from "./pages/Championship";
import ChampionshipProgress from "./pages/ChampionshipProgress";
import ChampionshipStandings from "./pages/ChampionshipStandings";
import HallOfChampions from "./pages/HallOfChampions";
// Analytics Pages
import GlyphHeatmapPage from "./pages/GlyphHeatmapPage";
// OA Arena Pages  
import OAArena from "./pages/OAArena";
import OAPacks from "./pages/OAPacks";
import OAPackDetail from "./pages/OAPackDetail";
import OAInstructions from "./pages/OAInstructions";
import OARoom from "./pages/OARoom";
import OASubmit from "./pages/OASubmit";
import OAReport from "./pages/OAReport";
import OAHistory from "./pages/OAHistory";
// Clan Arena Pages
import ClansHome from "./pages/ClansHome";
import ClansCreate from "./pages/ClansCreate";
import ClanDashboard from "./pages/ClanDashboard";
// Admin Pages
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProblems from "./pages/admin/AdminProblems";
import AdminContests from "./pages/admin/AdminContests";
import AdminClans from "./pages/admin/AdminClans";
import AdminBattles from "./pages/admin/AdminBattles";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminChampionship from "./pages/admin/AdminChampionship";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminOA from "./pages/admin/AdminOA";

// Phase 1: Student-focused app - mentor/clan features disabled
// Battle Mode is always available to all authenticated users
const App = () => {
  // Create QueryClient inside component to prevent HMR issues with React Query
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="codetrackx-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/challenges/:category" element={<ChallengesList />} />
              <Route path="/solve/:id" element={<Solve />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<PublicProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contests" element={<ContestsHome />} />
              <Route path="/contests/history" element={<ContestHistory />} />
              <Route path="/contests/:id" element={<ContestDetail />} />
              <Route path="/contests/:id/lobby" element={<ContestLobby />} />
              <Route path="/contests/:id/arena" element={<ContestArena />} />
              <Route path="/contests/:id/leaderboard" element={<ContestLeaderboard />} />
              <Route path="/contests/:id/report" element={<ContestReport />} />
              {/* Roadmap System - Independent feature */}
              <Route path="/roadmap/:roadmapId" element={<Roadmap />} />
              {/* Planner System */}
              <Route path="/planner" element={<Planner />} />
              {/* Doubts System */}
              <Route path="/doubts" element={<Doubts />} />
              {/* Company-Wise Problems */}
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:slug" element={<CompanyDetail />} />
              {/* Battle Mode - Always available to all authenticated users */}
              <Route path="/battle" element={<Battle />} />
              <Route path="/battle/clan/:id" element={<ClanVsClanBattle />} />
              <Route path="/battle/session/:sessionId" element={<BattleSession />} />
              <Route path="/battle/results/:sessionId" element={<BattleResults />} />
              <Route path="/battle/history" element={<BattleHistory />} />
              {/* Lock-In Partner Program */}
              <Route path="/partner" element={<PartnerLanding />} />
              <Route path="/partner/training-card" element={<TrainingCardBuilder />} />
              <Route path="/partner/matches" element={<PartnerMatches />} />
              <Route path="/partner/profile/:id" element={<PartnerProfile />} />
              <Route path="/partner/contract/:id" element={<PartnerContract />} />
              <Route path="/partner/duo/:id" element={<DuoDashboard />} />
              <Route path="/partner/trials" element={<PartnerTrials />} />
              <Route path="/partner/report/:id" element={<PartnerReport />} />
              {/* Championship */}
              <Route path="/championship" element={<Championship />} />
              <Route path="/championship/my-progress" element={<ChampionshipProgress />} />
              <Route path="/championship/standings" element={<ChampionshipStandings />} />
              <Route path="/hall-of-champions" element={<HallOfChampions />} />
              {/* Analytics */}
              <Route path="/analytics/glyph-heatmap" element={<GlyphHeatmapPage />} />
              {/* OA Arena */}
              <Route path="/oa" element={<OAArena />} />
              <Route path="/oa/packs" element={<OAPacks />} />
              <Route path="/oa/pack/:packId" element={<OAPackDetail />} />
              <Route path="/oa/start/:assessmentId" element={<OAInstructions />} />
              <Route path="/oa/attempt/:attemptId" element={<OARoom />} />
              <Route path="/oa/submit/:attemptId" element={<OASubmit />} />
              <Route path="/oa/report/:attemptId" element={<OAReport />} />
              <Route path="/oa/history" element={<OAHistory />} />
              {/* Clan Arena */}
              <Route path="/clans" element={<ClansHome />} />
              <Route path="/clans/create" element={<ClansCreate />} />
              <Route path="/clans/:id" element={<ClanDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            {/* Admin Panel — separate layout, role-gated */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/problems" element={<AdminProblems />} />
              <Route path="/admin/contests" element={<AdminContests />} />
              <Route path="/admin/clans" element={<AdminClans />} />
              <Route path="/admin/battles" element={<AdminBattles />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/championship" element={<AdminChampionship />} />
              <Route path="/admin/oa" element={<AdminOA />} />
              <Route path="/admin/system" element={<AdminSystem />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
