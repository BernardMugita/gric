import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/client'
import { listCountries } from '@/api/countries'
import { listDisaggregationDimensions } from '@/api/disaggregationDimensions'
import { queryKeys } from '@/api/queryKeys'
import { PeriodPicker } from '@/components/PeriodPicker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useScopedPermissions } from '@/hooks/useScopedPermissions'
import type { DisaggregationSlice } from '@/types/disaggregation'
import { generateIdempotencyKey } from '@/utils/idempotency'
import { useIndicator } from '../catalog/hooks/useIndicatorDetail'
import { useSubmitDataPoint } from './hooks/useSubmitDataPoint'
import { getIndicatorValueType } from './lib/valueType'

interface Row {
  localId: string
  countryId: string
  dimValues: Record<string, string | undefined>
  value: number | undefined
  narrativeValue: string
  comment: string
}

function emptyRow(): Row {
  return { localId: generateIdempotencyKey(), countryId: '', dimValues: {}, value: undefined, narrativeValue: '', comment: '' }
}

function cleanSlice(values: Record<string, string | undefined>): DisaggregationSlice {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as DisaggregationSlice
}

/** FR-DC-4: tabular multi-row entry submitted in one batch request (FR-API-9), not N separate ones. */
export function BulkEntryGridPage() {
  const { indicatorId = '' } = useParams()
  const navigate = useNavigate()

  const indicatorQuery = useIndicator(indicatorId)
  const indicator = indicatorQuery.data?.data
  const countriesQuery = useQuery({ queryKey: queryKeys.countries.all, queryFn: listCountries })
  const dimensionsQuery = useQuery({
    queryKey: queryKeys.disaggregationDimensions.all,
    queryFn: listDisaggregationDimensions,
  })
  const { canActOnCountry } = useScopedPermissions()
  const { submitBatch, online } = useSubmitDataPoint(indicatorId)

  const [period, setPeriod] = useState('')
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (indicatorQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!indicator) {
    return <p className="text-sm text-destructive">Indicator not found.</p>
  }

  const valueType = getIndicatorValueType(indicator)
  const dimIds = indicator.disaggregationDims.filter((id) => id !== 'dim_country')
  const dimensions = dimensionsQuery.data?.data ?? []
  const availableCountries = (countriesQuery.data?.data ?? []).filter((country) => canActOnCountry(country.id))

  function updateRow(localId: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((row) => (row.localId === localId ? { ...row, ...patch } : row)))
  }

  function removeRow(localId: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.localId !== localId) : prev))
  }

  async function handleSubmitAll() {
    setFormError(null)
    if (!period) {
      setFormError('Period is required.')
      return
    }
    const completeRows = rows.filter(
      (row) => row.countryId && (valueType === 'narrative' ? row.narrativeValue.trim() : row.value !== undefined),
    )
    if (completeRows.length === 0) {
      setFormError('Add at least one complete row (country + value).')
      return
    }

    setSubmitting(true)
    try {
      const items = completeRows.map((row) => ({
        indicatorId: indicator!.id,
        period,
        countryId: row.countryId,
        disaggregationSlice: cleanSlice(row.dimValues),
        value:
          valueType === 'narrative'
            ? { valueType: 'narrative' as const, narrativeText: row.narrativeValue }
            : { valueType, numericValue: row.value },
        comment: row.comment || undefined,
        status: 'submitted' as const,
      }))
      const result = await submitBatch(items)
      toast.success(
        result.queued ? `${items.length} rows saved offline — will sync automatically` : `${items.length} rows submitted`,
      )
      navigate(`/indicators/${indicator!.id}`)
    } catch (error) {
      setFormError(error instanceof ApiRequestError ? error.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link to={`/indicators/${indicator.id}`} className="text-sm text-muted-foreground hover:underline">
        ← {indicator.indicatorCode}
      </Link>

      <div>
        <h1 className="font-heading text-xl font-semibold">Bulk entry</h1>
        <p className="text-sm text-muted-foreground">{indicator.indicatorText}</p>
      </div>

      <div className="max-w-xs">
        <PeriodPicker frequency={indicator.frequency.label} value={period} onChange={setPeriod} />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-40">Country</TableHead>
              {dimIds.map((dimId) => (
                <TableHead key={dimId} className="min-w-36">
                  {dimensions.find((d) => d.id === dimId)?.name ?? dimId}
                </TableHead>
              ))}
              <TableHead className="min-w-32">Value{valueType === 'percentage' ? ' (%)' : ''}</TableHead>
              <TableHead className="min-w-40">Comment</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.localId}>
                <TableCell>
                  <Select value={row.countryId} onValueChange={(value) => updateRow(row.localId, { countryId: value })}>
                    <SelectTrigger aria-label={`Country for row ${index + 1}`} className="w-full">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCountries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                {dimIds.map((dimId) => {
                  const dimension = dimensions.find((d) => d.id === dimId)
                  if (!dimension) return <TableCell key={dimId} />
                  return (
                    <TableCell key={dimId}>
                      <Select
                        value={row.dimValues[dimId] ?? ''}
                        onValueChange={(value) =>
                          updateRow(row.localId, { dimValues: { ...row.dimValues, [dimId]: value } })
                        }
                      >
                        <SelectTrigger aria-label={`${dimension.name} for row ${index + 1}`} className="w-full">
                          <SelectValue placeholder={dimension.name} />
                        </SelectTrigger>
                        <SelectContent>
                          {dimension.allowedValues.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )
                })}
                <TableCell>
                  {valueType === 'narrative' ? (
                    <Input
                      aria-label={`Value for row ${index + 1}`}
                      value={row.narrativeValue}
                      onChange={(event) => updateRow(row.localId, { narrativeValue: event.target.value })}
                    />
                  ) : (
                    <Input
                      aria-label={`Value for row ${index + 1}`}
                      type="number"
                      className="w-24"
                      value={row.value ?? ''}
                      onChange={(event) =>
                        updateRow(row.localId, { value: event.target.value === '' ? undefined : Number(event.target.value) })
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Comment for row ${index + 1}`}
                    className="w-40"
                    value={row.comment}
                    onChange={(event) => updateRow(row.localId, { comment: event.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.localId)}
                    disabled={rows.length === 1}
                    aria-label={`Remove row ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
          <Plus className="size-3.5" />
          Add row
        </Button>
        <span className="text-sm text-muted-foreground">
          {rows.length} row{rows.length > 1 ? 's' : ''}
        </span>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      {!online && (
        <Alert>
          <AlertDescription>You're offline — rows will be saved locally and synced automatically.</AlertDescription>
        </Alert>
      )}

      <Button disabled={submitting} onClick={handleSubmitAll}>
        Submit {rows.length} row{rows.length > 1 ? 's' : ''}
      </Button>
    </div>
  )
}
