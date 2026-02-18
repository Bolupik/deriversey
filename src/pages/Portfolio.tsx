import { PortfolioPanel } from "@/components/dashboard/PortfolioPanel";
import { TradingViewChart } from "@/components/dashboard/TradingViewChart";
import { useState } from "react";
import { Briefcase } from "lucide-react";

const CHART_TOKENS = ["SOL", "BTC", "ETH", "JUP", "BONK", "WIF", "RAY"];

export default function Portfolio() {
  const [chartSymbol, setChartSymbol] = useState("SOL");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Briefcase className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Portfolio</h2>
          <p className="text-xs text-muted-foreground">Your wallet holdings & price charts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Token selector */}
          <div className="flex items-center gap-1 flex-wrap">
            {CHART_TOKENS.map((t) => (
              <button
                key={t}
                onClick={() => setChartSymbol(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  chartSymbol === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <TradingViewChart symbol={chartSymbol} />
        </div>

        <PortfolioPanel />
      </div>
    </div>
  );
}
