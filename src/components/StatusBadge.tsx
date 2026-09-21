import { Badge } from '@/components/ui/badge'

// Status colors never carry meaning alone (dataviz skill, status palette
// rule): a colored dot plus a plain-ink label, never a fully colored badge.
const STATUS_CONFIG: Record<string, { label: string; dotColor: string }> = {
  Pending: { label: 'Pending', dotColor: 'var(--viz-muted-ink)' },
  Ready: { label: 'Ready', dotColor: 'var(--viz-status-good)' },
  Aspirational: { label: 'Aspirational', dotColor: 'var(--viz-status-warning)' },
  draft: { label: 'Draft', dotColor: 'var(--viz-muted-ink)' },
  submitted: { label: 'Submitted', dotColor: 'var(--viz-status-warning)' },
  approved: { label: 'Approved', dotColor: 'var(--viz-status-good)' },
  rejected: { label: 'Rejected', dotColor: 'var(--viz-status-critical)' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, dotColor: 'var(--viz-muted-ink)' }
  return (
    <Badge variant="outline" className={`gap-1.5 font-normal ${className ?? ''}`}>
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: config.dotColor }}
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  )
}
