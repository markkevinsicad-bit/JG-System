"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { expenseByCategoryDemo, expensesOverTimeDemo } from "@/lib/demo-data";
import { formatPHP } from "@/lib/utils";

export function ExpensesOverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={expensesOverTimeDemo}>
        <defs>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f5fd6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#1f5fd6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value) => [formatPHP(Number(value)), "Expenses"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#1f5fd6"
          strokeWidth={2.5}
          fill="url(#expenseFill)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ExpenseByCategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={expenseByCategoryDemo}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={92}
          paddingAngle={2}
          animationDuration={900}
        >
          {expenseByCategoryDemo.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatPHP(Number(value))} />
        <Legend
          iconType="circle"
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: 12, color: "#374151" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
