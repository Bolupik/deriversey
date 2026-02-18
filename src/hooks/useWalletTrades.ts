import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import { useToast } from "@/hooks/use-toast";
import { useAddTrade } from "@/hooks/useTrades";

interface ParsedSwap {
  signature: string;
  timestamp: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
}

// Known program IDs for DEX protocols
const DEX_PROGRAMS: Record<string, string> = {
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": "Jupiter v6",
  "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB": "Jupiter v4",
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium AMM",
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Orca Whirlpool",
  "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH": "Drift",
  "ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD": "Zeta Markets",
};

function parseSwapFromTx(tx: ParsedTransactionWithMeta, walletPubkey: string): ParsedSwap | null {
  if (!tx.meta || tx.meta.err) return null;
  
  const preBalances = tx.meta.preTokenBalances || [];
  const postBalances = tx.meta.postTokenBalances || [];
  
  // Find token balance changes for the wallet
  const changes: { mint: string; change: number }[] = [];
  
  for (const post of postBalances) {
    if (post.owner !== walletPubkey) continue;
    const pre = preBalances.find(p => p.owner === walletPubkey && p.mint === post.mint);
    const preAmount = pre ? Number(pre.uiTokenAmount.uiAmount || 0) : 0;
    const postAmount = Number(post.uiTokenAmount.uiAmount || 0);
    const diff = postAmount - preAmount;
    if (Math.abs(diff) > 0.000001) {
      changes.push({ mint: post.mint, change: diff });
    }
  }

  // Also check SOL balance change
  const accountIndex = tx.transaction.message.accountKeys.findIndex(
    k => k.pubkey.toString() === walletPubkey
  );
  if (accountIndex >= 0) {
    const solChange = ((tx.meta.postBalances[accountIndex] || 0) - (tx.meta.preBalances[accountIndex] || 0)) / 1e9;
    // Only count significant SOL changes (not just fee deductions)
    if (Math.abs(solChange) > 0.01) {
      changes.push({ mint: "So11111111111111111111111111111111111111112", change: solChange });
    }
  }

  if (changes.length < 2) return null;

  // Token going out (negative change) and token coming in (positive change)
  const tokenOut = changes.find(c => c.change < 0);
  const tokenIn = changes.find(c => c.change > 0);
  if (!tokenOut || !tokenIn) return null;

  return {
    signature: tx.transaction.signatures[0],
    timestamp: (tx.blockTime || 0) * 1000,
    tokenIn: tokenIn.mint,
    tokenOut: tokenOut.mint,
    amountIn: tokenIn.change,
    amountOut: Math.abs(tokenOut.change),
  };
}

// Shorten mint addresses to symbols
const MINT_SYMBOLS: Record<string, string> = {
  "So11111111111111111111111111111111111111112": "SOL",
  "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh": "BTC",
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": "ETH",
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": "JUP",
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": "BONK",
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm": "WIF",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
};

function getMintSymbol(mint: string): string {
  return MINT_SYMBOLS[mint] || mint.slice(0, 4) + "..." + mint.slice(-4);
}

export function useWalletTrades() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const addTrade = useAddTrade();
  const [loading, setLoading] = useState(false);
  const [swaps, setSwaps] = useState<ParsedSwap[]>([]);

  const fetchWalletHistory = async (limit = 20) => {
    if (!publicKey) {
      toast({ title: "Connect wallet first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Use confirmed commitment for faster results
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
      
      if (signatures.length === 0) {
        toast({ title: "No transactions found", description: "This wallet has no recent transactions." });
        setLoading(false);
        return;
      }

      const parsedSwaps: ParsedSwap[] = [];
      
      // Fetch transactions in batches of 5 to avoid rate limits
      for (let i = 0; i < signatures.length; i += 5) {
        const batch = signatures.slice(i, i + 5);
        const txs = await Promise.all(
          batch.map(sig => 
            connection.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 })
              .catch(() => null)
          )
        );
        
        for (const tx of txs) {
          if (!tx) continue;
          
          // Check if this involves a DEX program
          const programIds = tx.transaction.message.accountKeys.map(k => k.pubkey.toString());
          const isDex = programIds.some(pid => pid in DEX_PROGRAMS);
          
          if (isDex) {
            const swap = parseSwapFromTx(tx, publicKey.toString());
            if (swap) parsedSwaps.push(swap);
          }
        }
      }

      setSwaps(parsedSwaps);
      toast({ 
        title: `Found ${parsedSwaps.length} swaps`, 
        description: `Scanned ${signatures.length} transactions from your wallet.` 
      });
    } catch (error: any) {
      console.error("Failed to fetch wallet history:", error);
      toast({ title: "Error fetching history", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const importSwapAsTrade = async (swap: ParsedSwap) => {
    const symbolIn = getMintSymbol(swap.tokenIn);
    const symbolOut = getMintSymbol(swap.tokenOut);
    const symbol = `${symbolIn}/${symbolOut}`;
    const entryTime = new Date(swap.timestamp).toISOString();
    
    try {
      await addTrade.mutateAsync({
        symbol,
        side: "long" as const,
        orderType: "market" as const,
        entryPrice: swap.amountOut / swap.amountIn, // Price ratio
        exitPrice: swap.amountOut / swap.amountIn,
        size: swap.amountOut,
        leverage: 1,
        pnl: 0,
        pnlPercent: 0,
        fees: 0,
        entryTime,
        exitTime: entryTime,
        duration: 0,
        status: "win" as const,
        note: `On-chain swap: ${swap.signature.slice(0, 8)}...`,
      });
      toast({ title: "Trade imported", description: `${symbol} swap imported to journal.` });
    } catch (error: any) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    }
  };

  return { 
    loading, 
    swaps, 
    fetchWalletHistory, 
    importSwapAsTrade, 
    getMintSymbol 
  };
}
