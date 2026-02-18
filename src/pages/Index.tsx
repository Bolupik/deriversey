import { useState, useMemo } from "react";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PnlChart } from "@/components/dashboard/PnlChart";
import { TradeTable } from "@/components/dashboard/TradeTable";
import { FeeChart } from "@/components/dashboard/FeeChart";
import { SymbolTable } from "@/components/dashboard/SymbolTable";
import { SessionPanel } from "@/components/dashboard/SessionPanel";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import {
  mockTrades,
  computeStats,
  computeDailyPnl,
  computeFeeBreakdown,
  computeSymbolPerformance,
  computeSessionPerformance,
  computeOrderTypePerformance,
} from "@/data/mockData";
import { Activity } from "lucide-react";

const Index = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("all");
  const [dateRange, setDateRange] = useState("30d");

  const symbols = useMemo(() => [...new Set(mockTrades.map(t => t.symbol))].sort(), []);

  const filteredTrades = useMemo(() => {
    let trades = mockTrades;

    if (selectedSymbol !== "all") {
      trades = trades.filter(t => t.symbol === selectedSymbol);
    }

    if (dateRange !== "All") {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      trades = trades.filter(t => new Date(t.entryTime) >= cutoff);
    }

    return trades;
  }, [selectedSymbol, dateRange]);

  const stats = useMemo(() => computeStats(filteredTrades), [filteredTrades]);
  const dailyPnl = useMemo(() => computeDailyPnl(filteredTrades), [filteredTrades]);
  const fees = useMemo(() => computeFeeBreakdown(filteredTrades), [filteredTrades]);
  const symbolPerf = useMemo(() => computeSymbolPerformance(filteredTrades), [filteredTrades]);
  const sessionPerf = useMemo(() => computeSessionPerformance(filteredTrades), [filteredTrades]);
  const orderTypePerf = useMemo(() => computeOrderTypePerformance(filteredTrades), [filteredTrades]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">Deriverse Analytics</h1>
              <p className="text-[10px] text-muted-foreground">Trading Journal & Portfolio Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-profit/10 text-profit">
              <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse-glow" />
              Devnet
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filters */}
        <DashboardFilters
          symbols={symbols}
          selectedSymbol={selectedSymbol}
          onSymbolChange={setSelectedSymbol}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Stats Overview */}
        <StatsGrid stats={stats} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PnlChart data={dailyPnl} />
          </div>
          <FeeChart data={fees} totalFees={stats.totalFees} />
        </div>

        {/* Analysis Row */}
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

        {/* Trade History */}
        <TradeTable trades={filteredTrades} />
      </main>
    </div>
  );
};

export default Index;
