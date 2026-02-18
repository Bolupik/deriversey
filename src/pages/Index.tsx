import { useState, useMemo } from "react";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PnlChart } from "@/components/dashboard/PnlChart";
import { FeeChart } from "@/components/dashboard/FeeChart";
import { SymbolTable } from "@/components/dashboard/SymbolTable";
import { SessionPanel } from "@/components/dashboard/SessionPanel";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { useTrades } from "@/hooks/useTrades";
import {
  computeStats,
  computeDailyPnl,
  computeFeeBreakdown,
  computeSymbolPerformance,
  computeSessionPerformance,
  computeOrderTypePerformance,
} from "@/data/mockData";

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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">No trades yet</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Head to the <a href="/journal" className="text-primary hover:underline">Journal</a> page to add your first trade and start tracking your performance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardFilters
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <StatsGrid stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PnlChart data={dailyPnl} />
        </div>
        <FeeChart data={fees} totalFees={stats.totalFees} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SymbolTable data={symbolPerf} />
        <SessionPanel data={sessionPerf} orderTypeData={orderTypePerf} />
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-3">Long/Short Ratio</h3>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Long</p>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-profit transition-all" style={{ width: `${stats.longRatio}%` }} />
                </div>
                <p className="text-lg font-mono font-semibold text-profit mt-1">{stats.longRatio}%</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Short</p>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-loss transition-all" style={{ width: `${stats.shortRatio}%` }} />
                </div>
                <p className="text-lg font-mono font-semibold text-loss mt-1">{stats.shortRatio}%</p>
              </div>
            </div>
            <div className="pt-3 border-t border-border space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Stats</h4>
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
    </div>
  );
};

export default Index;
