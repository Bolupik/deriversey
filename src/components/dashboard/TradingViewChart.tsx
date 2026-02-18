import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";

interface TradingViewChartProps {
  symbol?: string;
}

const SYMBOL_MAP: Record<string, string> = {
  SOL: "solana",
  BTC: "bitcoin",
  ETH: "ethereum",
  JUP: "jupiter-exchange-solana",
  BONK: "bonk",
  WIF: "dogwifcoin",
  RAY: "raydium",
};

async function fetchOHLC(coinId: string, days = 30) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
  );
  if (!res.ok) throw new Error("Failed to fetch OHLC");
  const data = await res.json();
  return data.map((d: number[]) => ({
    time: Math.floor(d[0] / 1000) as any,
    open: d[1],
    high: d[2],
    low: d[3],
    close: d[4],
  }));
}

export function TradingViewChart({ symbol = "SOL" }: TradingViewChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApi = useRef<IChartApi | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "hsl(215, 14%, 45%)",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "hsl(225, 16%, 13%)" },
        horzLines: { color: "hsl(225, 16%, 13%)" },
      },
      crosshair: {
        vertLine: { color: "hsl(162, 85%, 45%)", width: 1, style: 2 },
        horzLine: { color: "hsl(162, 85%, 45%)", width: 1, style: 2 },
      },
      timeScale: {
        borderColor: "hsl(225, 16%, 14%)",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "hsl(225, 16%, 14%)",
      },
      handleScale: { axisPressedMouseMove: true },
      handleScroll: { vertTouchDrag: false },
    });

    chartApi.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "hsl(162, 85%, 45%)",
      downColor: "hsl(0, 72%, 55%)",
      borderUpColor: "hsl(162, 85%, 45%)",
      borderDownColor: "hsl(0, 72%, 55%)",
      wickUpColor: "hsl(162, 85%, 55%)",
      wickDownColor: "hsl(0, 72%, 65%)",
    });

    const coinId = SYMBOL_MAP[symbol] || "solana";
    setLoading(true);
    setError("");

    fetchOHLC(coinId, days)
      .then((data) => {
        candleSeries.setData(data);
        chart.timeScale().fitContent();
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        chart.applyOptions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol, days]);

  const timeframes = [
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
    { label: "1Y", value: 365 },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">
          {symbol}/USD Chart
        </h3>
        <div className="flex gap-1 rounded-md bg-muted p-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setDays(tf.value)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors ${
                days === tf.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[320px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        )}
        <div ref={chartRef} className="w-full h-full" />
      </div>
    </div>
  );
}
