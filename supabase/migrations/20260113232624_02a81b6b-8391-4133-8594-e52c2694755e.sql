-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  problem_statement TEXT NOT NULL,
  examples JSONB NOT NULL DEFAULT '[]',
  constraints TEXT[] NOT NULL DEFAULT '{}',
  hints TEXT[] DEFAULT '{}',
  rank_impact_win INTEGER NOT NULL DEFAULT 1,
  rank_impact_loss INTEGER NOT NULL DEFAULT 0,
  time_limit INTEGER NOT NULL DEFAULT 30,
  is_daily BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge completions table
CREATE TABLE public.challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  language TEXT,
  runtime_ms INTEGER,
  memory_kb INTEGER,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- Challenges: authenticated users can read active challenges
CREATE POLICY "Authenticated users can read active challenges"
ON public.challenges
FOR SELECT
TO authenticated
USING (is_active = true);

-- Challenge completions: users can read only their own completions
CREATE POLICY "Users can read their own completions"
ON public.challenge_completions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Challenge completions: users can insert only their own completions
CREATE POLICY "Users can insert their own completions"
ON public.challenge_completions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- No updates or deletes allowed on completions (immutable)
CREATE POLICY "Completions are immutable"
ON public.challenge_completions
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Completions cannot be deleted"
ON public.challenge_completions
FOR DELETE
TO authenticated
USING (false);

-- Create index for performance
CREATE INDEX idx_challenge_completions_challenge_id ON public.challenge_completions(challenge_id);
CREATE INDEX idx_challenge_completions_user_id ON public.challenge_completions(user_id);
CREATE INDEX idx_challenges_difficulty ON public.challenges(difficulty);
CREATE INDEX idx_challenges_tags ON public.challenges USING GIN(tags);

