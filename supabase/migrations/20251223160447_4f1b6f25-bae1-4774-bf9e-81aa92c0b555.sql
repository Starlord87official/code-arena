-- Create battle_history table for storing completed battles
CREATE TABLE public.battle_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id TEXT NOT NULL,
  clan_a_id TEXT NOT NULL,
  clan_a_name TEXT NOT NULL,
  clan_a_score INTEGER NOT NULL DEFAULT 0,
  clan_b_id TEXT NOT NULL,
  clan_b_name TEXT NOT NULL,
  clan_b_score INTEGER NOT NULL DEFAULT 0,
  winner TEXT CHECK (winner IN ('A', 'B', 'tie')),
  mvp_username TEXT,
  mvp_xp INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  xp_change INTEGER NOT NULL DEFAULT 0,
  elo_change INTEGER NOT NULL DEFAULT 0,
  problems_solved_a INTEGER NOT NULL DEFAULT 0,
  problems_solved_b INTEGER NOT NULL DEFAULT 0,
  total_problems INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.battle_history ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (battles are public records)
CREATE POLICY "Battle history is publicly readable"
  ON public.battle_history
  FOR SELECT
  USING (true);

-- Create policy for system inserts (no auth required for demo)
CREATE POLICY "Anyone can insert battle history"
  ON public.battle_history
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_battle_history_clan_a ON public.battle_history(clan_a_id);
CREATE INDEX idx_battle_history_clan_b ON public.battle_history(clan_b_id);
CREATE INDEX idx_battle_history_ended_at ON public.battle_history(ended_at DESC);

-- Enable realtime for battle history
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_history;