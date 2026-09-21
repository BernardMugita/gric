import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { listCountries } from '@/api/countries'
import { ApiRequestError } from '@/api/client'
import { listDisaggregationDimensions } from '@/api/disaggregationDimensions'
import { queryKeys } from '@/api/queryKeys'
import { DisaggregationInput } from '@/components/DisaggregationInput'
import { EvidenceUploader } from '@/components/EvidenceUploader'
import { PeriodPicker } from '@/components/PeriodPicker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useScopedPermissions } from '@/hooks/useScopedPermissions'
import type { EvidenceAttachment } from '@/types/evidence'
import type { IndicatorValue } from '@/types/value'
import { computeSum, sumMismatches } from '@/utils/disaggregation'
import { useIndicator } from '../catalog/hooks/useIndicatorDetail'
import { useDraftQueue } from './hooks/useDraftQueue'
import { useSubmitDataPoint } from './hooks/useSubmitDataPoint'
import { getIndicatorValueType } from './lib/valueType'

const SEX_CATEGORIES = ['Male', 'Female', 'Other'] as const

export function DataEntryFormPage() {
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
  const { submit, submitBatch, online } = useSubmitDataPoint(indicatorId)
  const queuedForThisIndicator = useDraftQueue(indicatorId)

  const [period, setPeriod] = useState('')
  const [countryId, setCountryId] = useState('')
  const [dimValues, setDimValues] = useState<Record<string, string | undefined>>({})
  const [sexValues, setSexValues] = useState<Partial<Record<(typeof SEX_CATEGORIES)[number], number>>>({})
  const [manualTotal, setManualTotal] = useState<number | undefined>(undefined)
  const [numericValue, setNumericValue] = useState<number | undefined>(undefined)
  const [narrativeText, setNarrativeText] = useState('')
  const [comment, setComment] = useState('')
  const [evidence, setEvidence] = useState<EvidenceAttachment[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (indicatorQuery.isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!indicator) {
    return <p className="text-sm text-destructive">Indicator not found.</p>
  }

  const valueType = getIndicatorValueType(indicator)
  const hasSexBreakdown =
    indicator.disaggregationDims.includes('dim_sex') && (valueType === 'numeric' || valueType === 'percentage')
  const otherDimIds = indicator.disaggregationDims.filter((id) => id !== 'dim_sex' && id !== 'dim_country')
  const dimensions = dimensionsQuery.data?.data ?? []
  const availableCountries = (countriesQuery.data?.data ?? []).filter((country) => canActOnCountry(country.id))

  const computedSum = computeSum(SEX_CATEGORIES.map((category) => sexValues[category]))
  const mismatch = hasSexBreakdown && sumMismatches(computedSum, manualTotal)

  async function handleSubmit(status: 'draft' | 'submitted') {
    setFormError(null)

    if (!period) return setFormError('Period is required.')
    if (!countryId) return setFormError('Country is required.')
    if (status === 'submitted' && indicator!.evidenceRequired && evidence.length === 0) {
      return setFormError('Evidence is required before this can be submitted.')
    }

    setSubmitting(true)
    try {
      if (hasSexBreakdown) {
        const categories = SEX_CATEGORIES.filter((category) => sexValues[category] !== undefined)
        if (categories.length === 0) {
          setFormError('Enter at least one category value.')
          return
        }
        const items = categories.map((category) => ({
          indicatorId: indicator!.id,
          period,
          countryId,
          disaggregationSlice: { ...cleanSlice(dimValues), dim_sex: category },
          value: { valueType, numericValue: sexValues[category] } as IndicatorValue,
          comment: comment || undefined,
          evidenceIds: evidence.map((e) => e.id),
          status,
        }))
        const result = await submitBatch(items)
        toast.success(
          result.queued
            ? `${items.length} entries saved offline — will sync automatically`
            : `${items.length} entries ${status === 'draft' ? 'saved as draft' : 'submitted for review'}`,
        )
      } else {
        const value: IndicatorValue =
          valueType === 'narrative' ? { valueType: 'narrative', narrativeText } : { valueType, numericValue }
        const result = await submit({
          indicatorId: indicator!.id,
          period,
          countryId,
          disaggregationSlice: cleanSlice(dimValues),
          value,
          comment: comment || undefined,
          evidenceIds: evidence.map((e) => e.id),
          status,
        })
        toast.success(
          result.queued
            ? 'Saved offline — will sync automatically'
            : status === 'draft'
              ? 'Draft saved'
              : 'Submitted for review',
        )
      }
      navigate(`/indicators/${indicator!.id}`)
    } catch (error) {
      setFormError(error instanceof ApiRequestError ? error.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link to={`/indicators/${indicator.id}`} className="text-sm text-muted-foreground hover:underline">
        ← {indicator.indicatorCode}
      </Link>

      <div>
        <h1 className="font-heading text-xl font-semibold">Report data</h1>
        <p className="text-sm text-muted-foreground">{indicator.indicatorText}</p>
      </div>

      {queuedForThisIndicator.length > 0 && (
        <Alert>
          <AlertDescription>
            {queuedForThisIndicator.length} entr{queuedForThisIndicator.length > 1 ? 'ies' : 'y'} for this indicator{' '}
            {queuedForThisIndicator.length > 1 ? 'are' : 'is'} queued and waiting to sync.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <PeriodPicker frequency={indicator.frequency.label} value={period} onChange={setPeriod} />

          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Select value={countryId} onValueChange={setCountryId}>
              <SelectTrigger id="country" aria-label="Country" className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {otherDimIds.map((dimId) => {
            const dimension = dimensions.find((d) => d.id === dimId)
            if (!dimension) return null
            return (
              <DisaggregationInput
                key={dimId}
                dimension={dimension}
                value={dimValues[dimId]}
                onChange={(value) => setDimValues((prev) => ({ ...prev, [dimId]: value }))}
              />
            )
          })}

          {hasSexBreakdown ? (
            <div className="space-y-3 rounded-md border p-3">
              <p className="text-sm font-medium">By sex</p>
              <div className="grid grid-cols-3 gap-2">
                {SEX_CATEGORIES.map((category) => (
                  <div key={category} className="space-y-1">
                    <Label htmlFor={`sex-${category}`}>{category}</Label>
                    <Input
                      id={`sex-${category}`}
                      type="number"
                      min={0}
                      value={sexValues[category] ?? ''}
                      onChange={(event) =>
                        setSexValues((prev) => ({
                          ...prev,
                          [category]: event.target.value === '' ? undefined : Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Computed total: {computedSum}</p>
              <div className="space-y-1">
                <Label htmlFor="manual-total">Reported total (optional cross-check)</Label>
                <Input
                  id="manual-total"
                  type="number"
                  value={manualTotal ?? ''}
                  onChange={(event) =>
                    setManualTotal(event.target.value === '' ? undefined : Number(event.target.value))
                  }
                />
              </div>
              {mismatch && (
                <Alert variant="destructive">
                  <AlertDescription>
                    The parts ({computedSum}) don't match the reported total ({manualTotal}).
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="value">{valueType === 'narrative' ? 'Value' : 'Value' + (valueType === 'percentage' ? ' (%)' : '')}</Label>
              {valueType === 'narrative' ? (
                <Textarea id="value" value={narrativeText} onChange={(event) => setNarrativeText(event.target.value)} />
              ) : (
                <Input
                  id="value"
                  type="number"
                  min={valueType === 'percentage' ? 0 : undefined}
                  max={valueType === 'percentage' ? 100 : undefined}
                  value={numericValue ?? ''}
                  onChange={(event) =>
                    setNumericValue(event.target.value === '' ? undefined : Number(event.target.value))
                  }
                />
              )}
            </div>
          )}

          <EvidenceUploader value={evidence} onChange={setEvidence} required={indicator.evidenceRequired} />

          <div className="space-y-1.5">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="e.g. target missed due to flooding"
            />
          </div>

          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {!online && (
            <Alert>
              <AlertDescription>You're offline — this will be saved locally and synced automatically.</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" disabled={submitting} onClick={() => handleSubmit('draft')}>
              Save draft
            </Button>
            <Button disabled={submitting} onClick={() => handleSubmit('submitted')}>
              Submit for review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cleanSlice(values: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as Record<
    string,
    string
  >
}
