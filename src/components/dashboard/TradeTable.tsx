import { Trade, OrderType, TradeStatus } from "@/types/trading";
import { useState } from "react";
import { ArrowUp, ArrowDown, MessageSquare, Pencil, Trash2, Check, X, CircleDot, LogOut } from "lucide-react";
import { useDeleteTrade, useUpdateTrade } from "@/hooks/useTrades";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface TradeTableProps {
  trades: Trade[];
}

const SYMBOLS = ["SOL-PERP", "BTC-PERP", "ETH-PERP", "BONK-PERP", "JUP-PERP", "WIF-PERP", "SOL/USDC", "ETH/USDC", "BTC/USDC"];

function EditRow({ trade, onCancel, onSave }: { trade: Trade; onCancel: () => void; onSave: (t: Trade) => void }) {
  const [form, setForm] = useState({ ...trade });

  const recalc = (updates: Partial<typeof form>) => {
    const next = { ...form, ...updates };
    const entry = Number(next.entryPrice);
    const exit = Number(next.exitPrice);
    const size = Number(next.size);
    const lev = Number(next.leverage) || 1;
    const fees = Number(next.fees) || 0;

    if (entry > 0 && exit > 0 && size > 0) {
      const pnl = ((exit - entry) / entry) * size * lev * (next.side === "long" ? 1 : -1) - fees;
      next.pnl = Math.round(pnl * 100) / 100;
      next.pnlPercent = Math.round((pnl / size) * 10000) / 100;
    }
    if (next.exitTime && next.entryTime) {
      next.duration = Math.round((new Date(next.exitTime).getTime() - new Date(next.entryTime).getTime()) / 60000);
    }
    setForm(next);
  };

  const inputClass = "w-full bg-muted/30 border border-border/60 rounded px-1.5 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";

  return (
    <tr className="border-b border-primary/20 bg-primary/[0.03]">
      <td className="px-2 py-2">
        <input type="datetime-local" value={form.entryTime.slice(0, 16)} onChange={e => recalc({ entryTime: new Date(e.target.value).toISOString() })} className={`${inputClass} w-[140px]`} />
      </td>
      <td className="px-2 py-2">
        <select value={form.symbol} onChange={e => recalc({ symbol: e.target.value })} className={inputClass}>
          {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-2 py-2">
        <select value={form.side} onChange={e => recalc({ side: e.target.value as "long" | "short" })} className={inputClass}>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </td>
      <td className="px-2 py-2">
        <select value={form.status} onChange={e => recalc({ status: e.target.value as TradeStatus })} className={inputClass}>
          <option value="open">Open</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
        </select>
      </td>
      <td className="px-2 py-2">
        <input type="number" step="any" value={form.size} onChange={e => recalc({ size: Number(e.target.value) })} className={`${inputClass} w-[70px]`} />
      </td>
      <td className="px-2 py-2">
        <input type="number" step="any" value={form.entryPrice} onChange={e => recalc({ entryPrice: Number(e.target.value) })} className={`${inputClass} w-[80px]`} />
      </td>
      <td className="px-2 py-2">
        <input type="number" step="any" value={form.exitPrice || ""} onChange={e => recalc({ exitPrice: Number(e.target.value) })} className={`${inputClass} w-[80px]`} placeholder="—" />
      </td>
      <td className={`px-2 py-2 font-mono text-xs font-medium ${form.pnl >= 0 ? "text-profit" : "text-loss"}`}>
        {form.pnl >= 0 ? "+" : ""}${form.pnl.toLocaleString()}
      </td>
      <td className="px-2 py-2">
        <input type="number" step="any" value={form.fees} onChange={e => recalc({ fees: Number(e.target.value) })} className={`${inputClass} w-[60px]`} />
      </td>
      <td className="px-2 py-2 text-muted-foreground text-xs">
        {form.duration < 60 ? `${form.duration}m` : `${Math.round(form.duration / 60)}h`}
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <button onClick={() => onSave(form)} className="p-1 rounded text-profit hover:bg-profit/10 transition-colors"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={onCancel} className="p-1 rounded text-muted-foreground hover:bg-muted/50 transition-colors"><X className="h-3.5 w-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}

export function TradeTable({ trades }: TradeTableProps) {
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closeExitPrice, setCloseExitPrice] = useState("");
  const [closeFees, setCloseFees] = useState("");
  const deleteTrade = useDeleteTrade();
  const updateTrade = useUpdateTrade();
  const { toast } = useToast();

  const perPage = 15;
  const totalPages = Math.ceil(trades.length / perPage);
  const paginated = trades.slice(page * perPage, (page + 1) * perPage);

  const handleDelete = async (id: string) => {
    try {
      await deleteTrade.mutateAsync(id);
      toast({ title: "Trade deleted" });
      setDeletingId(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSave = async (trade: Trade) => {
    try {
      await updateTrade.mutateAsync(trade);
      toast({ title: "Trade updated" });
      setEditingId(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleClose = async (trade: Trade) => {
    const exit = Number(closeExitPrice);
    if (!exit || exit <= 0) {
      toast({ title: "Invalid exit price", variant: "destructive" });
      return;
    }
    const fees = Number(closeFees) || trade.fees;
    const pnl = ((exit - trade.entryPrice) / trade.entryPrice) * trade.size * trade.leverage * (trade.side === "long" ? 1 : -1) - fees;
    const pnlPercent = Math.round((pnl / trade.size) * 10000) / 100;
    const now = new Date().toISOString();
    const duration = Math.round((new Date(now).getTime() - new Date(trade.entryTime).getTime()) / 60000);
    const status: TradeStatus = pnl >= 0 ? "win" : "loss";

    try {
      await updateTrade.mutateAsync({
        ...trade,
        exitPrice: exit,
        exitTime: now,
        pnl: Math.round(pnl * 100) / 100,
        pnlPercent,
        duration,
        fees,
        status,
      });
      toast({ title: `Trade closed — ${status === "win" ? "Win" : "Loss"}`, description: `PnL: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` });
      setClosingId(null);
      setCloseExitPrice("");
      setCloseFees("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const statusBadge = (status: TradeStatus) => {
    if (status === "open") return "bg-warning/10 text-warning border-warning/20";
    if (status === "win") return "bg-profit/10 text-profit border-profit/20";
    return "bg-loss/10 text-loss border-loss/20";
  };

  // Preview PnL for close form
  const getClosePnlPreview = (trade: Trade) => {
    const exit = Number(closeExitPrice);
    if (!exit || exit <= 0) return null;
    const fees = Number(closeFees) || trade.fees;
    const pnl = ((exit - trade.entryPrice) / trade.entryPrice) * trade.size * trade.leverage * (trade.side === "long" ? 1 : -1) - fees;
    return pnl;
  };

  const inputClass = "bg-muted/30 border border-border/60 rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";

  return (
    <div className="rounded-xl border border-border/60 glass-card">
      <div className="p-4 border-b border-border/50">
        <h3 className="text-sm font-medium text-foreground">Trade History</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{trades.length} trades</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50">
              {["Time", "Symbol", "Side", "Status", "Size", "Entry", "Exit", "PnL", "Fees", "Duration", ""].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginated.map((trade) => {
                if (editingId === trade.id) {
                  return <EditRow key={trade.id} trade={trade} onCancel={() => setEditingId(null)} onSave={handleSave} />;
                }

                const isClosing = closingId === trade.id;

                return (
                  <motion.tr
                    key={trade.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`border-b border-border/30 hover:bg-muted/20 transition-colors group ${isClosing ? "bg-warning/[0.03]" : ""}`}
                  >
                    <td className="px-3 py-2.5 font-mono text-muted-foreground">
                      {new Date(trade.entryTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      <br />
                      <span className="text-[10px]">{new Date(trade.entryTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-medium text-foreground">{trade.symbol}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        trade.side === "long" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                      }`}>
                        {trade.side === "long" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusBadge(trade.status)}`}>
                        {trade.status === "open" && <CircleDot className="h-2.5 w-2.5" />}
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono">${trade.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-3 py-2.5 font-mono">${trade.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>

                    {/* Exit price — inline close input when closing */}
                    <td className="px-3 py-2.5 font-mono">
                      {isClosing ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="number"
                            step="any"
                            placeholder="Exit $"
                            value={closeExitPrice}
                            onChange={e => setCloseExitPrice(e.target.value)}
                            className={`${inputClass} w-[90px]`}
                            autoFocus
                          />
                          <input
                            type="number"
                            step="any"
                            placeholder={`Fees ($${trade.fees})`}
                            value={closeFees}
                            onChange={e => setCloseFees(e.target.value)}
                            className={`${inputClass} w-[90px]`}
                          />
                        </div>
                      ) : (
                        trade.exitPrice ? `$${trade.exitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* PnL — show live preview when closing */}
                    <td className={`px-3 py-2.5 font-mono font-medium ${
                      trade.status === "open" ? "text-muted-foreground" : trade.pnl >= 0 ? "text-profit" : "text-loss"
                    }`}>
                      {isClosing ? (() => {
                        const preview = getClosePnlPreview(trade);
                        if (preview === null) return <span className="text-muted-foreground/50">Enter exit</span>;
                        return (
                          <span className={preview >= 0 ? "text-profit" : "text-loss"}>
                            {preview >= 0 ? "+" : ""}${preview.toFixed(2)}
                          </span>
                        );
                      })() : trade.status === "open" ? "—" : (
                        <>
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toLocaleString()}
                          <br />
                          <span className="text-[10px] opacity-70">{trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent}%</span>
                        </>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-muted-foreground">${trade.fees}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {trade.status === "open" ? "—" : trade.duration < 60 ? `${trade.duration}m` : `${Math.round(trade.duration / 60)}h`}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {trade.note && (
                          <span title={trade.note} className="p-1 text-primary cursor-help">
                            <MessageSquare className="h-3 w-3" />
                          </span>
                        )}

                        {/* Close trade button — only for open trades */}
                        {trade.status === "open" && !isClosing && (
                          <button
                            onClick={() => { setClosingId(trade.id); setCloseExitPrice(""); setCloseFees(""); setEditingId(null); }}
                            className="p-1 rounded text-warning hover:bg-warning/10 transition-colors"
                            title="Close trade"
                          >
                            <LogOut className="h-3 w-3" />
                          </button>
                        )}

                        {/* Close confirm/cancel */}
                        {isClosing && (
                          <>
                            <button
                              onClick={() => handleClose(trade)}
                              disabled={updateTrade.isPending}
                              className="p-1 rounded text-profit hover:bg-profit/10 transition-colors disabled:opacity-50"
                              title="Confirm close"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { setClosingId(null); setCloseExitPrice(""); setCloseFees(""); }} className="p-1 rounded text-muted-foreground hover:bg-muted/40 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}

                        {!isClosing && (
                          <>
                            <button onClick={() => setEditingId(trade.id)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                              <Pencil className="h-3 w-3" />
                            </button>
                            {deletingId === trade.id ? (
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => handleDelete(trade.id)} className="p-1 rounded text-loss hover:bg-loss/10 transition-colors">
                                  <Check className="h-3 w-3" />
                                </button>
                                <button onClick={() => setDeletingId(null)} className="p-1 rounded text-muted-foreground hover:bg-muted/40 transition-colors">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setDeletingId(trade.id)} className="p-1 rounded text-muted-foreground hover:text-loss hover:bg-loss/10 transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 text-xs rounded border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 text-xs rounded border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
