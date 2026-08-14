"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartChrome } from "@/lib/theme";
import type { ChartPoint, ChartSeries } from "@/lib/types";

interface ChartViewerProps {
  data: ChartPoint[];
  series: ChartSeries[];
  /** Field in each ChartPoint holding the x value. */
  xKey: string;
  /** Header for the x column in the data table. */
  xLabel: string;
  formatX: (value: number) => string;
  /** Full-precision formatter, used in the tooltip, legend and table. */
  formatValue: (value: number) => string;
  /** Short formatter for axis ticks, where full numbers do not fit. */
  formatTick: (value: number) => string;
  title: string;
  subtitle?: string;
  height?: number;
}

export function ChartViewer({
  data,
  series,
  xKey,
  xLabel,
  formatX,
  formatValue,
  formatTick,
  title,
  subtitle,
  height = 300,
}: ChartViewerProps) {
  const gradientId = useId();
  const last = data[data.length - 1];

  return (
    <figure className="m-0 rounded-card border border-line bg-surface p-5 shadow-card">
      <figcaption>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p> : null}
      </figcaption>

      {/*
       * Legend for two or more series only. With a single series the title
       * already names what is plotted, so a one-swatch box just repeats it.
       * Each entry carries its final value — a selective direct label that
       * cannot collide with the marks the way end-of-line labels would.
       */}
      {series.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 p-0">
          {series.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-ink-secondary">{item.label}</span>
              {last ? (
                <span className="font-semibold tabular-nums text-ink">
                  {formatValue(last[item.key])}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div
        className="mt-3 w-full"
        style={{ height }}
        role="img"
        aria-label={`${title}. Los valores exactos están en la tabla "Ver datos" bajo el gráfico.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <defs>
              {series.map((item) => (
                <linearGradient
                  key={item.key}
                  id={`${gradientId}-${item.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={item.color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={item.color} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              vertical={false}
              stroke={chartChrome.grid}
              strokeWidth={1}
            />

            <XAxis
              dataKey={xKey}
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={data.map((point) => point[xKey])}
              tickFormatter={formatX}
              tickLine={false}
              axisLine={{ stroke: chartChrome.axis }}
              tick={{ fill: chartChrome.axisText, fontSize: 12 }}
              tickMargin={8}
            />

            <YAxis
              tickFormatter={formatTick}
              tickLine={false}
              axisLine={false}
              tick={{ fill: chartChrome.axisText, fontSize: 12 }}
              width={58}
            />

            <Tooltip
              cursor={{ stroke: chartChrome.axis, strokeWidth: 1 }}
              content={
                <ChartTooltip
                  series={series}
                  xLabel={xLabel}
                  formatX={formatX}
                  formatValue={formatValue}
                />
              }
            />

            {series.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`url(#${gradientId}-${item.key})`}
                dot={{ r: 4, fill: item.color, stroke: chartChrome.surface, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: item.color, stroke: chartChrome.surface, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3 border-t border-line pt-3">
        <summary className="cursor-pointer text-xs font-medium text-ink-secondary hover:text-ink">
          Ver datos
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-ink-muted">
                <th scope="col" className="py-1.5 pr-4 font-medium">
                  {xLabel}
                </th>
                {series.map((item) => (
                  <th key={item.key} scope="col" className="py-1.5 pr-4 font-medium">
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-ink">
              {data.map((point) => (
                <tr key={point[xKey]} className="border-t border-line">
                  <th scope="row" className="py-1.5 pr-4 font-normal tabular-nums">
                    {formatX(point[xKey])}
                  </th>
                  {series.map((item) => (
                    <td key={item.key} className="py-1.5 pr-4 tabular-nums">
                      {formatValue(point[item.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

interface TooltipEntry {
  dataKey?: string | number;
  value?: number;
}

interface ChartTooltipProps {
  series: ChartSeries[];
  xLabel: string;
  formatX: (value: number) => string;
  formatValue: (value: number) => string;
  /** Injected by Recharts. */
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number | string;
}

function ChartTooltip({
  series,
  xLabel,
  formatX,
  formatValue,
  active,
  payload,
  label,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-raised">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
        {xLabel} {typeof label === "number" ? formatX(label) : label}
      </p>
      <ul className="mt-1.5 space-y-1 p-0">
        {payload.map((entry) => {
          const match = series.find((item) => item.key === entry.dataKey);
          if (!match || entry.value == null) return null;
          return (
            <li key={match.key} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: match.color }}
              />
              <span className="text-ink-secondary">{match.label}</span>
              <span className="ml-auto font-semibold tabular-nums text-ink">
                {formatValue(entry.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
