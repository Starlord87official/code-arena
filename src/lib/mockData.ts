// Mock user data for development
export interface User {
  uid: string;
  username: string;
  email: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  division: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';
  elo: number;
  joinedAt: Date;
  solvedChallenges: number;
  rank: number;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  tags: string[];
  xpReward: number;
  description: string;
  solvedBy: number;
  successRate: number;
  // Enhanced problem details
  problemStatement: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints?: string[];
  rankImpact: { win: number; loss: number };
  timeLimit: number; // in minutes
  isDaily?: boolean;
  expiresIn?: number; // hours until daily expires
}

export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  status: 'passed' | 'failed' | 'pending';
  submittedAt: Date;
  language: string;
  runtime: number;
  memory: number;
}

export interface Contest {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  problems: string[];
  participants: number;
  status: 'upcoming' | 'live' | 'ended';
  xpReward: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'contest' | 'system' | 'streak' | 'duel' | 'admin' | 'xp' | 'rank';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  type: 'contest' | 'reminder' | 'deadline' | 'streak';
  date: Date;
  description: string;
}

// Mock current user
export const mockUser: User = {
  uid: 'user-001',
  username: 'CodeWarrior',
  email: 'warrior@codelock.io',
  avatar: '',
  xp: 4250,
  level: 12,
  streak: 7,
  division: 'diamond',
  elo: 1847,
  joinedAt: new Date('2024-01-15'),
  solvedChallenges: 87,
  rank: 156,
};

