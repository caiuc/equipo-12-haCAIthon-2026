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

/** Recharts reads SVG attributes, so the font has to be named, not classed. */
const SCORE_FONT = "var(--font-score), monospace";

interface PixelDotProps {
  /** Injected by Recharts. */
  cx?: number;
  cy?: number;
  /**
   * Deliberately not called `fill`: Recharts clones this element with the
   * Area's own `fill` (a gradient url), which would overwrite that prop.
   */
  markColor: string;
  size?: number;
}

/** Square, ink-outlined marker — a round dot reads as the wrong toolkit here. */
function PixelDot({ cx, cy, markColor, size = 9 }: PixelDotProps) {
  if (cx == null || cy == null) return null;
  return (
    <rect
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      fill={markColor}
      stroke={chartChrome.surface}
      strokeWidth={2.5}
      shapeRendering="crispEdges"
    />
  );
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
  // Square markers are 9px; past roughly this many points they start to merge
  // into the line, and the line alone carries the shape better.
  const showDots = data.length <= 14;

  return (
    <figure className="pixel pixel-white m-0 p-5">
      <figcaption>
        <h3 className="font-pixel text-[11px] uppercase leading-[1.5] text-ink">{title}</h3>
        {subtitle ? (
          <p className="mt-2 text-xs font-semibold leading-snug text-ink-muted">{subtitle}</p>
        ) : null}
      </figcaption>

      {/*
       * Legend for two or more series only. With a single series the title
       * already names what is plotted, so a one-swatch box just repeats it.
       * Each entry carries its final value — a selective direct label that
       * cannot collide with the marks the way end-of-line labels would.
       */}
      {series.length > 1 ? (
        <ul className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2 p-0">
          {series.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-xs">
              {/* Square swatch with an ink outline — the chart's marks match. */}
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 border-2 border-line"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-bold text-ink-secondary">{item.label}</span>
              {last ? (
                <span className="font-score text-base leading-none tabular-nums text-ink">
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
                  <stop offset="0%" stopColor={item.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={item.color} stopOpacity={0.04} />
                </linearGradient>
              ))}
            </defs>

            {/* Dotted rather than solid: on a grid this fine it reads as
                graph paper instead of a second set of marks. */}
            <CartesianGrid
              vertical={false}
              stroke={chartChrome.grid}
              strokeWidth={2}
              strokeDasharray="2 4"
            />

            <XAxis
              dataKey={xKey}
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={data.map((point) => point[xKey])}
              tickFormatter={formatX}
              tickLine={false}
              axisLine={{ stroke: chartChrome.axis, strokeWidth: 2 }}
              tick={{ fill: chartChrome.axisText, fontSize: 15, fontFamily: SCORE_FONT }}
              tickMargin={8}
            />

            <YAxis
              tickFormatter={formatTick}
              tickLine={false}
              axisLine={false}
              tick={{ fill: chartChrome.axisText, fontSize: 15, fontFamily: SCORE_FONT }}
              width={58}
            />

            <Tooltip
              cursor={{ stroke: chartChrome.axis, strokeWidth: 2, strokeDasharray: "3 3" }}
              content={
                <ChartTooltip
                  series={series}
                  xLabel={xLabel}
                  formatX={formatX}
                  formatValue={formatValue}
                />
              }
            />

            {/*
             * `linear` rather than `monotone`: straight segments and hard
             * corners belong to this skin, and the underlying series are
             * sampled per month or per year anyway — a smoothed curve would
             * invent readings between them.
             */}
            {series.map((item) => (
              <Area
                key={item.key}
                type="linear"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={3}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                fill={`url(#${gradientId}-${item.key})`}
                dot={showDots ? <PixelDot markColor={item.color} /> : false}
                activeDot={<PixelDot markColor={item.color} size={14} />}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-4 border-t-4 border-line pt-3.5">
        <summary className="cursor-pointer font-pixel text-[9px] uppercase leading-none text-ink-secondary hover:text-accent-strong">
          Ver datos
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-ink-muted">
                <th scope="col" className="py-1.5 pr-4 text-[10px] font-extrabold uppercase tracking-wide">
                  {xLabel}
                </th>
                {series.map((item) => (
                  <th
                    key={item.key}
                    scope="col"
                    className="py-1.5 pr-4 text-[10px] font-extrabold uppercase tracking-wide"
                  >
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-score text-base text-ink">
              {data.map((point) => (
                <tr key={point[xKey]} className="border-t-2 border-grid">
                  <th scope="row" className="py-1 pr-4 font-normal tabular-nums">
                    {formatX(point[xKey])}
                  </th>
                  {series.map((item) => (
                    <td key={item.key} className="py-1 pr-4 tabular-nums">
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
    <div className="pixel pixel-sm pixel-white px-3 py-2">
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
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
                className="h-3 w-3 shrink-0 border-2 border-line"
                style={{ backgroundColor: match.color }}
              />
              <span className="font-bold text-ink-secondary">{match.label}</span>
              <span className="ml-auto pl-2 font-score text-base leading-none tabular-nums text-ink">
                {formatValue(entry.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
