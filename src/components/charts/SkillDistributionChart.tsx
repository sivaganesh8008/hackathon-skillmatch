import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SkillCategory {
  name: string;
  value: number;
  color: string;
}

interface SkillDistributionChartProps {
  data: SkillCategory[];
}

const COLORS = [
  "hsl(221 83% 53%)", // primary blue
  "hsl(173 58% 39%)", // accent teal
  "hsl(142 71% 45%)", // success green
  "hsl(38 92% 50%)",  // warning amber
  "hsl(280 67% 53%)", // purple
  "hsl(350 80% 55%)", // rose
];

export function SkillDistributionChart({ data }: SkillDistributionChartProps) {
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "var(--shadow-lg)",
          }}
          formatter={(value: number) => [`${value} employees`, ""]}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            paddingLeft: "20px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}