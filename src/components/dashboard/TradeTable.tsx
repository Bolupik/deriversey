import { Trade } from "@/types/trading";
import { useState } from "react";
import { ArrowUp, ArrowDown, MessageSquare } from "lucide-react";

interface TradeTableProps {
  trades: Trade[];
}

export function TradeTable({ trades }: TradeTableProps) {
  const [page, setPage] = useState(0);
  const perPage = 15;
  const totalPages = Math.ceil(trades.length / perPage);
  const paginated = trades.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Trade History</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{trades.length} trades</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Time", "Symbol", "Side", "Type", "Size", "Entry", "Exit", "PnL", "Fees", "Duration", ""].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((trade) => (
              <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2.5 font-mono text-muted-foreground">
                  {new Date(trade.entryTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  <br />
                  <span className="text-[10px]">{new Date(trade.entryTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                </td>
                <td className="px-3 py-2.5 font-mono font-medium text-foreground">{trade.symbol}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    trade.side === "long" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  }`}>
                    {trade.side === "long" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground capitalize">{trade.orderType}</td>
                <td className="px-3 py-2.5 font-mono">${trade.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="px-3 py-2.5 font-mono">${trade.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="px-3 py-2.5 font-mono">${trade.exitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className={`px-3 py-2.5 font-mono font-medium ${trade.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toLocaleString()}
                  <br />
                  <span className="text-[10px] opacity-70">{trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent}%</span>
                </td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">${trade.fees}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{trade.duration < 60 ? `${trade.duration}m` : `${Math.round(trade.duration / 60)}h`}</td>
                <td className="px-3 py-2.5">
                  {trade.note && (
                    <span title={trade.note} className="text-primary cursor-help">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
