import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Baseline } from '@/types/baseline'
import type { DataPoint } from '@/types/datapoint'
import type { Target } from '@/types/target'

interface TargetVsActualChartProps {
  dataPoints: DataPoint[]
  baseline: Baseline
  targets: Target[]
}

interface ChartPoint {
  period: string
  value: number
}

function pickNearestTarget(targets: Target[]): Target | undefined {
  const numeric = targets.filter((target) => target.numericValue !== undefined)
  if (numeric.length === 0) return undefined
  const currentYear = new Date().getFullYear()
  const upcoming = numeric
    .filter((target) => Number.parseInt(target.period, 10) >= currentYear)
    .sort((a, b) => a.period.localeCompare(b.period))
  return upcoming[0] ?? numeric[numeric.length - 1]
}

function achievementStatus(pct: number): { color: string; label: string } {
  if (pct >= 90) return { color: 'var(--viz-status-good)', label: 'On track' }
  if (pct >= 60) return { color: 'var(--viz-status-warning)', label: 'At risk' }
  return { color: 'var(--viz-status-critical)', label: 'Off track' }
}

function StatTile({ label, value, statusColor }: { label: string; value: string; statusColor?: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold">
        {statusColor && (
          <span className="size-2 rounded-full" style={{ backgroundColor: statusColor }} aria-hidden="true" />
        )}
        {value}
      </p>
    </div>
  )
}

/** FR-IT-5/6: target-vs-actual and trend, computed client-side from one indicator's own history (not a dashboard rollup). */
export function TargetVsActualChart({ dataPoints, baseline, targets }: TargetVsActualChartProps) {
  const chartData: ChartPoint[] = dataPoints
    .filter((dp) => dp.status !== 'draft' && dp.status !== 'rejected' && dp.value.numericValue !== undefined)
    .map((dp) => ({ period: dp.period, value: dp.value.numericValue as number }))
    .sort((a, b) => a.period.localeCompare(b.period))

  const canChart = baseline.valueType !== 'narrative' && chartData.length > 0
  const nearestTarget = pickNearestTarget(targets)
  const latest = chartData[chartData.length - 1]

  if (!canChart) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        {baseline.valueType === 'narrative' || baseline.valueType === 'notYetTracked'
          ? 'This indicator is tracked narratively — see the reported comments below.'
          : 'No reported values yet for this indicator.'}
      </div>
    )
  }

  const achievementPct =
    latest && nearestTarget?.numericValue ? Math.round((latest.value / nearestTarget.numericValue) * 100) : undefined

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Latest reported value" value={latest ? String(latest.value) : '—'} />
        {baseline.numericValue !== undefined && (
          <StatTile label="Baseline" value={String(baseline.numericValue)} />
        )}
        {achievementPct !== undefined && (
          <StatTile
            label={`% of ${nearestTarget!.period} target`}
            value={`${achievementPct}%`}
            statusColor={achievementStatus(achievementPct).color}
          />
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 24, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--viz-gridline)" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: 'var(--viz-muted-ink)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--viz-baseline-axis)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--viz-muted-ink)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            {baseline.numericValue !== undefined && (
              <ReferenceLine
                y={baseline.numericValue}
                stroke="var(--viz-baseline-axis)"
                strokeDasharray="4 4"
                label={{ value: 'Baseline', position: 'insideBottomLeft', fill: 'var(--viz-muted-ink)', fontSize: 11 }}
              />
            )}
            {nearestTarget?.numericValue !== undefined && (
              <ReferenceLine
                y={nearestTarget.numericValue}
                stroke="var(--viz-muted-ink)"
                strokeDasharray="2 6"
                label={{
                  value: `${nearestTarget.period} target`,
                  position: 'insideTopLeft',
                  fill: 'var(--viz-muted-ink)',
                  fontSize: 11,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--viz-series-1)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--viz-series-1)', stroke: 'var(--card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {latest && (
              <ReferenceDot
                x={latest.period}
                y={latest.value}
                r={0}
                label={{ value: String(latest.value), position: 'top', fill: 'var(--foreground)', fontSize: 12 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
