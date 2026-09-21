import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  GENDER_INTEGRATION_LEVELS,
  INDICATOR_STATUSES,
  RESULT_LEVELS,
  ROLE_IDS,
  ROLE_LABELS,
  SPHERES_OF_ACCOUNTABILITY,
} from '@/types/enums'
import { useCatalogStore, type CatalogFilters } from '@/stores/catalogStore'
import { useDomainsForProgramme, useProgrammes } from '../hooks/useIndicators'

const ALL = '__all__'

interface FilterSelectProps {
  label: string
  value: string | undefined
  options: { value: string; label: string }[]
  onChange: (value: string | undefined) => void
  disabled?: boolean
}

function FilterSelect({ label, value, options, onChange, disabled }: FilterSelectProps) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : next)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full sm:w-44" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function FilterBar() {
  const filters = useCatalogStore((state) => state.filters)
  const setFilter = useCatalogStore((state) => state.setFilter)
  const resetFilters = useCatalogStore((state) => state.resetFilters)

  const programmesQuery = useProgrammes()
  const domainsQuery = useDomainsForProgramme(filters.programmeId)

  const hasActiveFilters = Object.values(filters).some(Boolean)

  function set<K extends keyof CatalogFilters>(key: K) {
    return (value: string | undefined) => setFilter(key, value as CatalogFilters[K])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Programmes"
        value={filters.programmeId}
        onChange={set('programmeId')}
        options={(programmesQuery.data?.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
      />
      <FilterSelect
        label="Domains"
        value={filters.domainId}
        onChange={set('domainId')}
        disabled={!filters.programmeId}
        options={(domainsQuery.data?.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
      />
      <FilterSelect
        label="Result levels"
        value={filters.resultLevel}
        onChange={set('resultLevel')}
        options={RESULT_LEVELS.map((level) => ({ value: level, label: level }))}
      />
      <FilterSelect
        label="Statuses"
        value={filters.status}
        onChange={set('status')}
        options={INDICATOR_STATUSES.map((status) => ({ value: status, label: status }))}
      />
      <FilterSelect
        label="Spheres of accountability"
        value={filters.sphereOfAccountability}
        onChange={set('sphereOfAccountability')}
        options={SPHERES_OF_ACCOUNTABILITY.map((sphere) => ({ value: sphere, label: sphere }))}
      />
      <FilterSelect
        label="Gender integration levels"
        value={filters.genderIntegrationLevel}
        onChange={set('genderIntegrationLevel')}
        options={GENDER_INTEGRATION_LEVELS.map((level) => ({ value: level, label: level }))}
      />
      <FilterSelect
        label="Responsible roles"
        value={filters.responsibleRoleId}
        onChange={set('responsibleRoleId')}
        options={ROLE_IDS.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
          <X className="size-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
