import { PortfolioPanel } from "@/components/dashboard/PortfolioPanel";
import { TradingViewChart } from "@/components/dashboard/TradingViewChart";
import { WatchlistPanel } from "@/components/dashboard/WatchlistPanel";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useState } from "react";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const CHART_TOKENS = ["SOL", "BTC", "ETH", "JUP", "BONK", "WIF", "RAY"];

export default function Portfolio() {
  const [chartSymbol, setChartSymbol] = useState("SOL");
  const { data: tokenPrices = [] } = useTokenPrices();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Briefcase className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Portfolio</h2>
          <p className="text-xs text-muted-foreground">Your wallet holdings & price charts</p>
        </div>
      </div>

      {/* Token price cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {CHART_TOKENS.map((sym, i) => {
          const price = tokenPrices.find(t => t.symbol === sym);
          const isSelected = chartSymbol === sym;
          return (
            <motion.button
              key={sym}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setChartSymbol(sym)}
              className={`rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <p className="text-[10px] font-mono font-medium text-muted-foreground">{sym}</p>
              <p className="text-sm font-mono font-semibold text-foreground mt-0.5">
                {price ? `$${price.price.toLocaleString(undefined, { maximumFractionDigits: price.price < 1 ? 6 : 2 })}` : "—"}
              </p>
              {price && (
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-mono ${price.change24h >= 0 ? "text-profit" : "text-loss"}`}>
                  {price.change24h >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {price.change24h >= 0 ? "+" : ""}{price.change24h.toFixed(2)}%
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TradingViewChart symbol={chartSymbol} />
        </div>
        <div className="space-y-4">
          <WatchlistPanel />
          <PortfolioPanel />
        </div>
      </div>
    </div>
  );
}
