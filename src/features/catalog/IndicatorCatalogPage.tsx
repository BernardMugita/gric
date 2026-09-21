import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/stores/catalogStore'
import { FilterBar } from './components/FilterBar'
import { IndicatorTable } from './components/IndicatorTable'
import { CATALOG_PAGE_SIZE, useIndicatorList, useProgrammes } from './hooks/useIndicators'

export function IndicatorCatalogPage() {
  const filters = useCatalogStore((state) => state.filters)
  const page = useCatalogStore((state) => state.page)
  const setPage = useCatalogStore((state) => state.setPage)

  const programmesQuery = useProgrammes()
  const indicatorsQuery = useIndicatorList({ ...filters, page, pageSize: CATALOG_PAGE_SIZE })

  const programmeNames = useMemo(
    () => Object.fromEntries((programmesQuery.data?.data ?? []).map((p) => [p.id, p.name])),
    [programmesQuery.data],
  )

  const total = indicatorsQuery.data?.meta.total ?? 0
  const hasMore = indicatorsQuery.data?.meta.hasMore ?? false
  const rangeStart = total === 0 ? 0 : (page - 1) * CATALOG_PAGE_SIZE + 1
  const rangeEnd = Math.min(page * CATALOG_PAGE_SIZE, total)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Indicator Catalog</h1>
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `${total} indicators` : 'Browse indicators'} across all 7 programmes.
        </p>
      </div>

      <FilterBar />

      <div className="rounded-md border">
        <IndicatorTable
          indicators={indicatorsQuery.data?.data ?? []}
          programmeNames={programmeNames}
          isLoading={indicatorsQuery.isLoading}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total > 0 ? `Showing ${rangeStart}–${rangeEnd} of ${total}` : ''}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
