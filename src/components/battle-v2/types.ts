/**
 * Blue Lock Battle v2 — shared type contracts.
 * All v2 components are prop-driven; no hardcoded mock data ships.
 */

export type Accent = "neon" | "ember" | "gold";

export type BattlePhase =
  | "entry"
  | "searching"
  | "pre_battle"
  | "live"
  | "post_battle";

export type Verdict = "AC" | "WA" | "TLE" | "RE" | "PENDING";

export interface BattleProfile {
  id: string;
  handle: string;
  initial: string;
  rank?: string;
  lp?: number;
  role?: string;
}

export interface BattleTeam {
  id: string;
  name: string;
  seed?: string;
  elo?: number;
  accent: "neon" | "ember";
  players: BattleProfile[];
}

export interface MatchParticipant extends BattleProfile {
  isCaptain?: boolean;
  accent: "neon" | "ember";
}

export interface RoundResult {
  round: number;
  problem: string;
  difficulty: "Easy" | "Medium" | "Hard";
  winner: "blue" | "red";
  blueTime: string;
  redTime: string;
  margin: string;
}

export interface BattleResultSummary {
  winnerName: string;
  loserName: string;
  finalScore: string;
  duration: string;
  lpGain: number;
  lpLoss: number;
}
