import { PortfolioPanel } from "@/components/dashboard/PortfolioPanel";
import { TradingViewChart } from "@/components/dashboard/TradingViewChart";
import { WatchlistPanel } from "@/components/dashboard/WatchlistPanel";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { LiquidReveal } from "@/components/LiquidReveal";

const CHART_TOKENS = ["SOL", "BTC", "ETH", "JUP", "BONK", "WIF", "RAY"];

export default function Portfolio() {
  const [chartSymbol, setChartSymbol] = useState("SOL");
  const { data: tokenPrices = [] } = useTokenPrices();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-overline mb-2">Wallet Holdings</p>
        <h1 className="text-massive">Portfolio</h1>
      </motion.div>

      <div className="border-b border-border/30" />

      {/* Token cards with liquid distortion */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {CHART_TOKENS.map((sym, i) => {
          const price = tokenPrices.find(t => t.symbol === sym);
          const isSelected = chartSymbol === sym;
          return (
            <motion.div
              key={sym}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <LiquidReveal intensity={isSelected ? 0 : 25}>
                <button
                  onClick={() => setChartSymbol(sym)}
                  className={`w-full rounded-lg p-3 text-left transition-all duration-300 ${
                    isSelected
                      ? "kinetic-card border-primary/30"
                      : "kinetic-card"
                  }`}
                >
                  <p className="text-overline">{sym}</p>
                  <p className="text-sm font-mono font-semibold text-foreground mt-1">
                    {price ? `$${price.price.toLocaleString(undefined, { maximumFractionDigits: price.price < 1 ? 6 : 2 })}` : "—"}
                  </p>
                  {price && (
                    <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-mono ${price.change24h >= 0 ? "text-profit" : "text-loss"}`}>
                      {price.change24h >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {price.change24h >= 0 ? "+" : ""}{price.change24h.toFixed(2)}%
                    </div>
                  )}
                </button>
              </LiquidReveal>
            </motion.div>
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
