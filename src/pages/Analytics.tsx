import { useMemo } from "react";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  computeStats,
  computeSymbolPerformance,
  computeSessionPerformance,
  computeOrderTypePerformance,
} from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export default function Analytics() {
  const { connected } = useWallet();
  const { data: trades = [], isLoading } = useDeriverseData();

  const stats = useMemo(() => computeStats(trades), [trades]);
  const symbolPerf = useMemo(() => computeSymbolPerformance(trades), [trades]);
  const sessionPerf = useMemo(() => computeSessionPerformance(trades), [trades]);
  const orderPerf = useMemo(() => computeOrderTypePerformance(trades), [trades]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, trades: 0, pnl: 0 }));
    trades.forEach(t => {
      const h = new Date(t.entryTime).getUTCHours();
      hours[h].trades++;
      hours[h].pnl += t.pnl;
    });
    return hours.map(h => ({ ...h, pnl: Math.round(h.pnl * 100) / 100 }));
  }, [trades]);

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
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
        <h2 className="text-massive mb-4">Connect Wallet</h2>
        <p className="text-sm text-muted-foreground">Connect your wallet to see Deriverse analytics.</p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-massive mb-4">No data</h2>
        <p className="text-sm text-muted-foreground">
          No Deriverse trades found. Trade on{" "}
          <a href="https://alpha.deriverse.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            alpha.deriverse.io
          </a>{" "}
          to see analytics here.
        </p>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "hsl(0, 0%, 7%)",
    border: "1px solid hsl(0, 0%, 14%)",
    borderRadius: "6px",
    fontSize: "11px",
    fontFamily: "'IBM Plex Mono', monospace",
    color: "hsl(0, 0%, 85%)",
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-overline mb-2">Deriverse Insights</p>
        <h1 className="text-massive">Analytics</h1>
      </motion.div>

      <div className="border-b border-border/30" />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kinetic-card rounded-lg p-5">
          <h3 className="text-overline mb-5">PnL by Hour (UTC)</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(0, 0%, 42%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 42%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pnl" name="PnL" fill="hsl(162, 85%, 45%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="kinetic-card rounded-lg p-5">
          <h3 className="text-overline mb-5">PnL by Day</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(0, 0%, 42%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0, 0%, 42%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pnl" name="PnL" fill="hsl(0, 0%, 50%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="kinetic-card rounded-lg p-5">
          <h3 className="text-overline mb-4">By Symbol</h3>
          <div className="space-y-2">
            {symbolPerf.map(s => (
              <div key={s.symbol} className="flex justify-between items-center p-2.5 rounded-md bg-muted/30 text-xs">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="kinetic-card rounded-lg p-5">
          <h3 className="text-overline mb-4">By Session</h3>
          <div className="space-y-2">
            {sessionPerf.map(s => (
              <div key={s.session} className="flex justify-between items-center p-2.5 rounded-md bg-muted/30 text-xs">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="kinetic-card rounded-lg p-5">
          <h3 className="text-overline mb-4">By Order Type</h3>
          <div className="space-y-2">
            {orderPerf.map(o => (
              <div key={o.type} className="flex justify-between items-center p-2.5 rounded-md bg-muted/30 text-xs">
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
