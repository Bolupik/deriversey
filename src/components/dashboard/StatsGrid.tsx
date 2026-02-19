import { PortfolioStats } from "@/types/trading";
import { TrendingUp, TrendingDown, Activity, BarChart3, Clock, ArrowUpDown, Trophy, Skull, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface StatsGridProps {
  stats: PortfolioStats;
}

function StatCard({ label, value, subValue, icon: Icon, variant = "default", index = 0 }: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  variant?: "default" | "profit" | "loss" | "primary";
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="rounded-xl border border-border/60 glass-card p-4 card-hover group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{label}</span>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
          variant === "profit" ? "bg-profit/10 group-hover:bg-profit/20" :
          variant === "loss" ? "bg-loss/10 group-hover:bg-loss/20" :
          variant === "primary" ? "bg-primary/10 group-hover:bg-primary/20" :
          "bg-muted/50 group-hover:bg-muted"
        }`}>
          <Icon className={`h-3.5 w-3.5 ${
            variant === "profit" ? "text-profit" :
            variant === "loss" ? "text-loss" :
            variant === "primary" ? "text-primary" :
            "text-muted-foreground"
          }`} />
        </div>
      </div>
      <p className={`text-xl font-semibold font-mono ${
        variant === "profit" ? "text-profit" :
        variant === "loss" ? "text-loss" :
        "text-foreground"
      }`}>{value}</p>
      {subValue && <p className="text-[10px] text-muted-foreground mt-1">{subValue}</p>}
    </motion.div>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  const pnlVariant = stats.totalPnl >= 0 ? "profit" : "loss";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard label="Total PnL" value={`$${stats.totalPnl.toLocaleString()}`} subValue={`${stats.totalPnlPercent >= 0 ? "+" : ""}${stats.totalPnlPercent}%`} icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown} variant={pnlVariant} index={0} />
      <StatCard label="Win Rate" value={`${stats.winRate}%`} subValue={`${stats.totalTrades} trades`} icon={Target} variant={stats.winRate >= 50 ? "profit" : "loss"} index={1} />
      <StatCard label="Volume" value={`$${stats.totalVolume.toLocaleString()}`} subValue={`Fees: $${stats.totalFees.toLocaleString()}`} icon={BarChart3} variant="primary" index={2} />
      <StatCard label="Avg Duration" value={`${stats.avgDuration} min`} subValue={`${Math.round(stats.avgDuration / 60)}h avg`} icon={Clock} variant="default" index={3} />
      <StatCard label="Long / Short" value={`${stats.longRatio}% / ${stats.shortRatio}%`} subValue="Directional bias" icon={ArrowUpDown} variant="primary" index={4} />
      <StatCard label="Largest Win" value={`+$${stats.largestGain.toLocaleString()}`} icon={Trophy} variant="profit" index={5} />
      <StatCard label="Largest Loss" value={`-$${Math.abs(stats.largestLoss).toLocaleString()}`} icon={Skull} variant="loss" index={6} />
      <StatCard label="Avg Win / Loss" value={`$${stats.avgWin.toLocaleString()}`} subValue={`Avg loss: $${stats.avgLoss.toLocaleString()}`} icon={Activity} variant="default" index={7} />
      <StatCard label="Profit Factor" value={`${stats.profitFactor}`} subValue={`Max DD: $${stats.maxDrawdown.toLocaleString()}`} icon={Zap} variant={stats.profitFactor >= 1 ? "profit" : "loss"} index={8} />
      <StatCard label="Streaks" value={`W${stats.consecutiveWins} / L${stats.consecutiveLosses}`} subValue={`Sharpe: ${stats.sharpeRatio}`} icon={Activity} variant="default" index={9} />
    </div>
  );
}
