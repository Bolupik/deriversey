import { Search, Calendar, Filter } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          value={selectedSymbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          className="bg-transparent text-xs text-foreground outline-none cursor-pointer"
        >
          <option value="all">All Symbols</option>
          {symbols.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
        {DATE_RANGES.map(r => (
          <button
            key={r}
            onClick={() => onDateRangeChange(r)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              dateRange === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
