import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserLevel() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-level", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("get_user_level", { p_user_id: user!.id });
      if (error) throw error;
      return (data as number) ?? 1;
    },
    staleTime: 60_000,
  });
}
