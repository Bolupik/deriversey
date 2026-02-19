import { SessionPerformance } from "@/types/trading";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

interface SessionPanelProps {
  data: SessionPerformance[];
  orderTypeData: { type: string; trades: number; winRate: number; pnl: number; avgPnl: number }[];
}

export function SessionPanel({ data, orderTypeData }: SessionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg border border-border bg-card p-5 space-y-5"
    >
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Session Performance</h3>
        </div>
        <div className="space-y-2">
          {data.map((s) => (
            <div key={s.session} className="flex items-center justify-between p-2.5 rounded-md bg-muted/30">
              <div>
                <p className="text-xs font-medium text-foreground">{s.session}</p>
                <p className="text-[10px] text-muted-foreground">{s.trades} trades · {s.winRate}% WR</p>
              </div>
              <p className={`text-sm font-mono font-medium ${s.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                {s.pnl >= 0 ? "+" : ""}${s.pnl.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Order Type Analysis</h3>
        <div className="space-y-2">
          {orderTypeData.map((o) => (
            <div key={o.type} className="flex items-center justify-between p-2.5 rounded-md bg-muted/30">
              <div>
                <p className="text-xs font-medium text-foreground capitalize">{o.type}</p>
                <p className="text-[10px] text-muted-foreground">{o.trades} trades · {o.winRate}% WR</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-mono font-medium ${o.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {o.pnl >= 0 ? "+" : ""}${o.pnl.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">Avg: ${o.avgPnl}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
