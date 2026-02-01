import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface UtilizationData {
  month: string;
  onProject: number;
  bench: number;
}

interface BenchUtilizationChartProps {
  data: UtilizationData[];
}

export function BenchUtilizationChart({ data }: BenchUtilizationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={0}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "var(--shadow-lg)",
          }}
        />
        <Legend iconType="circle" iconSize={8} />
        <Bar
          dataKey="onProject"
          name="On Project"
          fill="hsl(221 83% 53%)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="bench"
          name="Bench"
          fill="hsl(173 58% 39%)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}