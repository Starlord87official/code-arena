
-- =============================================
-- OA Arena Module - Database Schema
-- =============================================

-- 1. OA Packs
CREATE TABLE public.oa_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  role_track TEXT NOT NULL DEFAULT 'sde-intern',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  duration_minutes INT NOT NULL DEFAULT 60,
  tags TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT 'clipboard-check',
  is_featured BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oa_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view packs" ON public.oa_packs FOR SELECT USING (auth.uid() IS NOT NULL);

-- 2. OA Assessments
CREATE TABLE public.oa_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES public.oa_packs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  rules_json JSONB DEFAULT '{"fullscreenRecommended": true, "tabSwitchLogged": true, "navigationFree": true}'::jsonb,
  sections_json JSONB DEFAULT '[]'::jsonb,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oa_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view assessments" ON public.oa_assessments FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. OA Questions
CREATE TABLE public.oa_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.oa_assessments(id) ON DELETE CASCADE,
  section_index INT NOT NULL DEFAULT 0,
  question_order INT NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('coding', 'mcq', 'debug', 'sql')),
  statement TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  points INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oa_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view questions" ON public.oa_questions FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. OA Attempts
CREATE TABLE public.oa_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_id UUID NOT NULL REFERENCES public.oa_assessments(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score INT DEFAULT 0,
  max_score INT DEFAULT 0,
  integrity_json JSONB DEFAULT '{"tabSwitches": 0, "fullscreenExits": 0, "copyPasteCount": 0}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'submitted', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oa_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON public.oa_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own attempts" ON public.oa_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON public.oa_attempts FOR UPDATE USING (auth.uid() = user_id);

-- 5. OA Attempt Answers
CREATE TABLE public.oa_attempt_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.oa_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.oa_questions(id) ON DELETE CASCADE,
  answer TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'unseen' CHECK (status IN ('unseen', 'seen', 'attempted', 'solved', 'marked')),
  time_spent_sec INT DEFAULT 0,
  score INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

ALTER TABLE public.oa_attempt_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own answers" ON public.oa_attempt_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.oa_attempts WHERE id = attempt_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create own answers" ON public.oa_attempt_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.oa_attempts WHERE id = attempt_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own answers" ON public.oa_attempt_answers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.oa_attempts WHERE id = attempt_id AND user_id = auth.uid())
);

-- 6. OA Readiness
CREATE TABLE public.oa_readiness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  readiness_score INT DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  oa_streak INT DEFAULT 0,
  total_attempts INT DEFAULT 0,
  best_score INT DEFAULT 0,
  weak_topics TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oa_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own readiness" ON public.oa_readiness FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readiness" ON public.oa_readiness FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own readiness" ON public.oa_readiness FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA
-- =============================================

-- Pack 1: SDE Intern OA Pack
INSERT INTO public.oa_packs (id, title, description, role_track, difficulty, duration_minutes, tags, icon, is_featured, order_index)
VALUES (
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  'SDE Intern OA Pack',
  'Simulate real intern-level online assessments. Covers fundamentals: arrays, strings, basic algorithms, and introductory SQL. Perfect for campus placement prep.',
  'sde-intern',
  'easy',
  60,
  ARRAY['arrays', 'strings', 'sorting', 'sql-basics', 'time-complexity'],
  'graduation-cap',
  true,
  1
);

-- Pack 2: SDE-1 OA Pack
INSERT INTO public.oa_packs (id, title, description, role_track, difficulty, duration_minutes, tags, icon, is_featured, order_index)
VALUES (
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  'SDE-1 OA Pack',
  'Industry-grade assessments for experienced candidates. Covers dynamic programming, graph traversal, system thinking, and advanced SQL. Timed under real pressure.',
  'sde-1',
  'hard',
  90,
  ARRAY['dynamic-programming', 'graphs', 'trees', 'sql-advanced', 'debugging'],
  'briefcase',
  true,
  2
);

-- Assessment 1 for SDE Intern Pack
INSERT INTO public.oa_assessments (id, pack_id, title, duration_minutes, rules_json, sections_json, order_index)
VALUES (
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  'Mock Assessment 1 — Fundamentals',
  60,
  '{"fullscreenRecommended": true, "tabSwitchLogged": true, "navigationFree": true, "sectionTimers": false}'::jsonb,
  '[{"name": "Section A — MCQ", "questionCount": 1}, {"name": "Section B — Coding", "questionCount": 2}, {"name": "Section C — SQL", "questionCount": 1}]'::jsonb,
  1
);

-- Assessment 2 for SDE-1 Pack
INSERT INTO public.oa_assessments (id, pack_id, title, duration_minutes, rules_json, sections_json, order_index)
VALUES (
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  'Mock Assessment 1 — Advanced',
  90,
  '{"fullscreenRecommended": true, "tabSwitchLogged": true, "navigationFree": true, "sectionTimers": false}'::jsonb,
  '[{"name": "Section A — Debug", "questionCount": 1}, {"name": "Section B — Coding", "questionCount": 2}, {"name": "Section C — MCQ", "questionCount": 1}]'::jsonb,
  1
);

