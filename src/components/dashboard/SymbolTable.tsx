import { SymbolPerformance } from "@/types/trading";
import { motion } from "framer-motion";

interface SymbolTableProps {
  data: SymbolPerformance[];
}

export function SymbolTable({ data }: SymbolTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <h3 className="text-sm font-medium text-foreground mb-4">Symbol Performance</h3>
      <div className="space-y-2">
        {data.map((s, i) => (
          <motion.div
            key={s.symbol}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="text-sm font-mono font-medium text-foreground">{s.symbol}</p>
              <p className="text-[10px] text-muted-foreground">{s.trades} trades · {s.winRate}% WR</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-mono font-medium ${s.totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
                {s.totalPnl >= 0 ? "+" : ""}${s.totalPnl.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">Vol: ${s.volume.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
