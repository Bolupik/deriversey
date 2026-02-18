import { DailyPnl } from "@/types/trading";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from "recharts";
import { useState } from "react";

interface PnlChartProps {
  data: DailyPnl[];
}

export function PnlChart({ data }: PnlChartProps) {
  const [view, setView] = useState<"cumulative" | "daily">("cumulative");

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">PnL Performance</h3>
        <div className="flex gap-1 rounded-md bg-muted p-0.5">
          <button
            onClick={() => setView("cumulative")}
            className={`px-3 py-1 text-xs rounded transition-colors ${view === "cumulative" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Cumulative
          </button>
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-1 text-xs rounded transition-colors ${view === "daily" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Daily
          </button>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {view === "cumulative" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(350, 80%, 55%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(350, 80%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 10%)",
                  border: "1px solid hsl(220, 14%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 92%)",
                }}
              />
              <Area type="monotone" dataKey="cumPnl" stroke="hsl(187, 80%, 48%)" fill="url(#pnlGrad)" strokeWidth={2} name="Cumulative PnL" />
              <Area type="monotone" dataKey="drawdown" stroke="hsl(350, 80%, 55%)" fill="url(#ddGrad)" strokeWidth={1} name="Drawdown" />
            </AreaChart>
          ) : (
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 10%)",
                  border: "1px solid hsl(220, 14%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 92%)",
                }}
              />
              <Bar dataKey="pnl" name="Daily PnL" fill="hsl(187, 80%, 48%)" radius={[2, 2, 0, 0]} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