-- Questions for SDE Intern Assessment 1
-- Q1: MCQ (Section A)
INSERT INTO public.oa_questions (assessment_id, section_index, question_order, type, statement, difficulty, tags, config_json, points)
VALUES (
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  0, 1, 'mcq',
  'What is the time complexity of searching for an element in a balanced binary search tree with N nodes?',
  'easy',
  ARRAY['time-complexity', 'trees'],
  '{"options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"], "correctIndices": [1], "multiSelect": false}'::jsonb,
  10
);

-- Q2: Coding (Section B)
INSERT INTO public.oa_questions (assessment_id, section_index, question_order, type, statement, difficulty, tags, config_json, points)
VALUES (
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  1, 1, 'coding',
  E'## Target Pair Sum\n\nGiven an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.\n\n### Constraints\n- 2 ≤ nums.length ≤ 10⁴\n- -10⁹ ≤ nums[i] ≤ 10⁹\n- Exactly one valid answer exists\n\n### Examples\n**Input:** nums = [2, 7, 11, 15], target = 9\n**Output:** [0, 1]\n\n**Input:** nums = [3, 2, 4], target = 6\n**Output:** [1, 2]',
  'easy',
  ARRAY['arrays', 'hashing'],
  '{"starterCode": {"javascript": "function targetPairSum(nums, target) {\n  // Your code here\n}", "python": "def target_pair_sum(nums, target):\n    # Your code here\n    pass"}, "testCases": [{"input": "[2,7,11,15], 9", "output": "[0,1]", "isHidden": false, "weight": 10}, {"input": "[3,2,4], 6", "output": "[1,2]", "isHidden": false, "weight": 10}, {"input": "[1,5,3,7,2], 9", "output": "[1,3]", "isHidden": true, "weight": 15}, {"input": "[-1,0,1,2], 1", "output": "[0,2]", "isHidden": true, "weight": 15}]}'::jsonb,
  50
);

-- Q3: Coding (Section B)
INSERT INTO public.oa_questions (assessment_id, section_index, question_order, type, statement, difficulty, tags, config_json, points)
VALUES (
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  1, 2, 'coding',
  E'## Balanced Brackets\n\nGiven a string containing only the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string has balanced brackets.\n\nA string is balanced if:\n- Every opening bracket has a corresponding closing bracket of the same type\n- Brackets are closed in the correct order\n\n### Constraints\n- 0 ≤ s.length ≤ 10⁴\n- s consists of brackets only\n\n### Examples\n**Input:** s = "()[]{}"\n**Output:** true\n\n**Input:** s = "(]"\n**Output:** false\n\n**Input:** s = "([{}])"\n**Output:** true',
  'easy',
  ARRAY['strings', 'stacks'],
  '{"starterCode": {"javascript": "function isBalanced(s) {\n  // Your code here\n}", "python": "def is_balanced(s):\n    # Your code here\n    pass"}, "testCases": [{"input": "\"()[]{}\"", "output": "true", "isHidden": false, "weight": 10}, {"input": "\"(]\"", "output": "false", "isHidden": false, "weight": 10}, {"input": "\"([{}])\"", "output": "true", "isHidden": true, "weight": 15}, {"input": "\"\"", "output": "true", "isHidden": true, "weight": 15}]}'::jsonb,
  50
);

-- Q4: SQL (Section C)
INSERT INTO public.oa_questions (assessment_id, section_index, question_order, type, statement, difficulty, tags, config_json, points)
VALUES (
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  2, 1, 'sql',
  E'## Employee Department Query\n\nYou have two tables:\n\n**employees** (id INT, name TEXT, department_id INT, salary INT)\n**departments** (id INT, name TEXT)\n\nWrite a SQL query to find the name of each department and the average salary of its employees. Only include departments with an average salary greater than 50000. Order results by average salary descending.\n\n### Expected Output Columns\ndepartment_name, avg_salary',
  'easy',
  ARRAY['sql-basics', 'joins', 'aggregation'],
  '{"schema": "CREATE TABLE employees (id INT, name TEXT, department_id INT, salary INT);\nCREATE TABLE departments (id INT, name TEXT);", "sampleData": "INSERT INTO employees VALUES (1, ''Alice'', 1, 70000), (2, ''Bob'', 1, 60000), (3, ''Charlie'', 2, 45000), (4, ''Diana'', 2, 55000), (5, ''Eve'', 3, 80000);\nINSERT INTO departments VALUES (1, ''Engineering''), (2, ''Marketing''), (3, ''Executive'');", "expectedOutput": "Engineering, 65000\nExecutive, 80000", "hint": "Use JOIN, GROUP BY, and HAVING clauses"}'::jsonb,
  40
);