// Mock challenges with enhanced data
export const mockChallenges: Challenge[] = [
  {
    id: 'ch-001',
    title: 'Two Sum Annihilation',
    difficulty: 'easy',
    tags: ['arrays', 'hash-map'],
    xpReward: 50,
    description: 'Find two numbers that sum to a target. Destroy inefficiency.',
    solvedBy: 15420,
    successRate: 78,
    problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Your mission:** Prove you can handle the basics. This is where champions begin.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    hints: ['A brute force approach has O(n²) complexity. Can you do better?', 'Consider using a hash map to store visited values.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 30,
    isDaily: true,
    expiresIn: 4,
  },
  {
    id: 'ch-002',
    title: 'Binary Tree Dominance',
    difficulty: 'medium',
    tags: ['trees', 'dfs', 'recursion'],
    xpReward: 100,
    description: 'Assert dominance over binary tree traversal. No weak solutions.',
    solvedBy: 8930,
    successRate: 54,
    problemStatement: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

**Your mission:** Navigate the tree with precision. Weak recursion will be exposed.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'The tree has a maximum depth of 3.' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 10^4].',
      '-100 <= Node.val <= 100',
    ],
    hints: ['Think recursively: the depth of a tree is 1 + max(depth of left, depth of right).'],
    rankImpact: { win: 2, loss: 1 },
    timeLimit: 45,
  },
  {
    id: 'ch-003',
    title: 'Dynamic Programming Ego',
    difficulty: 'hard',
    tags: ['dp', 'optimization'],
    xpReward: 200,
    description: 'Only those with true ego can solve this DP problem optimally.',
    solvedBy: 2340,
    successRate: 28,
    problemStatement: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

But here is the twist: you must also track the maximum steps taken in a single move across all paths.

**Your mission:** This separates the elite from the average. Brute force will fail. Only optimal DP solutions survive.`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
      { input: 'n = 3', output: '3', explanation: '1. 1+1+1\n2. 1+2\n3. 2+1' },
      { input: 'n = 45', output: '1836311903' },
    ],
    constraints: [
      '1 <= n <= 45',
      'Your solution must run in O(n) time.',
      'Memory usage will be monitored.',
    ],
    hints: ['This is a classic Fibonacci sequence problem.', 'Can you optimize space to O(1)?'],
    rankImpact: { win: 5, loss: 2 },
    timeLimit: 60,
  },
  {
    id: 'ch-004',
    title: 'Graph Conquest',
    difficulty: 'hard',
    tags: ['graphs', 'bfs', 'shortest-path'],
    xpReward: 250,
    description: 'Conquer the graph. Find the shortest path to victory.',
    solvedBy: 1890,
    successRate: 32,
    problemStatement: `You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges times[i] = (ui, vi, wi).

Find the minimum time it takes for all nodes to receive a signal sent from a starting node k. If it is impossible for all nodes to receive the signal, return -1.

**Your mission:** Master Dijkstra's algorithm. The weak fall here.`,
    examples: [
      { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2' },
      { input: 'times = [[1,2,1]], n = 2, k = 1', output: '1' },
      { input: 'times = [[1,2,1]], n = 2, k = 2', output: '-1' },
    ],
    constraints: [
      '1 <= k <= n <= 100',
      '1 <= times.length <= 6000',
      '1 <= ui, vi <= n',
      'ui != vi',
      '0 <= wi <= 100',
    ],
    rankImpact: { win: 6, loss: 3 },
    timeLimit: 75,
  },
  {
    id: 'ch-005',
    title: 'The Ultimate Recursion',
    difficulty: 'extreme',
    tags: ['recursion', 'memoization', 'advanced'],
    xpReward: 500,
    description: 'Only legends complete this. There is only one #1.',
    solvedBy: 234,
    successRate: 8,
    problemStatement: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

**Your mission:** This is the ultimate test. 92% fail. The elite 8% prove their worth here. There are no second chances.`,
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true', explanation: 'Return true because "applepenapple" can be segmented as "apple pen apple".' },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false' },
    ],
    constraints: [
      '1 <= s.length <= 300',
      '1 <= wordDict.length <= 1000',
      '1 <= wordDict[i].length <= 20',
      's and wordDict[i] consist of only lowercase English letters.',
      'All strings in wordDict are unique.',
    ],
    hints: ['Consider using dynamic programming with memoization.', 'Think about what subproblems you need to solve.'],
    rankImpact: { win: 15, loss: 5 },
    timeLimit: 90,
  },
  {
    id: 'ch-006',
    title: 'String Manipulation Arena',
    difficulty: 'easy',
    tags: ['strings', 'manipulation'],
    xpReward: 40,
    description: 'Master the basics of string manipulation.',
    solvedBy: 18920,
    successRate: 85,
    problemStatement: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.

**Your mission:** Simple, but precision matters. Show you can execute the fundamentals flawlessly.`,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.',
    ],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 20,
  },
  {
    id: 'ch-007',
    title: 'Linked List Warfare',
    difficulty: 'medium',
    tags: ['linked-list', 'pointers'],
    xpReward: 120,
    description: 'Navigate the battlefield of pointers and nodes.',
    solvedBy: 7650,
    successRate: 48,
    problemStatement: `Given the head of a singly linked list, reverse the list, and return the reversed list.

**Your mission:** Pointer manipulation separates junior devs from senior engineers. Which are you?`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: [
      'The number of nodes in the list is in the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    hints: ['You can solve this iteratively or recursively.', 'Track three pointers: prev, current, and next.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-008',
    title: 'Heap of Champions',
    difficulty: 'hard',
    tags: ['heap', 'priority-queue'],
    xpReward: 180,
    description: 'Build and manipulate heaps like a champion.',
    solvedBy: 3120,
    successRate: 35,
    problemStatement: `Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.

Implement KthLargest class:
- KthLargest(int k, int[] nums) Initializes the object with the integer k and the stream of integers nums.
- int add(int val) Appends the integer val to the stream and returns the element representing the kth largest element in the stream.

**Your mission:** Heap mastery is required. Inefficient solutions will time out. Only optimal approaches survive.`,
    examples: [
      { input: '["KthLargest", "add", "add", "add", "add", "add"]\n[[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]', output: '[null, 4, 5, 5, 8, 8]', explanation: 'Maintaining top k elements efficiently.' },
    ],
    constraints: [
      '1 <= k <= 10^4',
      '0 <= nums.length <= 10^4',
      '-10^4 <= nums[i] <= 10^4',
      '-10^4 <= val <= 10^4',
      'At most 10^4 calls will be made to add.',
    ],
    rankImpact: { win: 5, loss: 2 },
    timeLimit: 60,
  },
  // ============ CLOSED BETA: ARRAYS ============
  {
    id: 'ch-009',
    title: 'Maximum Subarray',
    difficulty: 'medium',
    tags: ['arrays', 'dp', 'divide-conquer'],
    xpReward: 100,
    description: 'Find the contiguous subarray with the largest sum. Kadane awaits.',
    solvedBy: 12450,
    successRate: 62,
    problemStatement: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.

**Your mission:** Master Kadane's algorithm. O(n) or nothing.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    hints: ['Consider dynamic programming where dp[i] represents max sum ending at index i.', 'Kadane\'s algorithm: current_max = max(nums[i], current_max + nums[i])'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  {
    id: 'ch-010',
    title: 'Product of Array Except Self',
    difficulty: 'medium',
    tags: ['arrays', 'prefix-sum'],
    xpReward: 120,
    description: 'Calculate products without using division. Think prefix and suffix.',
    solvedBy: 8920,
    successRate: 55,
    problemStatement: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.

**Your mission:** No division allowed. Prove your array mastery.`,
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
    ],
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'Product of any prefix/suffix fits in 32-bit integer',
    ],
    hints: ['Use prefix products from left and suffix products from right.', 'Can you do it in O(1) extra space (excluding output)?'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  {
    id: 'ch-011',
    title: 'Container With Most Water',
    difficulty: 'medium',
    tags: ['arrays', 'two-pointers', 'greedy'],
    xpReward: 110,
    description: 'Find the container that holds the most water. Two pointers approach.',
    solvedBy: 9870,
    successRate: 58,
    problemStatement: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

**Your mission:** Optimize with two pointers. Brute force will timeout.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Max area between index 1 and 8.' },
      { input: 'height = [1,1]', output: '1' },
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4',
    ],
    hints: ['Start with two pointers at both ends.', 'Move the pointer pointing to the shorter line.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-012',
    title: 'Rotate Array',
    difficulty: 'easy',
    tags: ['arrays', 'math'],
    xpReward: 50,
    description: 'Rotate an array to the right by k steps. Multiple approaches exist.',
    solvedBy: 15230,
    successRate: 72,
    problemStatement: `Given an integer array nums, rotate the array to the right by k steps, where k is non-negative.

**Your mission:** In-place rotation with O(1) extra space. Show you understand array manipulation.`,
    examples: [
      { input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]' },
      { input: 'nums = [-1,-100,3,99], k = 2', output: '[3,99,-1,-100]' },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-2^31 <= nums[i] <= 2^31 - 1',
      '0 <= k <= 10^5',
    ],
    hints: ['Reverse the entire array, then reverse first k and remaining elements.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 30,
  },
  {
    id: 'ch-013',
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'medium',
    tags: ['arrays', 'binary-search'],
    xpReward: 100,
    description: 'Binary search in a rotated array. O(log n) required.',
    solvedBy: 7650,
    successRate: 52,
    problemStatement: `Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element.

You must write an algorithm that runs in O(log n) time.

**Your mission:** Binary search mastery required. Linear scan = instant failure.`,
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0' },
      { input: 'nums = [11,13,15,17]', output: '11' },
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 5000',
      '-5000 <= nums[i] <= 5000',
      'All integers are unique.',
    ],
    hints: ['Compare mid with right to determine which half has the minimum.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-014',
    title: 'Merge Intervals',
    difficulty: 'medium',
    tags: ['arrays', 'sorting'],
    xpReward: 110,
    description: 'Merge overlapping intervals. Sort first, then merge.',
    solvedBy: 8230,
    successRate: 54,
    problemStatement: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

**Your mission:** Classic interval problem. Asked in every top tech company.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4',
    ],
    hints: ['Sort by start time first.', 'Compare current interval\'s start with previous interval\'s end.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  // ============ CLOSED BETA: STRINGS ============
  {
    id: 'ch-015',
    title: 'Valid Anagram',
    difficulty: 'easy',
    tags: ['strings', 'hash-map', 'sorting'],
    xpReward: 45,
    description: 'Check if two strings are anagrams. Character counting fundamentals.',
    solvedBy: 18340,
    successRate: 82,
    problemStatement: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word formed by rearranging the letters of another word using all original letters exactly once.

**Your mission:** Hash map or sort. Know both approaches.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.',
    ],
    hints: ['Count character frequencies.', 'Compare the two frequency maps.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 25,
  },
  {
    id: 'ch-016',
    title: 'Longest Palindromic Substring',
    difficulty: 'medium',
    tags: ['strings', 'dp', 'two-pointers'],
    xpReward: 130,
    description: 'Find the longest palindrome within a string. Expand around center.',
    solvedBy: 7890,
    successRate: 48,
    problemStatement: `Given a string s, return the longest palindromic substring in s.

**Your mission:** Multiple approaches exist. Expand around center is elegant. DP works too.`,
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also valid.' },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's consist of only digits and English letters.',
    ],
    hints: ['A palindrome mirrors around its center.', 'Consider both odd and even length palindromes.'],
    rankImpact: { win: 4, loss: 2 },
    timeLimit: 50,
  },
  {
    id: 'ch-017',
    title: 'Group Anagrams',
    difficulty: 'medium',
    tags: ['strings', 'hash-map', 'sorting'],
    xpReward: 100,
    description: 'Group strings that are anagrams of each other. Hashing mastery.',
    solvedBy: 9120,
    successRate: 58,
    problemStatement: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

**Your mission:** Use sorted string as key or character count as key. Both work.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.',
    ],
    hints: ['Sort each string and use as key.', 'Or count characters and create a unique key.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-018',
    title: 'Longest Substring Without Repeating',
    difficulty: 'medium',
    tags: ['strings', 'sliding-window', 'hash-map'],
    xpReward: 120,
    description: 'Sliding window to find longest unique substring. Classic interview problem.',
    solvedBy: 11230,
    successRate: 55,
    problemStatement: `Given a string s, find the length of the longest substring without repeating characters.

**Your mission:** Sliding window with hash set. O(n) time complexity required.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc".' },
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3' },
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    hints: ['Use a sliding window with two pointers.', 'Use a set to track characters in current window.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-019',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: ['strings', 'stack'],
    xpReward: 50,
    description: 'Check if parentheses are balanced using a stack.',
    solvedBy: 16780,
    successRate: 75,
    problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket.

**Your mission:** Stack fundamentals. If you can't solve this, go back to basics.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only.',
    ],
    hints: ['Push opening brackets onto stack.', 'Pop and compare when you see closing brackets.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 25,
  },
  {
    id: 'ch-020',
    title: 'Implement strStr',
    difficulty: 'easy',
    tags: ['strings', 'two-pointers'],
    xpReward: 45,
    description: 'Find first occurrence of a pattern in a string.',
    solvedBy: 14560,
    successRate: 70,
    problemStatement: `Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.

**Your mission:** Know both naive O(nm) and KMP O(n+m) approaches.`,
    examples: [
      { input: 'haystack = "sadbutsad", needle = "sad"', output: '0' },
      { input: 'haystack = "leetcode", needle = "leeto"', output: '-1' },
    ],
    constraints: [
      '1 <= haystack.length, needle.length <= 10^4',
      'haystack and needle consist of lowercase English letters.',
    ],
    hints: ['Sliding window of needle length.', 'KMP algorithm for optimal solution.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 30,
  },
  // ============ CLOSED BETA: LINKED LIST ============
  {
    id: 'ch-021',
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    tags: ['linked-list', 'recursion'],
    xpReward: 50,
    description: 'Merge two sorted linked lists into one sorted list.',
    solvedBy: 15670,
    successRate: 76,
    problemStatement: `You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.

Return the head of the merged linked list.

**Your mission:** Pointer manipulation basics. Iterative or recursive both work.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
      { input: 'list1 = [], list2 = [0]', output: '[0]' },
    ],
    constraints: [
      'Both lists are sorted in non-decreasing order.',
      'Number of nodes: [0, 50]',
      '-100 <= Node.val <= 100',
    ],
    hints: ['Create a dummy head to simplify logic.', 'Compare values and advance pointers.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 30,
  },
  {
    id: 'ch-022',
    title: 'Linked List Cycle',
    difficulty: 'easy',
    tags: ['linked-list', 'two-pointers'],
    xpReward: 55,
    description: 'Detect if a linked list has a cycle using Floyd\'s algorithm.',
    solvedBy: 14230,
    successRate: 72,
    problemStatement: `Given head, the head of a linked list, determine if the linked list has a cycle in it.

Return true if there is a cycle, otherwise return false.

**Your mission:** Floyd's tortoise and hare. O(1) space required.`,
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'Tail connects to index 1.' },
      { input: 'head = [1,2], pos = 0', output: 'true' },
      { input: 'head = [1], pos = -1', output: 'false' },
    ],
    constraints: [
      'Number of nodes: [0, 10^4]',
      '-10^5 <= Node.val <= 10^5',
      'pos is -1 or valid index.',
    ],
    hints: ['Use slow and fast pointers.', 'If they meet, there\'s a cycle.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 30,
  },
  {
    id: 'ch-023',
    title: 'Remove Nth Node From End',
    difficulty: 'medium',
    tags: ['linked-list', 'two-pointers'],
    xpReward: 100,
    description: 'Remove the nth node from the end in one pass.',
    solvedBy: 9870,
    successRate: 58,
    problemStatement: `Given the head of a linked list, remove the nth node from the end of the list and return its head.

**Your mission:** Two pointer technique. Maintain n gap between pointers.`,
    examples: [
      { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' },
      { input: 'head = [1], n = 1', output: '[]' },
      { input: 'head = [1,2], n = 1', output: '[1]' },
    ],
    constraints: [
      'Number of nodes: [1, 30]',
      '0 <= Node.val <= 100',
      '1 <= n <= sz',
    ],
    hints: ['Move first pointer n steps ahead.', 'Then move both until first reaches end.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-024',
    title: 'Merge K Sorted Lists',
    difficulty: 'hard',
    tags: ['linked-list', 'heap', 'divide-conquer'],
    xpReward: 200,
    description: 'Merge k sorted linked lists. Heap or divide and conquer.',
    solvedBy: 4560,
    successRate: 38,
    problemStatement: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

**Your mission:** Use min-heap for O(N log k) or divide and conquer.`,
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' },
      { input: 'lists = [[]]', output: '[]' },
    ],
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4',
    ],
    hints: ['Use a min-heap to always get the smallest element.', 'Divide and conquer: merge pairs, then merge results.'],
    rankImpact: { win: 5, loss: 2 },
    timeLimit: 60,
  },
  {
    id: 'ch-025',
    title: 'Reorder List',
    difficulty: 'medium',
    tags: ['linked-list', 'two-pointers', 'stack'],
    xpReward: 120,
    description: 'Reorder list L0→Ln→L1→Ln-1→L2→Ln-2→…',
    solvedBy: 6780,
    successRate: 48,
    problemStatement: `Given the head of a singly linked list, reorder it to: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …

You may not modify the values in the list's nodes. Only nodes themselves may be changed.

**Your mission:** Find middle, reverse second half, merge alternating.`,
    examples: [
      { input: 'head = [1,2,3,4]', output: '[1,4,2,3]' },
      { input: 'head = [1,2,3,4,5]', output: '[1,5,2,4,3]' },
    ],
    constraints: [
      'Number of nodes: [1, 5 * 10^4]',
      '1 <= Node.val <= 1000',
    ],
    hints: ['Find the middle using slow/fast pointers.', 'Reverse the second half.', 'Merge two halves.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 50,
  },
  // ============ CLOSED BETA: STACK & QUEUE ============
  {
    id: 'ch-026',
    title: 'Min Stack',
    difficulty: 'medium',
    tags: ['stack', 'design'],
    xpReward: 100,
    description: 'Design a stack that supports getMin in O(1).',
    solvedBy: 10450,
    successRate: 62,
    problemStatement: `Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.

Implement the MinStack class with O(1) time for all operations.

**Your mission:** Track minimum at each level. Two stacks or tuple approach.`,
    examples: [
      { input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]', output: '[null,null,null,null,-3,null,0,-2]' },
    ],
    constraints: [
      '-2^31 <= val <= 2^31 - 1',
      'At most 3 * 10^4 operations.',
      'pop, top, getMin always called on non-empty stacks.',
    ],
    hints: ['Store pairs of (value, currentMin) in the stack.', 'Or use two stacks: one for values, one for minimums.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  {
    id: 'ch-027',
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'medium',
    tags: ['stack', 'math'],
    xpReward: 100,
    description: 'Evaluate expressions in Reverse Polish Notation using a stack.',
    solvedBy: 8340,
    successRate: 56,
    problemStatement: `Evaluate the value of an arithmetic expression in Reverse Polish Notation.

Valid operators are +, -, *, and /. Each operand may be an integer or another expression.

Division truncates toward zero.

**Your mission:** Stack-based expression evaluation. Classic interview problem.`,
    examples: [
      { input: 'tokens = ["2","1","+","3","*"]', output: '9', explanation: '((2 + 1) * 3) = 9' },
      { input: 'tokens = ["4","13","5","/","+"]', output: '6' },
      { input: 'tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]', output: '22' },
    ],
    constraints: [
      '1 <= tokens.length <= 10^4',
      'tokens[i] is operator or integer in range [-200, 200].',
    ],
    hints: ['Push numbers onto stack.', 'Pop two numbers when you see an operator.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-028',
    title: 'Daily Temperatures',
    difficulty: 'medium',
    tags: ['stack', 'monotonic-stack'],
    xpReward: 110,
    description: 'Find days until warmer temperature using monotonic stack.',
    solvedBy: 7890,
    successRate: 52,
    problemStatement: `Given an array of integers temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.

If there is no future day for which this is possible, keep answer[i] == 0.

**Your mission:** Monotonic decreasing stack. O(n) time required.`,
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
      { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' },
      { input: 'temperatures = [30,60,90]', output: '[1,1,0]' },
    ],
    constraints: [
      '1 <= temperatures.length <= 10^5',
      '30 <= temperatures[i] <= 100',
    ],
    hints: ['Use a stack to store indices.', 'Pop when current temp > stack top temp.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  {
    id: 'ch-029',
    title: 'Implement Queue using Stacks',
    difficulty: 'easy',
    tags: ['stack', 'queue', 'design'],
    xpReward: 55,
    description: 'Implement a FIFO queue using two stacks.',
    solvedBy: 12340,
    successRate: 68,
    problemStatement: `Implement a first in first out (FIFO) queue using only two stacks.

Implement push, pop, peek, and empty operations with amortized O(1) time.

**Your mission:** Understand stack-queue duality. Classic design problem.`,
    examples: [
      { input: '["MyQueue","push","push","peek","pop","empty"]\n[[],[1],[2],[],[],[]]', output: '[null,null,null,1,1,false]' },
    ],
    constraints: [
      '1 <= x <= 9',
      'At most 100 calls total.',
      'All operations are valid.',
    ],
    hints: ['Use one stack for push, one for pop.', 'Transfer elements when pop stack is empty.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 35,
  },
  {
    id: 'ch-030',
    title: 'Sliding Window Maximum',
    difficulty: 'hard',
    tags: ['queue', 'deque', 'sliding-window', 'monotonic-queue'],
    xpReward: 180,
    description: 'Find maximum in each sliding window. Monotonic deque required.',
    solvedBy: 4230,
    successRate: 35,
    problemStatement: `You are given an array of integers nums, and a sliding window of size k moving from left to right.

Return the max element in each window as it moves.

**Your mission:** Monotonic decreasing deque. O(n) time, O(k) space.`,
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' },
      { input: 'nums = [1], k = 1', output: '[1]' },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      '1 <= k <= nums.length',
    ],
    hints: ['Use a deque to store indices.', 'Remove smaller elements from back before adding.', 'Remove out-of-window elements from front.'],
    rankImpact: { win: 5, loss: 2 },
    timeLimit: 60,
  },
  // ============ CLOSED BETA: BINARY SEARCH ============
  {
    id: 'ch-031',
    title: 'Binary Search',
    difficulty: 'easy',
    tags: ['binary-search'],
    xpReward: 40,
    description: 'Classic binary search. Foundation of all search algorithms.',
    solvedBy: 19870,
    successRate: 85,
    problemStatement: `Given a sorted array of integers nums and an integer target, write a function to search target in nums.

Return the index if found, otherwise return -1.

You must write an algorithm with O(log n) runtime complexity.

**Your mission:** If you can't implement binary search flawlessly, stop here.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All integers are unique.',
      'nums is sorted ascending.',
    ],
    hints: ['left = 0, right = n-1', 'mid = left + (right - left) / 2 to avoid overflow'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 20,
  },
  {
    id: 'ch-032',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'medium',
    tags: ['binary-search', 'arrays'],
    xpReward: 120,
    description: 'Binary search with a twist. The array is rotated.',
    solvedBy: 8120,
    successRate: 50,
    problemStatement: `Given a rotated sorted array nums with distinct values, and an integer target, return the index of target if found, or -1 if not.

You must write an algorithm with O(log n) runtime complexity.

**Your mission:** Modified binary search. Determine which half is sorted first.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
      { input: 'nums = [1], target = 0', output: '-1' },
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values are unique.',
    ],
    hints: ['One half is always sorted.', 'Check if target is in the sorted half.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  {
    id: 'ch-033',
    title: 'Find First and Last Position',
    difficulty: 'medium',
    tags: ['binary-search', 'arrays'],
    xpReward: 100,
    description: 'Find start and end positions of a target value.',
    solvedBy: 9450,
    successRate: 55,
    problemStatement: `Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.

If target is not found, return [-1, -1].

You must write an algorithm with O(log n) runtime complexity.

**Your mission:** Two binary searches: find leftmost and rightmost occurrences.`,
    examples: [
      { input: 'nums = [5,7,7,8,8,10], target = 8', output: '[3,4]' },
      { input: 'nums = [5,7,7,8,8,10], target = 6', output: '[-1,-1]' },
      { input: 'nums = [], target = 0', output: '[-1,-1]' },
    ],
    constraints: [
      '0 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
      'nums is non-decreasing.',
    ],
    hints: ['Use binary search to find leftmost occurrence.', 'Use binary search again to find rightmost.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-034',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'hard',
    tags: ['binary-search', 'divide-conquer'],
    xpReward: 220,
    description: 'Find median of two sorted arrays in O(log(m+n)).',
    solvedBy: 2890,
    successRate: 28,
    problemStatement: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log(m+n)).

**Your mission:** This is a classic hard problem. Binary search on partitions.`,
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000' },
    ],
    constraints: [
      'nums1.length == m, nums2.length == n',
      '0 <= m, n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6',
    ],
    hints: ['Binary search on the smaller array.', 'Find partition such that left half <= right half.'],
    rankImpact: { win: 6, loss: 3 },
    timeLimit: 75,
  },
  {
    id: 'ch-035',
    title: 'Koko Eating Bananas',
    difficulty: 'medium',
    tags: ['binary-search', 'math'],
    xpReward: 110,
    description: 'Binary search on the answer. Find minimum eating speed.',
    solvedBy: 6780,
    successRate: 52,
    problemStatement: `Koko loves bananas. There are n piles, and she has h hours to eat all bananas.

Each hour, she can eat up to k bananas from one pile. Find the minimum integer k such that she can eat all bananas within h hours.

**Your mission:** Binary search on k. Check feasibility for each speed.`,
    examples: [
      { input: 'piles = [3,6,7,11], h = 8', output: '4' },
      { input: 'piles = [30,11,23,4,20], h = 5', output: '30' },
      { input: 'piles = [30,11,23,4,20], h = 6', output: '23' },
    ],
    constraints: [
      '1 <= piles.length <= 10^4',
      'piles.length <= h <= 10^9',
      '1 <= piles[i] <= 10^9',
    ],
    hints: ['Search space is [1, max(piles)].', 'For each k, calculate total hours needed.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  // ============ CLOSED BETA: TREES ============
  {
    id: 'ch-036',
    title: 'Invert Binary Tree',
    difficulty: 'easy',
    tags: ['trees', 'dfs', 'bfs'],
    xpReward: 45,
    description: 'Mirror a binary tree. The Homebrew interview question.',
    solvedBy: 17230,
    successRate: 82,
    problemStatement: `Given the root of a binary tree, invert the tree, and return its root.

**Your mission:** Simple recursion. Swap left and right children at each node.`,
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
      { input: 'root = [2,1,3]', output: '[2,3,1]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: [
      'Number of nodes: [0, 100]',
      '-100 <= Node.val <= 100',
    ],
    hints: ['Swap children, then recursively invert subtrees.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 25,
  },
  {
    id: 'ch-037',
    title: 'Validate Binary Search Tree',
    difficulty: 'medium',
    tags: ['trees', 'dfs', 'bst'],
    xpReward: 110,
    description: 'Check if a binary tree is a valid BST.',
    solvedBy: 8560,
    successRate: 52,
    problemStatement: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as:
- Left subtree contains only nodes with keys less than the node's key.
- Right subtree contains only nodes with keys greater than the node's key.
- Both subtrees must also be valid BSTs.

**Your mission:** Track valid range for each node. Inorder traversal also works.`,
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false' },
    ],
    constraints: [
      'Number of nodes: [1, 10^4]',
      '-2^31 <= Node.val <= 2^31 - 1',
    ],
    hints: ['Pass min/max bounds to each recursive call.', 'Or use inorder traversal and check sorted order.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  {
    id: 'ch-038',
    title: 'Lowest Common Ancestor',
    difficulty: 'medium',
    tags: ['trees', 'dfs', 'recursion'],
    xpReward: 120,
    description: 'Find LCA of two nodes in a binary tree.',
    solvedBy: 7890,
    successRate: 50,
    problemStatement: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes.

The LCA is defined as the lowest node in the tree that has both p and q as descendants (a node can be a descendant of itself).

**Your mission:** Elegant recursion. This tests your understanding of tree traversal.`,
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3' },
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5' },
    ],
    constraints: [
      'Number of nodes: [2, 10^5]',
      '-10^9 <= Node.val <= 10^9',
      'All values are unique.',
      'p != q, both exist in tree.',
    ],
    hints: ['If current node is p or q, it could be the LCA.', 'If p and q are on different sides, current node is LCA.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 45,
  },
  {
    id: 'ch-039',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'medium',
    tags: ['trees', 'bfs', 'queue'],
    xpReward: 100,
    description: 'Traverse tree level by level using BFS.',
    solvedBy: 10230,
    successRate: 60,
    problemStatement: `Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).

**Your mission:** BFS with queue. Track levels properly.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: [
      'Number of nodes: [0, 2000]',
      '-1000 <= Node.val <= 1000',
    ],
    hints: ['Use a queue for BFS.', 'Process all nodes at current level before moving to next.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
  },
  {
    id: 'ch-040',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'hard',
    tags: ['trees', 'design', 'dfs', 'bfs'],
    xpReward: 200,
    description: 'Design algorithm to serialize/deserialize a binary tree.',
    solvedBy: 4120,
    successRate: 38,
    problemStatement: `Design an algorithm to serialize and deserialize a binary tree.

Serialization is converting a tree to a string. Deserialization is reconstructing the tree from the string.

**Your mission:** Choose your traversal wisely. Handle null nodes properly.`,
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' },
      { input: 'root = []', output: '[]' },
    ],
    constraints: [
      'Number of nodes: [0, 10^4]',
      '-1000 <= Node.val <= 1000',
    ],
    hints: ['Preorder DFS with null markers.', 'BFS with level-order representation.'],
    rankImpact: { win: 5, loss: 2 },
    timeLimit: 60,
  },
  {
    id: 'ch-041',
    title: 'Diameter of Binary Tree',
    difficulty: 'easy',
    tags: ['trees', 'dfs'],
    xpReward: 55,
    description: 'Find the longest path between any two nodes in a tree.',
    solvedBy: 12340,
    successRate: 68,
    problemStatement: `Given the root of a binary tree, return the length of the diameter of the tree.

The diameter is the length of the longest path between any two nodes. This path may or may not pass through the root.

**Your mission:** Track max diameter while computing heights.`,
    examples: [
      { input: 'root = [1,2,3,4,5]', output: '3' },
      { input: 'root = [1,2]', output: '1' },
    ],
    constraints: [
      'Number of nodes: [1, 10^4]',
      '-100 <= Node.val <= 100',
    ],
    hints: ['Diameter at node = left_height + right_height.', 'Update global max during recursion.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 35,
  },
];

// Mock leaderboard
export const mockLeaderboard: User[] = [
  { ...mockUser, uid: 'u1', username: 'AlphaStrike', xp: 28500, level: 45, division: 'legend', elo: 2847, rank: 1, solvedChallenges: 342, streak: 45 },
  { ...mockUser, uid: 'u2', username: 'BinaryBeast', xp: 24200, level: 42, division: 'legend', elo: 2756, rank: 2, solvedChallenges: 298, streak: 32 },
  { ...mockUser, uid: 'u3', username: 'CodeAssassin', xp: 21800, level: 38, division: 'master', elo: 2634, rank: 3, solvedChallenges: 276, streak: 28 },
  { ...mockUser, uid: 'u4', username: 'DevDestroyer', xp: 19500, level: 35, division: 'master', elo: 2512, rank: 4, solvedChallenges: 254, streak: 21 },
  { ...mockUser, uid: 'u5', username: 'EliteEncoder', xp: 17200, level: 32, division: 'diamond', elo: 2389, rank: 5, solvedChallenges: 231, streak: 19 },
  { ...mockUser, uid: 'u6', username: 'FlowMaster', xp: 15800, level: 30, division: 'diamond', elo: 2267, rank: 6, solvedChallenges: 212, streak: 15 },
  { ...mockUser, uid: 'u7', username: 'GridGladiator', xp: 14100, level: 28, division: 'diamond', elo: 2145, rank: 7, solvedChallenges: 198, streak: 12 },
  { ...mockUser, uid: 'u8', username: 'HashHunter', xp: 12500, level: 25, division: 'platinum', elo: 2023, rank: 8, solvedChallenges: 178, streak: 9 },
  { ...mockUser, uid: 'u9', username: 'IndexInferno', xp: 10200, level: 22, division: 'platinum', elo: 1901, rank: 9, solvedChallenges: 156, streak: 7 },
  { ...mockUser, uid: 'u10', username: 'JavaJuggernaut', xp: 8900, level: 20, division: 'gold', elo: 1779, rank: 10, solvedChallenges: 134, streak: 5 },
];

// Mock contests
export const mockContests: Contest[] = [
  {
    id: 'ct-001',
    title: 'Weekly Arena #47',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    problems: ['ch-001', 'ch-002', 'ch-003'],
    participants: 0,
    status: 'upcoming',
    xpReward: 500,
  },
  {
    id: 'ct-002',
    title: 'Speed Coding Blitz',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
    problems: ['ch-006', 'ch-007'],
    participants: 0,
    status: 'upcoming',
    xpReward: 300,
  },
  {
    id: 'ct-003',
    title: 'Elite Championship',
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    problems: ['ch-003', 'ch-004', 'ch-005', 'ch-008'],
    participants: 0,
    status: 'upcoming',
    xpReward: 1000,
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'n-001',
    userId: 'user-001',
    type: 'contest',
    title: 'Weekly Arena #47 Starting Soon',
    message: 'The arena opens in 2 days. Prepare yourself.',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'n-002',
    userId: 'user-001',
    type: 'streak',
    title: 'Streak On Fire! 🔥',
    message: 'You have a 7-day streak! Keep the fire burning.',
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'n-003',
    userId: 'user-001',
    type: 'xp',
    title: '+200 XP Earned',
    message: 'You solved "Dynamic Programming Ego" and earned 200 XP!',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'n-004',
    userId: 'user-001',
    type: 'rank',
    title: 'Rank Up! Diamond Division',
    message: 'You have ascended to Diamond Division. Prove your worth.',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'n-005',
    userId: 'user-001',
    type: 'system',
    title: 'New Challenges Available',
    message: '5 new challenges have been added to the arena.',
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// Mock calendar events
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'ev-001',
    userId: 'user-001',
    title: 'Weekly Arena #47',
    type: 'contest',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    description: 'Weekly competitive contest with 3 problems.',
  },
  {
    id: 'ev-002',
    userId: 'user-001',
    title: 'Speed Coding Blitz',
    type: 'contest',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description: 'Fast-paced 1-hour contest.',
  },
  {
    id: 'ev-003',
    userId: 'user-001',
    title: 'Daily Streak Reminder',
    type: 'streak',
    date: new Date(),
    description: 'Complete at least one challenge to maintain your streak.',
  },
  {
    id: 'ev-004',
    userId: 'user-001',
    title: 'Elite Championship',
    type: 'contest',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description: 'Major championship with 4 hard problems.',
  },
  {
    id: 'ev-005',
    userId: 'user-001',
    title: 'Practice Session',
    type: 'reminder',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    description: 'Scheduled practice for DP problems.',
  },
];

// Helper functions
export const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
  switch (difficulty) {
    case 'easy': return 'text-status-success';
    case 'medium': return 'text-status-warning';
    case 'hard': return 'text-destructive';
    case 'extreme': return 'text-rank-legend';
    default: return 'text-foreground';
  }
};

export const getDivisionColor = (division: User['division']) => {
  switch (division) {
    case 'bronze': return 'text-rank-bronze';
    case 'silver': return 'text-rank-silver';
    case 'gold': return 'text-rank-gold';
    case 'platinum': return 'text-rank-platinum';
    case 'diamond': return 'text-rank-diamond';
    case 'master': return 'text-rank-master';
    case 'legend': return 'text-rank-legend';
    default: return 'text-foreground';
  }
};

export const getDivisionAura = (division: User['division']) => {
  switch (division) {
    case 'bronze': return 'rank-aura-bronze';
    case 'silver': return 'rank-aura-silver';
    case 'gold': return 'rank-aura-gold';
    case 'platinum': return 'rank-aura-platinum';
    case 'diamond': return 'rank-aura-diamond';
    case 'master': return 'rank-aura-master';
    case 'legend': return 'rank-aura-legend';
    default: return '';
  }
};

export const getXpForNextLevel = (level: number) => level * 500;
export const getXpProgress = (xp: number, level: number) => {
  const currentLevelXp = (level - 1) * 500;
  const nextLevelXp = level * 500;
  return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
};
