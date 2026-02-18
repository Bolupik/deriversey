import { useQuery } from "@tanstack/react-query";

export interface TokenPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  mint: string;
}

const COINGECKO_IDS: Record<string, { symbol: string; name: string; mint: string }> = {
  solana: { symbol: "SOL", name: "Solana", mint: "So11111111111111111111111111111111111111112" },
  bitcoin: { symbol: "BTC", name: "Bitcoin", mint: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh" },
  ethereum: { symbol: "ETH", name: "Ethereum", mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs" },
  jupiter: { symbol: "JUP", name: "Jupiter", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
  bonk: { symbol: "BONK", name: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  dogwifcoin: { symbol: "WIF", name: "dogwifhat", mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
  raydium: { symbol: "RAY", name: "Raydium", mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" },
};

async function fetchPrices(): Promise<TokenPrice[]> {
  const ids = Object.keys(COINGECKO_IDS).join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
  );
  if (!res.ok) throw new Error("Failed to fetch prices");
  const json = await res.json();

  return Object.entries(COINGECKO_IDS).map(([id, meta]) => {
    const data = json[id];
    return {
      symbol: meta.symbol,
      name: meta.name,
      price: data?.usd ?? 0,
      change24h: data?.usd_24h_change ? Math.round(data.usd_24h_change * 100) / 100 : 0,
      mint: meta.mint,
    };
  }).filter(t => t.price > 0);
}

export function useTokenPrices() {
  return useQuery({
    queryKey: ["token-prices"],
    queryFn: fetchPrices,
    refetchInterval: 60_000, // CoinGecko rate limit: refresh every 60s
    staleTime: 30_000,
    retry: 2,
  });
}
