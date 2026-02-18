import { useTokenPrices } from "@/hooks/useTokenPrices";

export function MarketTicker() {
  const { data: prices, isLoading, isError } = useTokenPrices();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 py-1 overflow-hidden">
        <span className="text-[10px] text-muted-foreground animate-pulse">Loading market data...</span>
      </div>
    );
  }

  if (isError || !prices?.length) {
    return (
      <div className="flex items-center gap-4 py-1 overflow-hidden">
        <span className="text-[10px] text-muted-foreground">Market data unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
      {prices.map(token => (
        <div
          key={token.symbol}
          className="flex items-center gap-2 px-3 py-1 rounded-md bg-card/50 border border-border/50 shrink-0"
        >
          <span className="text-[10px] font-mono font-medium text-foreground">{token.symbol}</span>
          <span className="text-[10px] font-mono text-primary">
            ${token.price < 0.01
              ? token.price.toFixed(6)
              : token.price < 1
                ? token.price.toFixed(4)
                : token.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          {token.change24h !== 0 && (
            <span className={`text-[9px] font-mono ${token.change24h >= 0 ? "text-profit" : "text-loss"}`}>
              {token.change24h >= 0 ? "+" : ""}{token.change24h}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
