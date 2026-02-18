import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTokenPrices } from "@/hooks/useTokenPrices";

export interface TokenHolding {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  usdValue: number;
  price: number;
  change24h: number;
}

const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number; coingeckoId: string }> = {
  "So11111111111111111111111111111111111111112": { symbol: "SOL", name: "Solana", decimals: 9, coingeckoId: "solana" },
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { symbol: "USDC", name: "USD Coin", decimals: 6, coingeckoId: "usd-coin" },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { symbol: "USDT", name: "Tether", decimals: 6, coingeckoId: "tether" },
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": { symbol: "JUP", name: "Jupiter", decimals: 6, coingeckoId: "jupiter-exchange-solana" },
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": { symbol: "BONK", name: "Bonk", decimals: 5, coingeckoId: "bonk" },
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm": { symbol: "WIF", name: "dogwifhat", decimals: 6, coingeckoId: "dogwifcoin" },
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": { symbol: "RAY", name: "Raydium", decimals: 6, coingeckoId: "raydium" },
};

export function useWalletPortfolio() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { data: tokenPrices } = useTokenPrices();
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  const fetchPortfolio = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);

    try {
      const result: TokenHolding[] = [];

      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;
      const solPrice = tokenPrices?.find(t => t.symbol === "SOL");
      if (solAmount > 0.001) {
        result.push({
          mint: "So11111111111111111111111111111111111111112",
          symbol: "SOL",
          name: "Solana",
          balance: solAmount,
          decimals: 9,
          usdValue: solAmount * (solPrice?.price || 0),
          price: solPrice?.price || 0,
          change24h: solPrice?.change24h || 0,
        });
      }

      // Fetch SPL token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      });

      for (const account of tokenAccounts.value) {
        const info = account.account.data.parsed.info;
        const mint = info.mint;
        const balance = Number(info.tokenAmount.uiAmount);
        if (balance <= 0) continue;

        const known = KNOWN_TOKENS[mint];
        if (!known) continue; // Only show known tokens

        const priceData = tokenPrices?.find(t => t.symbol === known.symbol);
        result.push({
          mint,
          symbol: known.symbol,
          name: known.name,
          balance,
          decimals: known.decimals,
          usdValue: balance * (priceData?.price || 0),
          price: priceData?.price || 0,
          change24h: priceData?.change24h || 0,
        });
      }

      result.sort((a, b) => b.usdValue - a.usdValue);
      setHoldings(result);
      setTotalValue(result.reduce((sum, h) => sum + h.usdValue, 0));
    } catch (err) {
      console.error("Portfolio fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, tokenPrices]);

  return { holdings, loading, totalValue, fetchPortfolio };
}
