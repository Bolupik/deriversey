import { useState, useMemo } from "react";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PnlChart } from "@/components/dashboard/PnlChart";
import { FeeChart } from "@/components/dashboard/FeeChart";
import { SymbolTable } from "@/components/dashboard/SymbolTable";
import { SessionPanel } from "@/components/dashboard/SessionPanel";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { TradingViewChart } from "@/components/dashboard/TradingViewChart";
import { useTrades } from "@/hooks/useTrades";
import {
  computeStats,
  computeDailyPnl,
  computeFeeBreakdown,
  computeSymbolPerformance,
  computeSessionPerformance,
  computeOrderTypePerformance,
} from "@/data/mockData";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { data: trades = [], isLoading } = useTrades();
  const [selectedSymbol, setSelectedSymbol] = useState("all");
  const [dateRange, setDateRange] = useState("30d");

  const symbols = useMemo(() => [...new Set(trades.map(t => t.symbol))].sort(), [trades]);

  const filteredTrades = useMemo(() => {
    let result = trades;
    if (selectedSymbol !== "all") result = result.filter(t => t.symbol === selectedSymbol);
    if (dateRange !== "All") {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(t => new Date(t.entryTime) >= cutoff);
    }
    return result;
  }, [trades, selectedSymbol, dateRange]);

  const stats = useMemo(() => computeStats(filteredTrades), [filteredTrades]);
  const dailyPnl = useMemo(() => computeDailyPnl(filteredTrades), [filteredTrades]);
  const fees = useMemo(() => computeFeeBreakdown(filteredTrades), [filteredTrades]);
  const symbolPerf = useMemo(() => computeSymbolPerformance(filteredTrades), [filteredTrades]);
  const sessionPerf = useMemo(() => computeSessionPerformance(filteredTrades), [filteredTrades]);
  const orderTypePerf = useMemo(() => computeOrderTypePerformance(filteredTrades), [filteredTrades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-massive mb-4">No trades yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Head to the <a href="/journal" className="text-primary hover:underline">Journal</a> to log your first trade.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero stat */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-overline mb-2">Performance Overview</p>
        <h1 className="text-massive">
          {stats.totalPnl >= 0 ? "+" : ""}${Math.abs(stats.totalPnl).toLocaleString()}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-mono">
          {stats.totalTrades} trades · {stats.winRate}% win rate · {stats.totalPnlPercent >= 0 ? "+" : ""}{stats.totalPnlPercent}%
        </p>
      </motion.div>

      <div className="border-b border-border/30" />

      <DashboardFilters
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PnlChart data={dailyPnl} />
        </div>
        <FeeChart data={fees} totalFees={stats.totalFees} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TradingViewChart symbol="SOL" />
        </div>
        <div className="space-y-5">
          <div className="rounded-lg kinetic-card p-5">
            <h3 className="text-overline mb-4">Long / Short Ratio</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-1">Long</p>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.longRatio}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <p className="text-lg font-mono font-semibold text-foreground mt-1">{stats.longRatio}%</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground mb-1">Short</p>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.shortRatio}%` }}
                    transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-loss"
                  />
                </div>
                <p className="text-lg font-mono font-semibold text-foreground mt-1">{stats.shortRatio}%</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/30 space-y-2.5">
              <h4 className="text-overline">Quick Stats</h4>
              {[
                ["Profit Factor", stats.profitFactor.toString()],
                ["Sharpe Ratio", stats.sharpeRatio.toString()],
                ["Max Drawdown", `$${stats.maxDrawdown.toLocaleString()}`],
                ["Best Streak", `${stats.consecutiveWins} wins`],
                ["Worst Streak", `${stats.consecutiveLosses} losses`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SymbolTable data={symbolPerf} />
        <SessionPanel data={sessionPerf} orderTypeData={orderTypePerf} />
      </div>
    </div>
  );
};

export default Index;
