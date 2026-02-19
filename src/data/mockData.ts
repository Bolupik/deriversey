import { Trade, DailyPnl, FeeBreakdown, SymbolPerformance, SessionPerformance, PortfolioStats } from "@/types/trading";

export function computeStats(trades: Trade[]): PortfolioStats {
  const wins = trades.filter(t => t.status === "win");
  const losses = trades.filter(t => t.status === "loss");
  const longs = trades.filter(t => t.side === "long");
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const totalVolume = trades.reduce((s, t) => s + t.size, 0);
  const totalFees = trades.reduce((s, t) => s + t.fees, 0);
  const avgDuration = trades.reduce((s, t) => s + t.duration, 0) / (trades.length || 1);

  let maxDD = 0, peak = 0, cumPnl = 0;
  for (const t of trades) {
    cumPnl += t.pnl;
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDD) maxDD = dd;
  }

  let consWins = 0, consLosses = 0, curWins = 0, curLosses = 0;
  for (const t of trades) {
    if (t.status === "win") { curWins++; curLosses = 0; consWins = Math.max(consWins, curWins); }
    else { curLosses++; curWins = 0; consLosses = Math.max(consLosses, curLosses); }
  }

  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  // Compute Sharpe ratio from actual trade returns
  const returns = trades.map(t => t.pnlPercent / 100);
  const meanReturn = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((s, r) => s + (r - meanReturn) ** 2, 0) / (returns.length - 1)
    : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? Math.round((meanReturn / stdDev) * 100) / 100 : 0;

  return {
    totalPnl: Math.round(totalPnl * 100) / 100,
    totalPnlPercent: Math.round((totalPnl / (totalVolume || 1)) * 10000) / 100,
    winRate: Math.round((wins.length / (trades.length || 1)) * 10000) / 100,
    totalTrades: trades.length,
    totalVolume: Math.round(totalVolume),
    totalFees: Math.round(totalFees * 100) / 100,
    avgDuration: Math.round(avgDuration),
    longRatio: Math.round((longs.length / (trades.length || 1)) * 10000) / 100,
    shortRatio: Math.round(((trades.length - longs.length) / (trades.length || 1)) * 10000) / 100,
    largestGain: Math.round((wins.length ? Math.max(...wins.map(t => t.pnl)) : 0) * 100) / 100,
    largestLoss: Math.round((losses.length ? Math.min(...losses.map(t => t.pnl)) : 0) * 100) / 100,
    avgWin: Math.round((wins.length ? grossProfit / wins.length : 0) * 100) / 100,
    avgLoss: Math.round((losses.length ? grossLoss / losses.length : 0) * 100) / 100,
    profitFactor: Math.round((grossLoss ? grossProfit / grossLoss : 0) * 100) / 100,
    maxDrawdown: Math.round(maxDD * 100) / 100,
    sharpeRatio,
    consecutiveWins: consWins,
    consecutiveLosses: consLosses,
  };
}

export function computeDailyPnl(trades: Trade[]): DailyPnl[] {
  const byDate = new Map<string, Trade[]>();
  trades.forEach(t => {
    const d = t.entryTime.slice(0, 10);
    byDate.set(d, [...(byDate.get(d) || []), t]);
  });

  let cumPnl = 0, peak = 0;
  const sorted = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([date, dayTrades]) => {
    const pnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
    cumPnl += pnl;
    if (cumPnl > peak) peak = cumPnl;
    return {
      date,
      pnl: Math.round(pnl * 100) / 100,
      cumPnl: Math.round(cumPnl * 100) / 100,
      drawdown: Math.round((peak - cumPnl) * 100) / 100,
      trades: dayTrades.length,
      volume: Math.round(dayTrades.reduce((s, t) => s + t.size, 0)),
    };
  });
}

export function computeFeeBreakdown(trades: Trade[]): FeeBreakdown[] {
  const totalFees = trades.reduce((s, t) => s + t.fees, 0);
  const makerFees = totalFees * 0.35;
  const takerFees = totalFees * 0.55;
  const fundingFees = totalFees * 0.10;
  return [
    { type: "Taker Fees", amount: Math.round(takerFees * 100) / 100, percentage: 55 },
    { type: "Maker Fees", amount: Math.round(makerFees * 100) / 100, percentage: 35 },
    { type: "Funding Fees", amount: Math.round(fundingFees * 100) / 100, percentage: 10 },
  ];
}

export function computeSymbolPerformance(trades: Trade[]): SymbolPerformance[] {
  const bySymbol = new Map<string, Trade[]>();
  trades.forEach(t => bySymbol.set(t.symbol, [...(bySymbol.get(t.symbol) || []), t]));

  return Array.from(bySymbol.entries()).map(([symbol, sTrades]) => ({
    symbol,
    trades: sTrades.length,
    winRate: Math.round((sTrades.filter(t => t.status === "win").length / sTrades.length) * 10000) / 100,
    totalPnl: Math.round(sTrades.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
    avgPnl: Math.round((sTrades.reduce((s, t) => s + t.pnl, 0) / sTrades.length) * 100) / 100,
    volume: Math.round(sTrades.reduce((s, t) => s + t.size, 0)),
  })).sort((a, b) => b.totalPnl - a.totalPnl);
}

export function computeSessionPerformance(trades: Trade[]): SessionPerformance[] {
  const sessions = [
    { name: "Asia (00-08 UTC)", start: 0, end: 8 },
    { name: "Europe (08-16 UTC)", start: 8, end: 16 },
    { name: "US (16-24 UTC)", start: 16, end: 24 },
  ];

  return sessions.map(s => {
    const sTrades = trades.filter(t => {
      const h = new Date(t.entryTime).getUTCHours();
      return h >= s.start && h < s.end;
    });
    return {
      session: s.name,
      trades: sTrades.length,
      winRate: Math.round((sTrades.filter(t => t.status === "win").length / (sTrades.length || 1)) * 10000) / 100,
      pnl: Math.round(sTrades.reduce((sum, t) => sum + t.pnl, 0) * 100) / 100,
    };
  });
}

export function computeOrderTypePerformance(trades: Trade[]) {
  const types = ["market", "limit", "stop-market", "stop-limit"] as const;
  return types.map(type => {
    const t = trades.filter(tr => tr.orderType === type);
    return {
      type,
      trades: t.length,
      winRate: Math.round((t.filter(tr => tr.status === "win").length / (t.length || 1)) * 10000) / 100,
      pnl: Math.round(t.reduce((s, tr) => s + tr.pnl, 0) * 100) / 100,
      avgPnl: Math.round((t.reduce((s, tr) => s + tr.pnl, 0) / (t.length || 1)) * 100) / 100,
    };
  });
}
