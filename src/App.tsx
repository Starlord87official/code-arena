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
import Contests from "./pages/Contests";
import ContestLive from "./pages/ContestLive";
import Onboarding from "./pages/Onboarding";
import Battle from "./pages/Battle";
import ClanVsClanBattle from "./pages/ClanVsClanBattle";
import BattleHistory from "./pages/BattleHistory";
import BattleSession from "./pages/BattleSession";
import Roadmap from "./pages/Roadmap";
import Planner from "./pages/Planner";
import Doubts from "./pages/Doubts";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import NotFound from "./pages/NotFound";

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
              <Route path="/solve/:id" element={<Solve />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<PublicProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contests" element={<Contests />} />
              <Route path="/contest/:id/live" element={<ContestLive />} />
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
              <Route path="/battle/history" element={<BattleHistory />} />
              <Route path="*" element={<NotFound />} />
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
