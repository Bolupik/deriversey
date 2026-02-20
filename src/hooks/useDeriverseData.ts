import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "@/types/trading";

export function useDeriverseData() {
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toString();

  return useQuery({
    queryKey: ["deriverse-trades", walletAddress],
    queryFn: async (): Promise<Trade[]> => {
      const { data, error } = await supabase.functions.invoke(
        "fetch-deriverse-trades",
        {
          body: { wallet: walletAddress, limit: 100 },
        }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return (data?.trades || []) as Trade[];
    },
    enabled: connected && !!walletAddress,
    staleTime: 60_000, // Cache for 1 minute
    refetchInterval: 120_000, // Auto-refresh every 2 minutes
  });
}
