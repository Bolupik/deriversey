import { FeeBreakdown } from "@/types/trading";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface FeeChartProps {
  data: FeeBreakdown[];
  totalFees: number;
}

const COLORS = ["hsl(187, 80%, 48%)", "hsl(260, 60%, 55%)", "hsl(38, 92%, 50%)"];

export function FeeChart({ data, totalFees }: FeeChartProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">Fee Breakdown</h3>
      <div className="flex items-center gap-6">
        <div className="h-[160px] w-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="amount"
                nameKey="type"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 10%)",
                  border: "1px solid hsl(220, 14%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 92%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          <div className="text-center mb-3">
            <p className="text-xs text-muted-foreground">Total Fees</p>
            <p className="text-lg font-mono font-semibold text-loss">${totalFees.toLocaleString()}</p>
          </div>
          {data.map((item, i) => (
            <div key={item.type} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground">{item.type}</span>
              </div>
              <span className="font-mono text-foreground">${item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
