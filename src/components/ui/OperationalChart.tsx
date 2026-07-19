"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from "recharts";

export interface ChartSeries {
  key: string;
  color: string;
  name?: string;
}

interface OperationalChartProps {
  type: "bar" | "area";
  data: Array<unknown>;
  xKey: string;
  series: ChartSeries[];
  height?: number;
  ariaLabel: string;
  stacked?: boolean;
  layout?: "horizontal" | "vertical";
}

export function OperationalChart({
  type,
  data,
  xKey,
  series,
  height = 200,
  ariaLabel,
  stacked = false,
  layout = "horizontal"
}: OperationalChartProps) {
  const isVertical = layout === "vertical";

  const chartProps = {
    data,
    layout: layout,
    margin: isVertical
      ? { top: 10, right: 10, left: 10, bottom: 0 }
      : { top: 10, right: 10, left: -20, bottom: 0 }
  };

  const renderTooltip = () => (
    <Tooltip
      contentStyle={{
        backgroundColor: "hsl(var(--surface-3))",
        borderColor: "hsl(var(--border))",
        borderRadius: "var(--radius-sm)",
        color: "white",
        fontSize: "0.75rem",
      }}
      itemStyle={{ color: "white" }}
      labelStyle={{ color: "hsl(var(--foreground-muted))" }}
    />
  );

  const renderGrid = () => (
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={!isVertical} horizontal={isVertical} />
  );

  const renderXAxis = () => (
    <XAxis
      type={isVertical ? "number" : undefined}
      dataKey={isVertical ? undefined : xKey}
      stroke="rgba(255,255,255,0.3)"
      fontSize={10}
      tickLine={false}
      axisLine={false}
    />
  );

  const renderYAxis = () => (
    <YAxis
      type={isVertical ? "category" : undefined}
      dataKey={isVertical ? xKey : undefined}
      stroke="rgba(255,255,255,0.3)"
      fontSize={10}
      tickLine={false}
      axisLine={false}
      width={isVertical ? 80 : undefined}
    />
  );

  return (
    <ResponsiveContainer width="100%" height={height} role="img" aria-label={ariaLabel}>
      {type === "bar" ? (
        <BarChart {...chartProps}>
          {renderGrid()}
          {renderXAxis()}
          {renderYAxis()}
          {renderTooltip()}
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name || s.key}
              radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
            >
              {data.map((entry, idx) => {
                const item = entry as Record<string, unknown>;
                const fillVal = (item && typeof item === "object" && typeof item.fill === "string" ? item.fill : undefined) || s.color;
                return <Cell key={`cell-${idx}`} fill={fillVal} />;
              })}
            </Bar>
          ))}
        </BarChart>
      ) : (
        <AreaChart {...chartProps}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {renderGrid()}
          {renderXAxis()}
          {renderYAxis()}
          {renderTooltip()}
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color}
              fill={`url(#grad-${s.key})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}
