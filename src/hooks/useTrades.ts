import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trade } from "@/types/trading";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useTrades() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("entry_time", { ascending: false });

      if (error) throw error;

      return (data || []).map((t: any): Trade => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side as "long" | "short",
        orderType: t.order_type as any,
        entryPrice: Number(t.entry_price),
        exitPrice: Number(t.exit_price) || 0,
        size: Number(t.size),
        leverage: t.leverage,
        pnl: Number(t.pnl) || 0,
        pnlPercent: Number(t.pnl_percent) || 0,
        fees: Number(t.fees) || 0,
        entryTime: t.entry_time,
        exitTime: t.exit_time || t.entry_time,
        duration: t.duration || 0,
        status: (t.status === "win" || t.status === "loss") ? t.status : (Number(t.pnl) >= 0 ? "win" : "loss"),
        note: t.note || undefined,
      }));
    },
    enabled: !!user,
  });
}

export function useAddTrade() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trade: Omit<Trade, "id">) => {
      const { error } = await supabase.from("trades").insert({
        user_id: user!.id,
        symbol: trade.symbol,
        side: trade.side,
        order_type: trade.orderType,
        entry_price: trade.entryPrice,
        exit_price: trade.exitPrice || null,
        size: trade.size,
        leverage: trade.leverage,
        pnl: trade.pnl,
        pnl_percent: trade.pnlPercent,
        fees: trade.fees,
        entry_time: trade.entryTime,
        exit_time: trade.exitTime || null,
        duration: trade.duration,
        status: trade.status,
        note: trade.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tradeId: string) => {
      const { error } = await supabase.from("trades").delete().eq("id", tradeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}

export function useUpdateTradeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { error } = await supabase.from("trades").update({ note }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
