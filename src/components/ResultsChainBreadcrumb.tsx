import { cn } from 'cn'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RESULT_LEVELS } from '@/types/enums'
import type { Indicator } from '@/types/indicator'

interface ResultsChainBreadcrumbProps {
  /** Every indicator in the current indicator's Domain, any result level. */
  indicatorsInDomain: Indicator[]
  currentIndicatorId: string
}

/** FR-IT-3: navigate an indicator's Domain from Activity up to the Goal it feeds. */
export function ResultsChainBreadcrumb({
  indicatorsInDomain,
  currentIndicatorId,
}: ResultsChainBreadcrumbProps) {
  const navigate = useNavigate()

  return (
    <nav aria-label="Results chain" className="flex flex-wrap items-center gap-1 text-sm">
      {RESULT_LEVELS.map((level, index) => {
        const atLevel = indicatorsInDomain.filter((indicator) => indicator.resultLevel === level)
        const isCurrent = atLevel.some((indicator) => indicator.id === currentIndicatorId)

        return (
          <Fragment key={level}>
            {index > 0 && <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={atLevel.length === 0}
                  className={cn(
                    'rounded-md px-2 py-1 transition-colors',
                    isCurrent
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                    atLevel.length === 0 && 'cursor-not-allowed opacity-40',
                  )}
                >
                  {level} <span className="text-xs opacity-80">({atLevel.length})</span>
                </button>
              </PopoverTrigger>
              {atLevel.length > 0 && (
                <PopoverContent className="w-72" align="start">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{level} indicators</p>
                  <ul className="space-y-1">
                    {atLevel.map((indicator) => (
                      <li key={indicator.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/indicators/${indicator.id}`)}
                          className={cn(
                            'w-full rounded px-2 py-1 text-left text-sm hover:bg-muted',
                            indicator.id === currentIndicatorId && 'font-medium',
                          )}
                        >
                          <span className="font-mono text-xs text-muted-foreground">
                            {indicator.indicatorCode}
                          </span>{' '}
                          {indicator.indicatorText}
                        </button>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              )}
            </Popover>
          </Fragment>
        )
      })}
    </nav>
  )
}
