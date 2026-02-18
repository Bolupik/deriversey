import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useToast } from "@/hooks/use-toast";
import { useAddTrade } from "@/hooks/useTrades";

// Drift Protocol program IDs
const DRIFT_PROGRAM_ID = "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH";
const ZETA_PROGRAM_ID = "ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD";

export interface PerpPosition {
  protocol: "Drift" | "Zeta";
  market: string;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  leverage: number;
  timestamp: number;
  signature: string;
}

export function useDriftTrades() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const addTrade = useAddTrade();
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<PerpPosition[]>([]);

  const fetchPerpHistory = async (limit = 30) => {
    if (!publicKey) {
      toast({ title: "Connect wallet first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
      const perpPositions: PerpPosition[] = [];

      // Known perp market indices for Drift
      const DRIFT_MARKETS: Record<number, string> = {
        0: "SOL-PERP",
        1: "BTC-PERP",
        2: "ETH-PERP",
        3: "APT-PERP",
        4: "BONK-PERP",
        5: "MATIC-PERP",
        6: "ARB-PERP",
        7: "DOGE-PERP",
        8: "BNB-PERP",
        9: "SUI-PERP",
        10: "1KPEPE-PERP",
        11: "OP-PERP",
        12: "RENDER-PERP",
        13: "XRP-PERP",
        14: "HNT-PERP",
        15: "JUP-PERP",
        16: "WIF-PERP",
        17: "JTO-PERP",
        18: "PYTH-PERP",
        19: "TIA-PERP",
      };

      for (let i = 0; i < signatures.length; i += 5) {
        const batch = signatures.slice(i, i + 5);
        const txs = await Promise.all(
          batch.map(sig =>
            connection.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 })
              .catch(() => null)
          )
        );

        for (const tx of txs) {
          if (!tx || !tx.meta || tx.meta.err) continue;

          const programIds = tx.transaction.message.accountKeys.map(k => k.pubkey.toString());
          const isDrift = programIds.includes(DRIFT_PROGRAM_ID);
          const isZeta = programIds.includes(ZETA_PROGRAM_ID);

          if (!isDrift && !isZeta) continue;

          // Parse log messages for fill events
          const logs = tx.meta.logMessages || [];
          const fillLogs = logs.filter(l =>
            l.includes("fill") || l.includes("order") || l.includes("position")
          );

          if (fillLogs.length > 0) {
            // Extract basic position info from token balance changes
            const preBalances = tx.meta.preTokenBalances || [];
            const postBalances = tx.meta.postTokenBalances || [];

            // Look for USDC balance changes (settlement token)
            const usdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
            const preUsdc = preBalances.find(b => b.mint === usdcMint && b.owner === publicKey.toString());
            const postUsdc = postBalances.find(b => b.mint === usdcMint && b.owner === publicKey.toString());

            if (preUsdc && postUsdc) {
              const usdcChange = Number(postUsdc.uiTokenAmount.uiAmount || 0) - Number(preUsdc.uiTokenAmount.uiAmount || 0);

              perpPositions.push({
                protocol: isDrift ? "Drift" : "Zeta",
                market: isDrift ? "SOL-PERP" : "SOL-PERP", // Default, will be improved
                side: usdcChange < 0 ? "long" : "short",
                size: Math.abs(usdcChange),
                entryPrice: 0,
                markPrice: 0,
                pnl: usdcChange,
                leverage: 1,
                timestamp: (tx.blockTime || 0) * 1000,
                signature: tx.transaction.signatures[0],
              });
            }
          }
        }
      }

      setPositions(perpPositions);
      toast({
        title: `Found ${perpPositions.length} perp trades`,
        description: `Scanned ${signatures.length} transactions for Drift/Zeta activity.`,
      });
    } catch (error: any) {
      console.error("Failed to fetch perp history:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const importPerpAsTrade = async (pos: PerpPosition) => {
    const entryTime = new Date(pos.timestamp).toISOString();
    try {
      await addTrade.mutateAsync({
        symbol: pos.market,
        side: pos.side,
        orderType: "market" as const,
        entryPrice: pos.entryPrice || pos.size,
        exitPrice: pos.markPrice || pos.size,
        size: pos.size,
        leverage: pos.leverage,
        pnl: Math.round(pos.pnl * 100) / 100,
        pnlPercent: pos.size > 0 ? Math.round((pos.pnl / pos.size) * 10000) / 100 : 0,
        fees: 0,
        entryTime,
        exitTime: entryTime,
        duration: 0,
        status: pos.pnl >= 0 ? ("win" as const) : ("loss" as const),
        note: `${pos.protocol} perp: ${pos.signature.slice(0, 8)}...`,
      });
      toast({ title: "Trade imported", description: `${pos.market} perp imported.` });
    } catch (error: any) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    }
  };

  return { loading, positions, fetchPerpHistory, importPerpAsTrade };
}
