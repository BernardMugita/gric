import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { DisaggregationDimension } from '@/types/disaggregation'

interface DisaggregationInputProps {
  dimension: DisaggregationDimension
  value: string | undefined
  onChange: (value: string | undefined) => void
}

/** One dimension, one picked value — Sex's per-category breakdown is a separate, FR-DC-2-specific control. */
export function DisaggregationInput({ dimension, value, onChange }: DisaggregationInputProps) {
  return (
    <div className="space-y-1.5">
      <Label>{dimension.name}</Label>
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger aria-label={dimension.name} className="w-full">
          <SelectValue placeholder={`Select ${dimension.name.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {dimension.allowedValues.map((allowedValue) => (
            <SelectItem key={allowedValue} value={allowedValue}>
              {allowedValue}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
