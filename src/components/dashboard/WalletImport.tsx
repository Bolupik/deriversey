import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletTrades } from "@/hooks/useWalletTrades";
import { Download, ExternalLink, Loader2, ArrowRight } from "lucide-react";

export function WalletImport() {
  const { connected } = useWallet();
  const { loading, swaps, fetchWalletHistory, importSwapAsTrade, getMintSymbol } = useWalletTrades();

  if (!connected) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">Connect your wallet to import on-chain trades</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">On-Chain Import</h3>
          <p className="text-[10px] text-muted-foreground">Fetch swaps from your wallet history</p>
        </div>
        <button
          onClick={() => fetchWalletHistory(30)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {loading ? "Scanning..." : "Fetch Trades"}
        </button>
      </div>

      {swaps.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {swaps.map((swap, i) => {
            const symbolIn = getMintSymbol(swap.tokenIn);
            const symbolOut = getMintSymbol(swap.tokenOut);
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5 font-mono font-medium text-foreground">
                      <span className="text-loss">{swap.amountOut.toFixed(4)} {symbolOut}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-profit">{swap.amountIn.toFixed(4)} {symbolIn}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(swap.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://solscan.io/tx/${swap.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => importSwapAsTrade(swap)}
                    className="px-2 py-1 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Import
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && swaps.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Click "Fetch Trades" to scan your wallet for DEX swaps (Jupiter, Raydium, Orca, Drift, Zeta)
        </p>
      )}
    </div>
  );
}