-- Questions for SDE-1 Assessment 1
-- Q1: Debug (Section A)
INSERT INTO public.oa_questions (assessment_id, section_index, question_order, type, statement, difficulty, tags, config_json, points)
VALUES (
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
  0, 1, 'debug',
  E'## Fix the Merge Sort\n\nThe following merge sort implementation has bugs that cause incorrect output. Find and fix all issues.\n\nThe function should sort an array of integers in ascending order.',
  'medium',
  ARRAY['sorting', 'debugging', 'recursion'],
  '{"brokenCode": "function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  \n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  \n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  \n  while (i < left.length && j < right.length) {\n    if (left[i] < right[j]) {\n      result.push(left[i]);\n      // Bug: missing i++\n    } else {\n      result.push(right[j]);\n      j++;\n    }\n  }\n  \n  // Bug: should concat remaining elements\n  return result;\n}", "language": "javascript", "hint": "Check the merge function: are all elements being processed? Are remaining elements included?", "testCases": [{"input": "[3,1,4,1,5,9]", "output": "[1,1,3,4,5,9]"}, {"input": "[5,4,3,2,1]", "output": "[1,2,3,4,5]"}]}'::jsonb,
  40
);

-- Q2: Coding (Section B)
INSERT INTO public.oa_questions (assessment_id, section_index, question_order, type, statement, difficulty, tags, config_json, points)
VALUES (
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
  1, 1, 'coding',
  E'## Longest Non-Repeating Window\n\nGiven a string `s`, find the length of the longest substring without repeating characters.\n\n### Constraints\n- 0 ≤ s.length ≤ 5 × 10⁴\n- s consists of English letters, digits, symbols and spaces\n\n### Examples\n**Input:** s = "abcabcbb"\n**Output:** 3 (The answer is "abc")\n\n**Input:** s = "bbbbb"\n**Output:** 1\n\n**Input:** s = "pwwkew"\n**Output:** 3 (The answer is "wke")',
  'medium',
  ARRAY['strings', 'sliding-window', 'hashing'],
  '{"starterCode": {"javascript": "function longestNonRepeating(s) {\n  // Your code here\n}", "python": "def longest_non_repeating(s):\n    # Your code here\n    pass"}, "testCases": [{"input": "\"abcabcbb\"", "output": "3", "isHidden": false, "weight": 10}, {"input": "\"bbbbb\"", "output": "1", "isHidden": false, "weight": 10}, {"input": "\"pwwkew\"", "output": "3", "isHidden": true, "weight": 15}, {"input": "\"\"", "output": "0", "isHidden": true, "weight": 15}]}'::jsonb,
  50
);

-- Q3: Coding (Section B)
INSERT INTO public.oa_questions (assessment_id, section_index, question_order, type, statement, difficulty, tags, config_json, points)
VALUES (
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
  1, 2, 'coding',
  E'## Island Counter\n\nGiven an m × n 2D grid map of ''1''s (land) and ''0''s (water), count the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.\n\n### Constraints\n- 1 ≤ m, n ≤ 300\n- grid[i][j] is ''0'' or ''1''\n\n### Examples\n**Input:**\n```\n[\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]\n```\n**Output:** 3',
  'hard',
  ARRAY['graphs', 'bfs', 'dfs', 'matrix'],
  '{"starterCode": {"javascript": "function countIslands(grid) {\n  // Your code here\n}", "python": "def count_islands(grid):\n    # Your code here\n    pass"}, "testCases": [{"input": "[[\"1\",\"1\",\"0\"],[\"0\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]", "output": "2", "isHidden": false, "weight": 10}, {"input": "[[\"1\",\"0\",\"1\"],[\"0\",\"0\",\"0\"],[\"1\",\"0\",\"1\"]]", "output": "4", "isHidden": false, "weight": 10}, {"input": "[[\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\"]]", "output": "1", "isHidden": true, "weight": 15}, {"input": "[[\"0\"]]", "output": "0", "isHidden": true, "weight": 15}]}'::jsonb,
  60
);

-- Q4: MCQ (Section C)
INSERT INTO public.oa_questions (assessment_id, section_index, question_order, type, statement, difficulty, tags, config_json, points)
VALUES (
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
  2, 1, 'mcq',
  'Which of the following are true about hash tables? (Select all that apply)',
  'medium',
  ARRAY['hashing', 'data-structures'],
  '{"options": ["Average-case lookup time is O(1)", "Worst-case lookup time is O(n) with poor hash function", "Hash tables maintain insertion order in all implementations", "Collision resolution can be done via chaining or open addressing"], "correctIndices": [0, 1, 3], "multiSelect": true}'::jsonb,
  20
);
