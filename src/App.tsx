import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import Solve from "./pages/Solve";
import Leaderboard from "./pages/Leaderboard";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Contests from "./pages/Contests";
import ContestLive from "./pages/ContestLive";
import Battle from "./pages/Battle";
import Mentors from "./pages/Mentors";
import MentorProfile from "./pages/MentorProfile";
import ClanHome from "./pages/ClanHome";
import MentorDashboard from "./pages/MentorDashboard";
import ClanVsClanBattle from "./pages/ClanVsClanBattle";
import BattleHistory from "./pages/BattleHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/solve/:id" element={<Solve />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contests" element={<Contests />} />
              <Route path="/contest/:id/live" element={<ContestLive />} />
              <Route path="/battle" element={<Battle />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/mentor/:id" element={<MentorProfile />} />
              <Route path="/clan/:id" element={<ClanHome />} />
              <Route path="/mentor/dashboard" element={<MentorDashboard />} />
              <Route path="/battle/clan-vs-clan" element={<ClanVsClanBattle />} />
              <Route path="/battles" element={<BattleHistory />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
