import { Filter } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardFiltersProps {
  symbols: string[];
  selectedSymbol: string;
  onSymbolChange: (s: string) => void;
  dateRange: string;
  onDateRangeChange: (r: string) => void;
}

const DATE_RANGES = ["7d", "14d", "30d", "90d", "All"];

export function DashboardFilters({ symbols, selectedSymbol, onSymbolChange, dateRange, onDateRangeChange }: DashboardFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-3"
    >
      <div className="flex items-center gap-2 border border-border/40 rounded-lg px-3 py-2 bg-card">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          value={selectedSymbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          className="bg-transparent text-xs font-mono text-foreground outline-none cursor-pointer"
        >
          <option value="all">All Symbols</option>
          {symbols.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-0.5 border border-border/40 rounded-lg p-1 bg-card">
        {DATE_RANGES.map(r => (
          <button
            key={r}
            onClick={() => onDateRangeChange(r)}
            className={`relative px-3 py-1.5 text-xs font-mono rounded-md transition-all duration-200 ${
              dateRange === r ? "text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {dateRange === r && (
              <motion.div
                layoutId="filter-active"
                className="absolute inset-0 bg-foreground rounded-md"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{r}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
