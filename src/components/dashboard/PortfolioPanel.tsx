import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletPortfolio, TokenHolding } from "@/hooks/useWalletPortfolio";
import { Wallet, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PortfolioPanel() {
  const { connected } = useWallet();
  const { holdings, loading, totalValue, fetchPortfolio } = useWalletPortfolio();

  useEffect(() => {
    if (connected) fetchPortfolio();
  }, [connected, fetchPortfolio]);

  if (!connected) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center animate-slide-up">
        <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Connect Wallet</p>
        <p className="text-xs text-muted-foreground">Connect your Phantom or Solflare wallet to view your portfolio</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Portfolio</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your on-chain holdings</p>
        </div>
        <button
          onClick={fetchPortfolio}
          disabled={loading}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Total Value */}
      <div className="rounded-lg bg-muted/30 p-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Value</p>
        <p className="text-2xl font-mono font-bold text-foreground">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Holdings */}
      <AnimatePresence mode="wait">
        {loading && holdings.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {holdings.map((h, i) => (
              <motion.div
                key={h.mint}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center justify-between p-3 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-mono font-bold text-primary">
                    {h.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{h.symbol}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {h.balance < 0.001
                        ? h.balance.toFixed(8)
                        : h.balance < 1
                          ? h.balance.toFixed(4)
                          : h.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-medium text-foreground">
                    ${h.usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <div className={`flex items-center gap-0.5 justify-end text-[10px] font-mono ${h.change24h >= 0 ? "text-profit" : "text-loss"}`}>
                    {h.change24h >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {h.change24h >= 0 ? "+" : ""}{h.change24h.toFixed(2)}%
                  </div>
                </div>
              </motion.div>
            ))}
            {holdings.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground text-center py-4">No holdings found</p>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
