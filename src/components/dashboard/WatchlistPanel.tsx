import { useState } from "react";
import { useTokenPrices, TokenPrice } from "@/hooks/useTokenPrices";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useTrades } from "@/hooks/useTrades";
import {
  Eye,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Star,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ALL_TOKENS = ["SOL", "BTC", "ETH", "JUP", "BONK", "WIF", "RAY"];

export function WatchlistPanel() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: tokenPrices = [] } = useTokenPrices();
  const { data: trades = [] } = useTrades();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const watchlist: string[] = (profile as any)?.watchlist ?? ["SOL", "BTC", "ETH"];

  const watchedPrices = tokenPrices.filter((t) => watchlist.includes(t.symbol));

  // Compute realized PnL per symbol from trades
  const pnlBySymbol = trades.reduce<Record<string, number>>((acc, t) => {
    acc[t.symbol] = (acc[t.symbol] || 0) + (t.pnl ?? 0);
    return acc;
  }, {});

  const addToken = async (symbol: string) => {
    if (!profile) return;
    if (watchlist.includes(symbol)) return;
    const newList = [...watchlist, symbol];
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        watchlist: newList,
      } as any);
      toast.success(`${symbol} added to watchlist`);
    } catch {
      toast.error("Failed to update watchlist");
    }
  };

  const removeToken = async (symbol: string) => {
    if (!profile) return;
    const newList = watchlist.filter((s) => s !== symbol);
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        watchlist: newList,
      } as any);
      toast.success(`${symbol} removed`);
    } catch {
      toast.error("Failed to update watchlist");
    }
  };

  const availableToAdd = ALL_TOKENS.filter(
    (t) => !watchlist.includes(t) && t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-border bg-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Watchlist</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Add token dropdown */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search token..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-muted/30 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableToAdd.map((sym) => {
                const price = tokenPrices.find((t) => t.symbol === sym);
                return (
                  <button
                    key={sym}
                    onClick={() => {
                      addToken(sym);
                      setSearch("");
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/30 hover:bg-primary/10 border border-border hover:border-primary/30 transition-colors text-xs"
                  >
                    <Star className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="font-mono font-medium text-foreground">{sym}</span>
                    {price && (
                      <span className="text-muted-foreground">
                        ${price.price < 1 ? price.price.toFixed(4) : price.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </button>
                );
              })}
              {availableToAdd.length === 0 && (
                <p className="text-[10px] text-muted-foreground py-1">
                  {search ? "No matches" : "All tokens added"}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watched tokens */}
      <div className="space-y-2">
        {watchedPrices.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            Add tokens to your watchlist
          </p>
        )}
        {watchedPrices.map((token, i) => {
          const pnl = pnlBySymbol[token.symbol] ?? 0;
          return (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-center justify-between p-3 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-mono font-bold text-primary">
                  {token.symbol.slice(0, 3)}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground font-mono">{token.symbol}</p>
                  <p className="text-[10px] text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-foreground">
                    ${token.price < 1
                      ? token.price.toFixed(4)
                      : token.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <span
                      className={`text-[10px] font-mono ${
                        token.change24h >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {token.change24h >= 0 ? (
                        <TrendingUp className="inline h-2.5 w-2.5 mr-0.5" />
                      ) : (
                        <TrendingDown className="inline h-2.5 w-2.5 mr-0.5" />
                      )}
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(2)}%
                    </span>
                  </div>
                  {pnl !== 0 && (
                    <p
                      className={`text-[9px] font-mono mt-0.5 ${
                        pnl >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      PnL: {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToken(token.symbol)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-loss transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {watchedPrices.length > 0 && trades.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total Realized PnL</span>
            <span
              className={`font-mono font-semibold ${
                Object.values(pnlBySymbol).reduce((a, b) => a + b, 0) >= 0
                  ? "text-profit"
                  : "text-loss"
              }`}
            >
              {Object.values(pnlBySymbol).reduce((a, b) => a + b, 0) >= 0 ? "+" : ""}$
              {Math.abs(
                Object.values(pnlBySymbol).reduce((a, b) => a + b, 0)
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
