import { PortfolioStats } from "@/types/trading";
import { TrendingUp, TrendingDown, Activity, BarChart3, Clock, ArrowUpDown, Trophy, Skull, Target, Zap } from "lucide-react";

interface StatsGridProps {
  stats: PortfolioStats;
}

function StatCard({ label, value, subValue, icon: Icon, variant = "default" }: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  variant?: "default" | "profit" | "loss" | "primary";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${
          variant === "profit" ? "text-profit" :
          variant === "loss" ? "text-loss" :
          variant === "primary" ? "text-primary" :
          "text-muted-foreground"
        }`} />
      </div>
      <p className={`text-xl font-semibold font-mono ${
        variant === "profit" ? "text-profit" :
        variant === "loss" ? "text-loss" :
        "text-foreground"
      }`}>{value}</p>
      {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
    </div>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  const pnlVariant = stats.totalPnl >= 0 ? "profit" : "loss";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        label="Total PnL"
        value={`$${stats.totalPnl.toLocaleString()}`}
        subValue={`${stats.totalPnlPercent >= 0 ? "+" : ""}${stats.totalPnlPercent}%`}
        icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
        variant={pnlVariant}
      />
      <StatCard
        label="Win Rate"
        value={`${stats.winRate}%`}
        subValue={`${stats.totalTrades} trades`}
        icon={Target}
        variant={stats.winRate >= 50 ? "profit" : "loss"}
      />
      <StatCard
        label="Volume"
        value={`$${stats.totalVolume.toLocaleString()}`}
        subValue={`Fees: $${stats.totalFees.toLocaleString()}`}
        icon={BarChart3}
        variant="primary"
      />
      <StatCard
        label="Avg Duration"
        value={`${stats.avgDuration} min`}
        subValue={`${Math.round(stats.avgDuration / 60)}h avg`}
        icon={Clock}
        variant="default"
      />
      <StatCard
        label="Long / Short"
        value={`${stats.longRatio}% / ${stats.shortRatio}%`}
        subValue="Directional bias"
        icon={ArrowUpDown}
        variant="primary"
      />
      <StatCard
        label="Largest Win"
        value={`+$${stats.largestGain.toLocaleString()}`}
        icon={Trophy}
        variant="profit"
      />
      <StatCard
        label="Largest Loss"
        value={`-$${Math.abs(stats.largestLoss).toLocaleString()}`}
        icon={Skull}
        variant="loss"
      />
      <StatCard
        label="Avg Win / Loss"
        value={`$${stats.avgWin.toLocaleString()}`}
        subValue={`Avg loss: $${stats.avgLoss.toLocaleString()}`}
        icon={Activity}
        variant="default"
      />
      <StatCard
        label="Profit Factor"
        value={`${stats.profitFactor}`}
        subValue={`Max DD: $${stats.maxDrawdown.toLocaleString()}`}
        icon={Zap}
        variant={stats.profitFactor >= 1 ? "profit" : "loss"}
      />
      <StatCard
        label="Streaks"
        value={`W${stats.consecutiveWins} / L${stats.consecutiveLosses}`}
        subValue={`Sharpe: ${stats.sharpeRatio}`}
        icon={Activity}
        variant="default"
      />
    </div>
  );
}
