import { useMemo } from "react";
import { useTrades } from "@/hooks/useTrades";
import {
  computeStats,
  computeSymbolPerformance,
  computeSessionPerformance,
  computeOrderTypePerformance,
  computeDailyPnl,
} from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function Analytics() {
  const { data: trades = [], isLoading } = useTrades();

  const stats = useMemo(() => computeStats(trades), [trades]);
  const symbolPerf = useMemo(() => computeSymbolPerformance(trades), [trades]);
  const sessionPerf = useMemo(() => computeSessionPerformance(trades), [trades]);
  const orderPerf = useMemo(() => computeOrderTypePerformance(trades), [trades]);
  const dailyPnl = useMemo(() => computeDailyPnl(trades), [trades]);

  // Hourly distribution
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, trades: 0, pnl: 0 }));
    trades.forEach(t => {
      const h = new Date(t.entryTime).getUTCHours();
      hours[h].trades++;
      hours[h].pnl += t.pnl;
    });
    return hours.map(h => ({ ...h, pnl: Math.round(h.pnl * 100) / 100 }));
  }, [trades]);

  // Day-of-week distribution
  const dayData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => ({ day: d, trades: 0, pnl: 0 }));
    trades.forEach(t => {
      const d = new Date(t.entryTime).getUTCDay();
      days[d].trades++;
      days[d].pnl += t.pnl;
    });
    return days.map(d => ({ ...d, pnl: Math.round(d.pnl * 100) / 100 }));
  }, [trades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">No data to analyze</h2>
        <p className="text-sm text-muted-foreground">Add trades in the Journal to see analytics here.</p>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "hsl(220, 18%, 10%)",
    border: "1px solid hsl(220, 14%, 18%)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(210, 20%, 92%)",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Advanced Analytics</h2>
        <p className="text-xs text-muted-foreground">Deep performance insights across all your trades</p>
      </div>

      {/* Time-of-day chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border/60 glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">PnL by Hour (UTC)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(215, 12%, 50%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pnl" name="PnL" fill="hsl(187, 80%, 48%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border/60 glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">PnL by Day of Week</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pnl" name="PnL" fill="hsl(260, 60%, 55%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Symbol, Session, Order type tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Symbol Performance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border/60 glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">By Symbol</h3>
          <div className="space-y-2">
            {symbolPerf.map(s => (
              <div key={s.symbol} className="flex justify-between items-center p-2 rounded bg-muted/30 text-xs">
                <div>
                  <p className="font-mono font-medium text-foreground">{s.symbol}</p>
                  <p className="text-[10px] text-muted-foreground">{s.trades} trades · {s.winRate}% WR</p>
                </div>
                <span className={`font-mono font-medium ${s.totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {s.totalPnl >= 0 ? "+" : ""}${s.totalPnl.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Session Performance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border/60 glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">By Session</h3>
          <div className="space-y-2">
            {sessionPerf.map(s => (
              <div key={s.session} className="flex justify-between items-center p-2 rounded bg-muted/30 text-xs">
                <div>
                  <p className="font-medium text-foreground">{s.session}</p>
                  <p className="text-[10px] text-muted-foreground">{s.trades} trades · {s.winRate}% WR</p>
                </div>
                <span className={`font-mono font-medium ${s.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {s.pnl >= 0 ? "+" : ""}${s.pnl.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Type Performance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border border-border/60 glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">By Order Type</h3>
          <div className="space-y-2">
            {orderPerf.map(o => (
              <div key={o.type} className="flex justify-between items-center p-2 rounded bg-muted/30 text-xs">
                <div>
                  <p className="font-medium text-foreground capitalize">{o.type}</p>
                  <p className="text-[10px] text-muted-foreground">{o.trades} trades · {o.winRate}% WR</p>
                </div>
                <span className={`font-mono font-medium ${o.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {o.pnl >= 0 ? "+" : ""}${o.pnl.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
