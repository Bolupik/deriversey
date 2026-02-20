import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DERIVERSE_PROGRAM_ID = "Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu";
const DEVNET_RPC = "https://api.devnet.solana.com";

const MINT_SYMBOLS: Record<string, string> = {
  So11111111111111111111111111111111111111112: "SOL",
  "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh": "BTC",
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": "ETH",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
};

function getMintSymbol(mint: string): string {
  return MINT_SYMBOLS[mint] || mint.slice(0, 4) + "..." + mint.slice(-4);
}

async function rpcCall(method: string, params: unknown[]) {
  const res = await fetch(DEVNET_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

interface ParsedTrade {
  id: string;
  signature: string;
  symbol: string;
  side: "long" | "short";
  orderType: "market";
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  entryTime: string;
  exitTime: string;
  duration: number;
  status: "win" | "loss" | "open";
}

function parseDeriverseTransaction(
  tx: any,
  walletPubkey: string,
  signature: string
): ParsedTrade | null {
  if (!tx || !tx.meta || tx.meta.err) return null;

  const preBalances = tx.meta.preTokenBalances || [];
  const postBalances = tx.meta.postTokenBalances || [];

  // Find token balance changes for the wallet
  const changes: { mint: string; change: number }[] = [];

  for (const post of postBalances) {
    if (post.owner !== walletPubkey) continue;
    const pre = preBalances.find(
      (p: any) => p.owner === walletPubkey && p.mint === post.mint
    );
    const preAmount = pre ? Number(pre.uiTokenAmount.uiAmount || 0) : 0;
    const postAmount = Number(post.uiTokenAmount.uiAmount || 0);
    const diff = postAmount - preAmount;
    if (Math.abs(diff) > 0.000001) {
      changes.push({ mint: post.mint, change: diff });
    }
  }

  // Check SOL balance change
  const accountKeys = tx.transaction.message.accountKeys || [];
  const accountIndex = accountKeys.findIndex(
    (k: any) => (typeof k === "string" ? k : k.pubkey) === walletPubkey
  );
  if (accountIndex >= 0) {
    const solChange =
      ((tx.meta.postBalances[accountIndex] || 0) -
        (tx.meta.preBalances[accountIndex] || 0)) /
      1e9;
    if (Math.abs(solChange) > 0.001) {
      changes.push({
        mint: "So11111111111111111111111111111111111111112",
        change: solChange,
      });
    }
  }

  if (changes.length < 1) return null;

  const tokenOut = changes.find((c) => c.change < 0);
  const tokenIn = changes.find((c) => c.change > 0);

  // Even single-sided changes are valid (e.g. PnL settlement)
  const symbolOut = tokenOut ? getMintSymbol(tokenOut.mint) : "???";
  const symbolIn = tokenIn ? getMintSymbol(tokenIn.mint) : "???";

  const amountOut = tokenOut ? Math.abs(tokenOut.change) : 0;
  const amountIn = tokenIn ? tokenIn.change : 0;

  const symbol =
    tokenIn && tokenOut ? `${symbolIn}/${symbolOut}` : symbolIn || symbolOut;
  const entryPrice = amountIn > 0 && amountOut > 0 ? amountOut / amountIn : 0;
  const timestamp = (tx.blockTime || 0) * 1000;
  const entryTime = new Date(timestamp).toISOString();

  // Estimate fees from SOL balance drop that isn't part of the swap
  const solAccount = accountKeys.findIndex(
    (k: any) => (typeof k === "string" ? k : k.pubkey) === walletPubkey
  );
  let estimatedFee = 0;
  if (solAccount >= 0 && tx.meta.fee) {
    estimatedFee = tx.meta.fee / 1e9; // lamports to SOL
  }

  // Determine side heuristically: if we received a stable, it's closing a long (or opening short)
  const stables = ["USDC", "USDT"];
  const side: "long" | "short" = stables.includes(symbolIn) ? "short" : "long";

  // PnL is hard to determine from single tx without position context, mark as 0
  const pnl = 0;

  return {
    id: signature,
    signature,
    symbol,
    side,
    orderType: "market",
    entryPrice: Math.round(entryPrice * 1e6) / 1e6,
    exitPrice: Math.round(entryPrice * 1e6) / 1e6,
    size: Math.round(amountOut * 1e4) / 1e4,
    leverage: 1,
    pnl,
    pnlPercent: 0,
    fees: Math.round(estimatedFee * 1e6) / 1e6,
    entryTime,
    exitTime: entryTime,
    duration: 0,
    status: "open",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wallet, limit = 50 } = await req.json();

    if (!wallet || typeof wallet !== "string") {
      return new Response(
        JSON.stringify({ error: "wallet address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Get recent signatures for the wallet
    const signatures = await rpcCall("getSignaturesForAddress", [
      wallet,
      { limit: Math.min(limit, 100) },
    ]);

    if (!signatures || signatures.length === 0) {
      return new Response(JSON.stringify({ trades: [], total: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trades: ParsedTrade[] = [];

    // 2. Fetch transactions in batches of 5
    for (let i = 0; i < signatures.length; i += 5) {
      const batch = signatures.slice(i, i + 5);
      const txPromises = batch.map((sig: any) =>
        rpcCall("getTransaction", [
          sig.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]).catch(() => null)
      );
      const txs = await Promise.all(txPromises);

      for (let j = 0; j < txs.length; j++) {
        const tx = txs[j];
        if (!tx) continue;

        // Check if Deriverse program is involved
        const accountKeys = tx.transaction?.message?.accountKeys || [];
        const involvesDeriverse = accountKeys.some(
          (k: any) =>
            (typeof k === "string" ? k : k.pubkey) === DERIVERSE_PROGRAM_ID
        );

        if (!involvesDeriverse) continue;

        const trade = parseDeriverseTransaction(
          tx,
          wallet,
          batch[j].signature
        );
        if (trade) trades.push(trade);
      }
    }

    // Sort by time descending
    trades.sort(
      (a, b) =>
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
    );

    return new Response(
      JSON.stringify({ trades, total: trades.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("fetch-deriverse-trades error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
