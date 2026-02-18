import { SymbolPerformance } from "@/types/trading";

interface SymbolTableProps {
  data: SymbolPerformance[];
}

export function SymbolTable({ data }: SymbolTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">Symbol Performance</h3>
      <div className="space-y-2">
        {data.map((s) => (
          <div key={s.symbol} className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
            <div>
              <p className="text-sm font-mono font-medium text-foreground">{s.symbol}</p>
              <p className="text-[10px] text-muted-foreground">{s.trades} trades · {s.winRate}% WR</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-mono font-medium ${s.totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
                {s.totalPnl >= 0 ? "+" : ""}${s.totalPnl.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">Vol: ${s.volume.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
