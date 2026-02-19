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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="kinetic-card rounded-lg p-4 group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-overline">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${
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
      {subValue && <p className="text-[10px] text-muted-foreground mt-1 font-mono">{subValue}</p>}
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
