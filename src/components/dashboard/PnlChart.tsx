import { DailyPnl } from "@/types/trading";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from "recharts";
import { useState } from "react";
import { motion } from "framer-motion";

interface PnlChartProps {
  data: DailyPnl[];
}

export function PnlChart({ data }: PnlChartProps) {
  const [view, setView] = useState<"cumulative" | "daily">("cumulative");

  const tooltipStyle = {
    backgroundColor: "hsl(0, 0%, 7%)",
    border: "1px solid hsl(0, 0%, 14%)",
    borderRadius: "6px",
    fontSize: "11px",
    fontFamily: "'IBM Plex Mono', monospace",
    color: "hsl(0, 0%, 85%)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="kinetic-card rounded-lg p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-overline">PnL Performance</h3>
        <div className="flex gap-0.5 border border-border/40 rounded-md p-0.5 bg-card">
          {(["cumulative", "daily"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`relative px-3 py-1 text-[10px] font-mono rounded transition-all ${
                view === v ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {view === v && (
                <motion.div
                  layoutId="pnl-view"
                  className="absolute inset-0 bg-foreground rounded"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 capitalize">{v}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {view === "cumulative" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(162, 85%, 45%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(162, 85%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(0, 0%, 42%)" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(0, 0%, 42%)" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="cumPnl" stroke="hsl(162, 85%, 45%)" fill="url(#pnlGrad)" strokeWidth={1.5} name="Cumulative PnL" />
              <Area type="monotone" dataKey="drawdown" stroke="hsl(0, 72%, 55%)" fill="url(#ddGrad)" strokeWidth={1} name="Drawdown" />
            </AreaChart>
          ) : (
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(0, 0%, 42%)" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(0, 0%, 42%)" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pnl" name="Daily PnL" fill="hsl(162, 85%, 45%)" radius={[2, 2, 0, 0]} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
