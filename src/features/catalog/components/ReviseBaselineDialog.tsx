import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/client'
import { reviseBaseline } from '@/api/indicators'
import { queryKeys } from '@/api/queryKeys'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useScopedPermissions } from '@/hooks/useScopedPermissions'
import type { Indicator } from '@/types/indicator'
import { formatIndicatorValue } from '@/utils/formatValue'

type BaselineValueType = 'numeric' | 'percentage' | 'narrative'

interface ReviseBaselineDialogProps {
  indicator: Indicator
}

/** FR-DC-9: only the MEL Lead can establish/revise a baseline; the prior value survives in the audit log (NFR-4). */
export function ReviseBaselineDialog({ indicator }: ReviseBaselineDialogProps) {
  const { hasPermission } = useScopedPermissions()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [valueType, setValueType] = useState<BaselineValueType>('numeric')
  const [numericValue, setNumericValue] = useState<number | undefined>(undefined)
  const [narrativeText, setNarrativeText] = useState('')
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [source, setSource] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!hasPermission('baseline:establish') && !hasPermission('baseline:revise')) return null

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      await reviseBaseline(indicator.id, {
        valueType,
        numericValue: valueType === 'narrative' ? undefined : numericValue,
        narrativeText: valueType === 'narrative' ? narrativeText : undefined,
        asOfDate,
        source: source || undefined,
        note: note || undefined,
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.indicators.detail(indicator.id) })
      toast.success('Baseline updated')
      setOpen(false)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Revise baseline
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revise baseline</DialogTitle>
          <DialogDescription>
            Current: {formatIndicatorValue(indicator.baseline)}. The prior value stays in the audit trail, never
            overwritten silently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Value type</Label>
            <Select value={valueType} onValueChange={(value) => setValueType(value as BaselineValueType)}>
              <SelectTrigger aria-label="Value type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numeric">Numeric</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="narrative">Narrative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {valueType === 'narrative' ? (
            <div className="space-y-1.5">
              <Label htmlFor="baseline-narrative">Value</Label>
              <Textarea id="baseline-narrative" value={narrativeText} onChange={(e) => setNarrativeText(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="baseline-value">Value</Label>
              <Input
                id="baseline-value"
                type="number"
                value={numericValue ?? ''}
                onChange={(e) => setNumericValue(e.target.value === '' ? undefined : Number(e.target.value))}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="baseline-date">As of date</Label>
            <Input id="baseline-date" type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="baseline-source">Source</Label>
            <Input id="baseline-source" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="baseline-note">Note</Label>
            <Textarea id="baseline-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={submitting} onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
