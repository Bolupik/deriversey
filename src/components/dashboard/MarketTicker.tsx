import { useTokenPrices } from "@/hooks/useTokenPrices";
import { TrendingUp, TrendingDown } from "lucide-react";

export function MarketTicker() {
  const { data: prices, isLoading, isError } = useTokenPrices();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 py-2 overflow-hidden">
        <span className="text-[10px] text-muted-foreground animate-pulse">Loading market data...</span>
      </div>
    );
  }

  if (isError || !prices?.length) {
    return (
      <div className="flex items-center gap-4 py-2 overflow-hidden">
        <span className="text-[10px] text-muted-foreground">Market data unavailable</span>
      </div>
    );
  }

  // Duplicate for seamless scroll
  const doubled = [...prices, ...prices];

  return (
    <div className="relative overflow-hidden py-2">
      <div className="flex items-center gap-6 animate-ticker-scroll w-max">
        {doubled.map((token, i) => (
          <div
            key={`${token.symbol}-${i}`}
            className="flex items-center gap-2 shrink-0"
          >
            <span className="text-[11px] font-mono font-semibold text-foreground">{token.symbol}</span>
            <span className="text-[11px] font-mono text-primary">
              ${token.price < 0.01
                ? token.price.toFixed(6)
                : token.price < 1
                  ? token.price.toFixed(4)
                  : token.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            {token.change24h !== 0 && (
              <span className={`flex items-center gap-0.5 text-[10px] font-mono ${token.change24h >= 0 ? "text-profit" : "text-loss"}`}>
                {token.change24h >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {token.change24h >= 0 ? "+" : ""}{token.change24h}%
              </span>
            )}
            <span className="text-muted-foreground/30 ml-2">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
