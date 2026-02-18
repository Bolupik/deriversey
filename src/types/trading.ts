export type TradeSide = "long" | "short";
export type OrderType = "market" | "limit" | "stop-market" | "stop-limit";
export type TradeStatus = "win" | "loss";

export interface Trade {
  id: string;
  symbol: string;
  side: TradeSide;
  orderType: OrderType;
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  entryTime: string;
  exitTime: string;
  duration: number; // minutes
  status: TradeStatus;
  note?: string;
}

export interface DailyPnl {
  date: string;
  pnl: number;
  cumPnl: number;
  drawdown: number;
  trades: number;
  volume: number;
}

export interface FeeBreakdown {
  type: string;
  amount: number;
  percentage: number;
}

export interface SymbolPerformance {
  symbol: string;
  trades: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  volume: number;
}

export interface SessionPerformance {
  session: string;
  trades: number;
  winRate: number;
  pnl: number;
}

export interface PortfolioStats {
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  totalTrades: number;
  totalVolume: number;
  totalFees: number;
  avgDuration: number;
  longRatio: number;
  shortRatio: number;
  largestGain: number;
  largestLoss: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}
