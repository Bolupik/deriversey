import { useWallet } from "@solana/wallet-adapter-react";
import { useDriftTrades } from "@/hooks/useDriftTrades";
import { Download, ExternalLink, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function PerpImport() {
  const { connected } = useWallet();
  const { loading, positions, fetchPerpHistory, importPerpAsTrade } = useDriftTrades();

  if (!connected) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-center animate-slide-up">
        <p className="text-sm text-muted-foreground">Connect your wallet to import Drift/Zeta perp trades</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Perps Import</h3>
            <p className="text-[10px] text-muted-foreground">Drift & Zeta Markets positions</p>
          </div>
        </div>
        <button
          onClick={() => fetchPerpHistory(50)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {loading ? "Scanning..." : "Fetch Perps"}
        </button>
      </div>

      {positions.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
          {positions.map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between p-3 rounded-md bg-muted/20 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                  pos.side === "long" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                }`}>
                  {pos.side}
                </span>
                <div>
                  <p className="text-xs font-mono font-medium text-foreground">{pos.market}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {pos.protocol} · {new Date(pos.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-xs font-mono font-medium ${pos.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground">${pos.size.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`https://solscan.io/tx/${pos.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => importPerpAsTrade(pos)}
                    className="px-2 py-1 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Import
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && positions.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Click "Fetch Perps" to scan for Drift & Zeta perpetual futures trades
        </p>
      )}
    </div>
  );
}
