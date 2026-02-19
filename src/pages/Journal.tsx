import { useState, useMemo } from "react";
import type { OrderType } from "@/types/trading";
import { useTrades, useAddTrade } from "@/hooks/useTrades";
import { TradeTable } from "@/components/dashboard/TradeTable";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { WalletImport } from "@/components/dashboard/WalletImport";
import { PerpImport } from "@/components/dashboard/PerpImport";
import { TradingViewChart } from "@/components/dashboard/TradingViewChart";
import { Download, Zap, BookOpen, ArrowUpRight, ArrowDownRight, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const SYMBOLS = ["SOL-PERP", "BTC-PERP", "ETH-PERP", "BONK-PERP", "JUP-PERP", "WIF-PERP", "SOL/USDC", "ETH/USDC", "BTC/USDC"];
const CHART_SYMBOL_MAP: Record<string, string> = {
  "SOL-PERP": "SOL", "BTC-PERP": "BTC", "ETH-PERP": "ETH",
  "BONK-PERP": "BONK", "JUP-PERP": "JUP", "WIF-PERP": "WIF",
  "SOL/USDC": "SOL", "ETH/USDC": "ETH", "BTC/USDC": "BTC",
};

function TradeEntryPanel({ chartSymbol, onSymbolChange }: { chartSymbol: string; onSymbolChange: (s: string) => void }) {
  const addTrade = useAddTrade();
  const { toast } = useToast();
  const [form, setForm] = useState({
    symbol: "SOL-PERP",
    side: "long" as "long" | "short",
    orderType: "market" as string,
    entryPrice: "",
    exitPrice: "",
    size: "",
    leverage: "1",
    fees: "",
    entryTime: new Date().toISOString().slice(0, 16),
    exitTime: "",
    note: "",
  });

  const handleSymbolChange = (symbol: string) => {
    setForm(f => ({ ...f, symbol }));
    onSymbolChange(CHART_SYMBOL_MAP[symbol] || "SOL");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry = Number(form.entryPrice);
    const exit = Number(form.exitPrice) || 0;
    const size = Number(form.size);
    const lev = Number(form.leverage);
    const fees = Number(form.fees) || 0;

    if (!entry || !size) {
      toast({ title: "Missing fields", description: "Entry price and size are required.", variant: "destructive" });
      return;
    }

    let pnl = 0;
    let duration = 0;
    const status = "open";

    if (exit > 0) {
      pnl = ((exit - entry) / entry) * size * lev * (form.side === "long" ? 1 : -1) - fees;
      if (form.exitTime) {
        duration = Math.round((new Date(form.exitTime).getTime() - new Date(form.entryTime).getTime()) / 60000);
      }
    }

    try {
      await addTrade.mutateAsync({
        symbol: form.symbol,
        side: form.side,
        orderType: form.orderType as OrderType,
        entryPrice: entry,
        exitPrice: exit,
        size,
        leverage: lev,
        pnl: Math.round(pnl * 100) / 100,
        pnlPercent: Math.round((pnl / size) * 10000) / 100,
        fees,
        entryTime: new Date(form.entryTime).toISOString(),
        exitTime: form.exitTime ? new Date(form.exitTime).toISOString() : new Date(form.entryTime).toISOString(),
        duration,
        status: status as any,
        note: form.note || undefined,
      });
      toast({ title: "Trade logged", description: `${form.symbol} ${form.side} trade recorded.` });
      setForm(f => ({ ...f, entryPrice: "", exitPrice: "", size: "", fees: "", exitTime: "", note: "" }));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const inputClass = "w-full rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all";
  const labelClass = "text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block";

  return (
    <div className="rounded-xl border border-border/60 glass-card p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Send className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Log Trade</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
        {/* Symbol & Side */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Symbol</label>
            <select value={form.symbol} onChange={(e) => handleSymbolChange(e.target.value)} className={inputClass}>
              {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Side</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, side: "long" }))}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  form.side === "long"
                    ? "bg-profit/15 text-profit border border-profit/30"
                    : "bg-muted/20 text-muted-foreground border border-border/40 hover:border-muted-foreground/30"
                }`}
              >
                <ArrowUpRight className="h-3 w-3" /> Long
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, side: "short" }))}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  form.side === "short"
                    ? "bg-loss/15 text-loss border border-loss/30"
                    : "bg-muted/20 text-muted-foreground border border-border/40 hover:border-muted-foreground/30"
                }`}
              >
                <ArrowDownRight className="h-3 w-3" /> Short
              </button>
            </div>
          </div>
        </div>

        {/* Order Type & Leverage */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Order Type</label>
            <select value={form.orderType} onChange={(e) => setForm(f => ({ ...f, orderType: e.target.value }))} className={inputClass}>
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop-market">Stop Market</option>
              <option value="stop-limit">Stop Limit</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Leverage</label>
            <input type="number" step="1" min="1" max="125" placeholder="1x" value={form.leverage} onChange={(e) => setForm(f => ({ ...f, leverage: e.target.value }))} className={inputClass} required />
          </div>
        </div>

        {/* Entry & Exit Price */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Entry Price</label>
            <input type="number" step="any" placeholder="0.00" value={form.entryPrice} onChange={(e) => setForm(f => ({ ...f, entryPrice: e.target.value }))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Exit Price</label>
            <input type="number" step="any" placeholder="Optional" value={form.exitPrice} onChange={(e) => setForm(f => ({ ...f, exitPrice: e.target.value }))} className={inputClass} />
          </div>
        </div>

        {/* Size & Fees */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Size ($)</label>
            <input type="number" step="any" placeholder="0.00" value={form.size} onChange={(e) => setForm(f => ({ ...f, size: e.target.value }))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Fees ($)</label>
            <input type="number" step="any" placeholder="0.00" value={form.fees} onChange={(e) => setForm(f => ({ ...f, fees: e.target.value }))} className={inputClass} />
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Entry Time</label>
            <input type="datetime-local" value={form.entryTime} onChange={(e) => setForm(f => ({ ...f, entryTime: e.target.value }))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Exit Time</label>
            <input type="datetime-local" value={form.exitTime} onChange={(e) => setForm(f => ({ ...f, exitTime: e.target.value }))} className={inputClass} />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className={labelClass}>Note</label>
          <textarea
            placeholder="Trade rationale, setup notes..."
            value={form.note}
            onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
            rows={2}
            className={`${inputClass} resize-none`}
            maxLength={500}
          />
        </div>

        {/* PnL Preview */}
        {form.entryPrice && form.exitPrice && form.size && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg border border-border/40 bg-muted/10 p-3"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Estimated PnL</p>
            {(() => {
              const entry = Number(form.entryPrice);
              const exit = Number(form.exitPrice);
              const size = Number(form.size);
              const lev = Number(form.leverage) || 1;
              const fees = Number(form.fees) || 0;
              const pnl = ((exit - entry) / entry) * size * lev * (form.side === "long" ? 1 : -1) - fees;
              const pct = (pnl / size) * 100;
              return (
                <div className="flex items-baseline gap-2">
                  <span className={`text-lg font-mono font-bold ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                  </span>
                  <span className={`text-xs font-mono ${pnl >= 0 ? "text-profit/70" : "text-loss/70"}`}>
                    ({pct >= 0 ? "+" : ""}{pct.toFixed(2)}%)
                  </span>
                </div>
              );
            })()}
          </motion.div>
        )}

        <div className="mt-auto pt-2">
          <button
            type="submit"
            disabled={addTrade.isPending}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all glow-primary"
          >
            {addTrade.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : "Log Trade"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Journal() {
  const { data: trades = [], isLoading } = useTrades();
  const [showImport, setShowImport] = useState<"none" | "onchain" | "perps">("none");
  const [selectedSymbol, setSelectedSymbol] = useState("all");
  const [dateRange, setDateRange] = useState("All");
  const [chartSymbol, setChartSymbol] = useState("SOL");

  const symbols = useMemo(() => [...new Set(trades.map(t => t.symbol))].sort(), [trades]);
  const filtered = useMemo(() => {
    return trades.filter(t => {
      if (selectedSymbol !== "all" && t.symbol !== selectedSymbol) return false;
      if (dateRange !== "All") {
        const days = parseInt(dateRange);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (new Date(t.entryTime) < cutoff) return false;
      }
      return true;
    });
  }, [trades, selectedSymbol, dateRange]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Trade Journal</h2>
            <p className="text-xs text-muted-foreground">Log trades while watching the chart</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(showImport === "onchain" ? "none" : "onchain")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              showImport === "onchain" ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted/50"
            }`}
          >
            <Download className="h-3.5 w-3.5" /> On-Chain
          </button>
          <button
            onClick={() => setShowImport(showImport === "perps" ? "none" : "perps")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              showImport === "perps" ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted/50"
            }`}
          >
            <Zap className="h-3.5 w-3.5" /> Perps
          </button>
        </div>
      </div>

      {/* Import panels */}
      <AnimatePresence mode="wait">
        {showImport === "onchain" && (
          <motion.div key="onchain" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <WalletImport />
          </motion.div>
        )}
        {showImport === "perps" && (
          <motion.div key="perps" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <PerpImport />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart + Trade Entry side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TradingViewChart symbol={chartSymbol} />
        </div>
        <TradeEntryPanel chartSymbol={chartSymbol} onSymbolChange={setChartSymbol} />
      </div>

      {/* Filters & Trade History */}
      <DashboardFilters
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <TradeTable trades={filtered} />
      )}
    </div>
  );
}