-- Create a function to get challenge solve counts (secure aggregation)
CREATE OR REPLACE FUNCTION public.get_challenge_stats()
RETURNS TABLE (
  challenge_id UUID,
  solve_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cc.challenge_id,
    COUNT(DISTINCT cc.user_id) as solve_count
  FROM challenge_completions cc
  GROUP BY cc.challenge_id;
$$;

-- Create RPC for completing a challenge (secure insertion with validation)
CREATE OR REPLACE FUNCTION public.complete_challenge(
  p_challenge_id UUID,
  p_language TEXT DEFAULT NULL,
  p_runtime_ms INTEGER DEFAULT NULL,
  p_memory_kb INTEGER DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_challenge RECORD;
  v_result RECORD;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get challenge details
  SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Challenge not found');
  END IF;

  -- Check if already completed
  IF EXISTS (SELECT 1 FROM challenge_completions WHERE user_id = v_user_id AND challenge_id = p_challenge_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already completed');
  END IF;

  -- Insert completion
  INSERT INTO challenge_completions (user_id, challenge_id, language, runtime_ms, memory_kb, xp_earned)
  VALUES (v_user_id, p_challenge_id, p_language, p_runtime_ms, p_memory_kb, v_challenge.xp_reward)
  RETURNING * INTO v_result;

  -- Update user XP in profiles
  UPDATE profiles SET xp = COALESCE(xp, 0) + v_challenge.xp_reward WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'xp_earned', v_challenge.xp_reward,
    'completion_id', v_result.id
  );
END;
$$;

-- Seed initial challenges (Private Beta set)
INSERT INTO public.challenges (slug, title, description, difficulty, tags, xp_reward, problem_statement, examples, constraints, hints, rank_impact_win, rank_impact_loss, time_limit) VALUES
('two-sum', 'Two Sum', 'Find two numbers that sum to a target.', 'easy', ARRAY['arrays', 'hash-map'], 50, 
'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
'[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."}]',
ARRAY['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
ARRAY['Consider using a hash map to store visited values.'], 1, 0, 30),

('binary-tree-depth', 'Binary Tree Maximum Depth', 'Find the maximum depth of a binary tree using DFS.', 'medium', ARRAY['trees', 'dfs', 'recursion'], 100,
'Given the root of a binary tree, return its maximum depth. A binary tree''s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
'[{"input": "root = [3,9,20,null,null,15,7]", "output": "3", "explanation": "The tree has a maximum depth of 3."}]',
ARRAY['The number of nodes in the tree is in the range [0, 10^4].', '-100 <= Node.val <= 100'],
ARRAY['Think recursively: depth = 1 + max(left depth, right depth).'], 2, 1, 45),

('climbing-stairs', 'Climbing Stairs', 'Dynamic programming classic - count distinct ways to climb stairs.', 'medium', ARRAY['dp', 'optimization'], 100,
'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
'[{"input": "n = 2", "output": "2", "explanation": "1. 1 step + 1 step. 2. 2 steps"}, {"input": "n = 3", "output": "3"}]',
ARRAY['1 <= n <= 45'],
ARRAY['This is a classic Fibonacci sequence problem.', 'Can you optimize space to O(1)?'], 3, 1, 45),

('reverse-linked-list', 'Reverse Linked List', 'Reverse a singly linked list. Master pointer manipulation.', 'easy', ARRAY['linked-list', 'pointers'], 50,
'Given the head of a singly linked list, reverse the list, and return the reversed list.',
'[{"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}, {"input": "head = [1,2]", "output": "[2,1]"}]',
ARRAY['The number of nodes in the list is in the range [0, 5000].', '-5000 <= Node.val <= 5000'],
ARRAY['Track three pointers: prev, current, and next.'], 1, 0, 30),

('valid-parentheses', 'Valid Parentheses', 'Check if brackets are balanced using a stack.', 'easy', ARRAY['strings', 'stack'], 50,
'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. An input string is valid if: Open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.',
'[{"input": "s = \"()\"", "output": "true"}, {"input": "s = \"()[]{}\"", "output": "true"}, {"input": "s = \"(]\"", "output": "false"}]',
ARRAY['1 <= s.length <= 10^4', 's consists of parentheses only ''()[]{}'''],
ARRAY['Use a stack to track opening brackets.'], 1, 0, 25),

('merge-sorted-arrays', 'Merge Sorted Arrays', 'Merge two sorted arrays in-place.', 'easy', ARRAY['arrays', 'two-pointers'], 50,
'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums2 into nums1 as one sorted array.',
'[{"input": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", "output": "[1,2,2,3,5,6]"}]',
ARRAY['nums1.length == m + n', 'nums2.length == n', '0 <= m, n <= 200'],
ARRAY['Start merging from the end to avoid overwriting.'], 1, 0, 30),

('maximum-subarray', 'Maximum Subarray', 'Find the contiguous subarray with the largest sum using Kadane''s algorithm.', 'medium', ARRAY['arrays', 'dp'], 100,
'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
'[{"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "The subarray [4,-1,2,1] has the largest sum 6."}]',
ARRAY['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
ARRAY['Kadane''s algorithm: current_max = max(nums[i], current_max + nums[i])'], 2, 1, 40),

('network-delay', 'Network Delay Time', 'Find shortest paths in a weighted graph using Dijkstra.', 'hard', ARRAY['graphs', 'dijkstra', 'shortest-path'], 200,
'You are given a network of n nodes. Find the minimum time it takes for all nodes to receive a signal sent from a starting node k. If impossible, return -1.',
'[{"input": "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", "output": "2"}]',
ARRAY['1 <= k <= n <= 100', '1 <= times.length <= 6000'],
ARRAY['Use Dijkstra''s algorithm with a priority queue.'], 5, 2, 60),

('word-break', 'Word Break', 'Determine if a string can be segmented using dictionary words.', 'hard', ARRAY['dp', 'memoization', 'strings'], 200,
'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of dictionary words.',
'[{"input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]", "output": "true", "explanation": "\"leetcode\" can be segmented as \"leet code\"."}]',
ARRAY['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', 'All strings in wordDict are unique.'],
ARRAY['Consider using dynamic programming with memoization.'], 5, 2, 60),

('lru-cache', 'LRU Cache', 'Design and implement an LRU (Least Recently Used) cache.', 'hard', ARRAY['design', 'hash-map', 'linked-list'], 250,
'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get and put operations in O(1) time.',
'[{"input": "[\"LRUCache\",\"put\",\"put\",\"get\",\"put\",\"get\"]\\n[[2],[1,1],[2,2],[1],[3,3],[2]]", "output": "[null,null,null,1,null,-1]"}]',
ARRAY['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5', 'At most 2 * 10^5 calls to get and put.'],
ARRAY['Use a HashMap combined with a doubly linked list.'], 6, 3, 75);