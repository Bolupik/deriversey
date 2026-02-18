import { useState } from "react";
import { useTrades, useAddTrade } from "@/hooks/useTrades";
import { TradeTable } from "@/components/dashboard/TradeTable";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { WalletImport } from "@/components/dashboard/WalletImport";
import { PerpImport } from "@/components/dashboard/PerpImport";
import { Plus, X, Download, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const SYMBOLS = ["SOL-PERP", "BTC-PERP", "ETH-PERP", "BONK-PERP", "JUP-PERP", "WIF-PERP", "SOL/USDC", "ETH/USDC", "BTC/USDC"];

function AddTradeForm({ onClose }: { onClose: () => void }) {
  const addTrade = useAddTrade();
  const { toast } = useToast();
  const [form, setForm] = useState({
    symbol: "SOL-PERP",
    side: "long" as "long" | "short",
    orderType: "market" as any,
    entryPrice: "",
    exitPrice: "",
    size: "",
    leverage: "1",
    fees: "",
    entryTime: new Date().toISOString().slice(0, 16),
    exitTime: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry = Number(form.entryPrice);
    const exit = Number(form.exitPrice) || 0;
    const size = Number(form.size);
    const lev = Number(form.leverage);
    const fees = Number(form.fees) || 0;

    let pnl = 0;
    let duration = 0;
    let status: "open" | "win" | "loss" = "open";

    if (exit > 0) {
      pnl = ((exit - entry) / entry) * size * lev * (form.side === "long" ? 1 : -1) - fees;
      status = pnl >= 0 ? "win" : "loss";
      if (form.exitTime) {
        duration = Math.round((new Date(form.exitTime).getTime() - new Date(form.entryTime).getTime()) / 60000);
      }
    }

    try {
      await addTrade.mutateAsync({
        symbol: form.symbol,
        side: form.side,
        orderType: form.orderType,
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
      toast({ title: "Trade added", description: `${form.symbol} ${form.side} trade recorded.` });
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const inputClass = "w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-border bg-card p-5 mb-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Add Trade</h3>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} className={inputClass}>
          {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value as any })} className={inputClass}>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
        <select value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value })} className={inputClass}>
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop-market">Stop Market</option>
          <option value="stop-limit">Stop Limit</option>
        </select>
        <input type="number" step="any" placeholder="Leverage" value={form.leverage} onChange={(e) => setForm({ ...form, leverage: e.target.value })} className={inputClass} required />
        <input type="number" step="any" placeholder="Entry Price" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} className={inputClass} required />
        <input type="number" step="any" placeholder="Exit Price (optional)" value={form.exitPrice} onChange={(e) => setForm({ ...form, exitPrice: e.target.value })} className={inputClass} />
        <input type="number" step="any" placeholder="Size ($)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={inputClass} required />
        <input type="number" step="any" placeholder="Fees ($)" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} className={inputClass} />
        <input type="datetime-local" value={form.entryTime} onChange={(e) => setForm({ ...form, entryTime: e.target.value })} className={inputClass} required />
        <input type="datetime-local" placeholder="Exit Time" value={form.exitTime} onChange={(e) => setForm({ ...form, exitTime: e.target.value })} className={inputClass} />
        <input type="text" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={`${inputClass} col-span-2`} />
        <div className="col-span-2 md:col-span-4 flex justify-end">
          <button type="submit" disabled={addTrade.isPending} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
            {addTrade.isPending ? "Saving..." : "Save Trade"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function Journal() {
  const { data: trades = [], isLoading } = useTrades();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState<"none" | "onchain" | "perps">("none");
  const [selectedSymbol, setSelectedSymbol] = useState("all");
  const [dateRange, setDateRange] = useState("All");

  const symbols = [...new Set(trades.map(t => t.symbol))].sort();
  const filtered = trades.filter(t => {
    if (selectedSymbol !== "all" && t.symbol !== selectedSymbol) return false;
    if (dateRange !== "All") {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (new Date(t.entryTime) < cutoff) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Trade Journal</h2>
          <p className="text-xs text-muted-foreground">Log, import, and review your trades</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowImport(showImport === "onchain" ? "none" : "onchain"); setShowForm(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              showImport === "onchain" ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted/50"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            On-Chain
          </button>
          <button
            onClick={() => { setShowImport(showImport === "perps" ? "none" : "perps"); setShowForm(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              showImport === "perps" ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted/50"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Perps
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setShowImport("none"); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Trade
          </button>
        </div>
      </div>

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
        {showForm && (
          <AddTradeForm key="form" onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>

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
