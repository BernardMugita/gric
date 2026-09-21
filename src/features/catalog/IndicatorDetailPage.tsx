import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listCountries } from '@/api/countries'
import { listDisaggregationDimensions } from '@/api/disaggregationDimensions'
import { queryKeys } from '@/api/queryKeys'
import { IndicatorCard } from '@/components/IndicatorCard'
import { ResultsChainBreadcrumb } from '@/components/ResultsChainBreadcrumb'
import { StatusBadge } from '@/components/StatusBadge'
import { TargetVsActualChart } from '@/components/TargetVsActualChart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useScopedPermissions } from '@/hooks/useScopedPermissions'
import { ROLE_LABELS, type RoleId } from '@/types/enums'
import { formatIndicatorValue } from '@/utils/formatValue'
import { DataPointHistoryTable } from './components/DataPointHistoryTable'
import { ReviseBaselineDialog } from './components/ReviseBaselineDialog'
import {
  useConvergenceGroup,
  useIndicator,
  useIndicatorDataPoints,
  useIndicatorsInDomain,
} from './hooks/useIndicatorDetail'

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

export function IndicatorDetailPage() {
  const { indicatorId = '' } = useParams()
  const navigate = useNavigate()

  const { hasPermission } = useScopedPermissions()
  const indicatorQuery = useIndicator(indicatorId)
  const dataPointsQuery = useIndicatorDataPoints(indicatorId)
  const indicator = indicatorQuery.data?.data

  const domainIndicatorsQuery = useIndicatorsInDomain(indicator?.domainId)
  const convergenceQuery = useConvergenceGroup(indicator?.convergenceGroupId)
  const countriesQuery = useQuery({ queryKey: queryKeys.countries.all, queryFn: listCountries })
  const dimensionsQuery = useQuery({
    queryKey: queryKeys.disaggregationDimensions.all,
    queryFn: listDisaggregationDimensions,
  })

  const countryNames = useMemo(
    () => Object.fromEntries((countriesQuery.data?.data ?? []).map((c) => [c.id, c.name])),
    [countriesQuery.data],
  )
  const dimensionNames = useMemo(
    () => Object.fromEntries((dimensionsQuery.data?.data ?? []).map((d) => [d.id, d.name])),
    [dimensionsQuery.data],
  )

  if (indicatorQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (indicatorQuery.isError || !indicator) {
    return <p className="text-sm text-destructive">Indicator not found.</p>
  }

  const convergenceSiblings = (convergenceQuery.data?.data ?? []).filter((i) => i.id !== indicator.id)

  return (
    <div className="space-y-6">
      <Link to="/indicators" className="text-sm text-muted-foreground hover:underline">
        ← Indicator Catalog
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{indicator.indicatorCode}</p>
          <h1 className="font-heading text-xl font-semibold">{indicator.indicatorText}</h1>
          <p className="text-sm text-muted-foreground">{indicator.resultStatement}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={indicator.status} />
          {hasPermission('datapoint:enter') && (
            <>
              <Button asChild size="sm" variant="outline">
                <Link to={`/indicators/${indicator.id}/bulk-entry`}>Bulk entry</Link>
              </Button>
              <Button asChild size="sm">
                <Link to={`/indicators/${indicator.id}/data-entry`}>Enter data</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {domainIndicatorsQuery.data && (
        <ResultsChainBreadcrumb
          indicatorsInDomain={domainIndicatorsQuery.data.data}
          currentIndicatorId={indicator.id}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trend & target</CardTitle>
            <CardDescription>{indicator.monitoringQuestion}</CardDescription>
          </CardHeader>
          <CardContent>
            <TargetVsActualChart
              dataPoints={dataPointsQuery.data?.data ?? []}
              baseline={indicator.baseline}
              targets={indicator.targets}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Definition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DefinitionRow label="Data source" value={indicator.dataSource} />
            <DefinitionRow
              label="Frequency"
              value={
                indicator.frequency.cadenceRule
                  ? `${indicator.frequency.label} — ${indicator.frequency.cadenceRule}`
                  : indicator.frequency.label
              }
            />
            <DefinitionRow label="Sphere of accountability" value={indicator.sphereOfAccountability} />
            <DefinitionRow label="Gender integration level" value={indicator.genderIntegrationLevel} />
            <DefinitionRow
              label="Responsible role"
              value={ROLE_LABELS[indicator.responsibleRoleId as RoleId] ?? indicator.responsibleRoleId}
            />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Disaggregation</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {indicator.disaggregationDims.length === 0 ? (
                  <span className="text-sm text-muted-foreground">None</span>
                ) : (
                  indicator.disaggregationDims.map((dimId) => (
                    <Badge key={dimId} variant="outline">
                      {dimensionNames[dimId] ?? dimId}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            {indicator.evidenceRequired && <Badge variant="secondary">Evidence required</Badge>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Baseline & targets</CardTitle>
          <ReviseBaselineDialog indicator={indicator} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DefinitionRow
            label={`Baseline (as of ${indicator.baseline.asOfDate})`}
            value={formatIndicatorValue(indicator.baseline)}
          />
          {indicator.targets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No targets set.</p>
          ) : (
            indicator.targets.map((target) => (
              <DefinitionRow key={target.id} label={`${target.period} target`} value={formatIndicatorValue(target)} />
            ))
          )}
        </CardContent>
      </Card>

      {convergenceSiblings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Shares this Goal with</CardTitle>
            <CardDescription>
              Convergence indicators feeding the same Goal across programmes/domains — rolled up together, never
              double-counted (FR-IT-4).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {convergenceSiblings.map((sibling) => (
              <IndicatorCard key={sibling.id} indicator={sibling} onClick={() => navigate(`/indicators/${sibling.id}`)} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reported history</CardTitle>
        </CardHeader>
        <CardContent>
          <DataPointHistoryTable
            dataPoints={dataPointsQuery.data?.data ?? []}
            countryNames={countryNames}
            isLoading={dataPointsQuery.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
