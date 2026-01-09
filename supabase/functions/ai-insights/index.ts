import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type InsightType = 
  | 'explain_mistakes'
  | 'edge_cases'
  | 'complexity_analysis'
  | 'different_thinking'
  | 'topic_performance'
  | 'explain_score';

interface InsightRequest {
  type: InsightType;
  context: Record<string, unknown>;
}

const SYSTEM_PROMPTS: Record<InsightType, string> = {
  explain_mistakes: `You are a coding mentor helping a student understand their mistakes in a programming solution.
Rules:
- Explain what went wrong conceptually, not syntactically
- Focus on the logic errors and misconceptions
- Do NOT provide the correct solution or code
- Keep the explanation clear and educational
- Be encouraging but direct
- Maximum 200 words`,

  edge_cases: `You are a coding mentor helping a student identify edge cases they may have missed.
Rules:
- List specific edge cases the solution might not handle
- Explain why each edge case is important
- Do NOT provide solutions for handling them
- Focus on common pitfalls for this type of problem
- Maximum 150 words`,

  complexity_analysis: `You are a coding mentor analyzing the time and space complexity of a solution.
Rules:
- Analyze both time and space complexity using Big-O notation
- Explain the reasoning behind each analysis
- Mention if there's potential for optimization (without solving)
- Be precise and educational
- Maximum 150 words`,

  different_thinking: `You are a coding mentor suggesting alternative approaches to think about a problem.
Rules:
- Suggest different problem-solving paradigms that could apply
- Mention relevant data structures or algorithms to consider
- Do NOT provide actual implementations or code
- Focus on building intuition and pattern recognition
- Maximum 150 words`,

  topic_performance: `You are a learning coach analyzing a student's performance in a specific topic.
Rules:
- Analyze the provided weakness data objectively
- Identify specific patterns that need attention
- Provide actionable, specific next steps
- Be direct and constructive, not motivational
- Focus on behavior change, not encouragement
- Maximum 200 words`,

  explain_score: `You are a learning coach explaining an Interview Readiness Score breakdown.
Rules:
- Explain which components are affecting the score most
- Identify the most impactful areas to improve
- Provide specific, actionable recommendations
- Be direct and practical, no motivational fluff
- Focus on the highest-impact changes
- Maximum 200 words`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check AI settings and usage limits
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('ai_enabled, daily_limit_per_user')
      .eq('id', 'global')
      .single();

    if (!settings?.ai_enabled) {
      return new Response(
        JSON.stringify({ error: "AI insights are temporarily disabled" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check daily usage
    const { data: usageData } = await supabase.rpc('get_ai_usage_today');
    if (usageData?.remaining <= 0) {
      return new Response(
        JSON.stringify({ 
          error: "Daily AI limit reached", 
          used: usageData.used,
          limit: usageData.limit 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, context }: InsightRequest = await req.json();

    if (!type || !SYSTEM_PROMPTS[type]) {
      return new Response(
        JSON.stringify({ error: "Invalid insight type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the user message based on context
    let userMessage = "";
    
    switch (type) {
      case 'explain_mistakes':
      case 'edge_cases':
      case 'complexity_analysis':
      case 'different_thinking':
        userMessage = `Problem: ${context.problemTitle || 'Unknown'}\n\nUser's approach/code:\n${context.userCode || context.approach || 'Not provided'}\n\nPlease analyze.`;
        break;
      case 'topic_performance':
        userMessage = `Topic: ${context.topicName}\n\nWeakness Data:\n${JSON.stringify(context.weaknessData, null, 2)}\n\nPlease analyze my performance and provide actionable insights.`;
        break;
      case 'explain_score':
        userMessage = `Interview Readiness Score: ${context.score}/100\n\nScore Breakdown:\n${JSON.stringify(context.breakdown, null, 2)}\n\nPlease explain what's affecting my score and what I should focus on.`;
        break;
    }

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[type] },
          { role: "user", content: userMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const insight = aiData.choices?.[0]?.message?.content || "Unable to generate insight.";
    const tokensUsed = aiData.usage?.total_tokens || 0;

    // Record the usage
    await supabase.rpc('record_ai_usage', {
      p_insight_type: type,
      p_context: context,
      p_tokens_used: tokensUsed,
    });

    // Get updated usage info
    const { data: newUsageData } = await supabase.rpc('get_ai_usage_today');

    return new Response(
      JSON.stringify({ 
        insight,
        usage: {
          used: newUsageData?.used || 1,
          remaining: newUsageData?.remaining || 0,
          limit: newUsageData?.limit || 20,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
