import { useState, useMemo } from "react";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { useWallet } from "@solana/wallet-adapter-react";
import { TradeTable } from "@/components/dashboard/TradeTable";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { TradingViewChart } from "@/components/dashboard/TradingViewChart";
import { BookOpen, Wallet } from "lucide-react";
import { motion } from "framer-motion";

export default function Journal() {
  const { connected } = useWallet();
  const { data: trades = [], isLoading } = useDeriverseData();
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-overline mb-2">Deriverse Trade Log</p>
        <h1 className="text-massive">Journal</h1>
        <p className="text-sm text-muted-foreground mt-2 font-mono">
          On-chain trade history from Deriverse DEX
        </p>
      </motion.div>

      <div className="border-b border-border/30" />

      {!connected ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-massive mb-4">Connect Wallet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Connect your Solana wallet to view your Deriverse trading history and analytics.
            </p>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="grid grid-cols-1 gap-5">
            <TradingViewChart symbol={chartSymbol} />
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
          ) : trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Deriverse trades found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                No trades from the Deriverse program were found for this wallet on devnet. Make sure you've traded on{" "}
                <a href="https://alpha.deriverse.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  alpha.deriverse.io
                </a>
              </p>
            </div>
          ) : (
            <TradeTable trades={filtered} />
          )}
        </>
      )}
    </div>
  );
}
