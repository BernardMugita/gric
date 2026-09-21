import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FrequencyLabel } from '@/types/enums'
import { generateRecentPeriods } from '@/utils/period'

interface PeriodPickerProps {
  frequency: FrequencyLabel
  value: string
  onChange: (period: string) => void
}

/** Suggests recent periods shaped by the indicator's own frequency; free text for cycle/milestone-based cadences. */
export function PeriodPicker({ frequency, value, onChange }: PeriodPickerProps) {
  const suggestions = generateRecentPeriods(frequency)

  if (suggestions.length === 0) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="period">Period</Label>
        <Input
          id="period"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. 6 months post-graduation, cohort 2026-A"
        />
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <Label>Period</Label>
      <Select value={suggestions.includes(value) ? value : ''} onValueChange={onChange}>
        <SelectTrigger aria-label="Period" className="w-full">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {suggestions.map((period) => (
            <SelectItem key={period} value={period}>
              {period}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
