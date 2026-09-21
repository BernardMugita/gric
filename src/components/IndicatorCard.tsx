import type { Indicator } from '@/types/indicator'
import { StatusBadge } from './StatusBadge'

interface IndicatorCardProps {
  indicator: Indicator
  onClick?: () => void
}

export function IndicatorCard({ indicator, onClick }: IndicatorCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">{indicator.indicatorCode}</span>
        <StatusBadge status={indicator.status} />
      </div>
      <p className="mt-1 font-medium">{indicator.indicatorText}</p>
      <p className="text-xs text-muted-foreground">{indicator.resultLevel}</p>
    </button>
  )
}
