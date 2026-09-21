import type { DisaggregationDimension } from '@/types/disaggregation'

export const disaggregationDimensions: DisaggregationDimension[] = [
  { id: 'dim_sex', name: 'Sex', allowedValues: ['Male', 'Female', 'Other'] },
  {
    id: 'dim_age_band',
    name: 'Age band',
    allowedValues: ['0-3', '4-5', '6-12', '13-17', '18-24', '25+'],
  },
  { id: 'dim_country', name: 'Country', allowedValues: ['KE', 'UG', 'TZ'] },
  {
    id: 'dim_stakeholder_type',
    name: 'Stakeholder type',
    allowedValues: ['Caregiver', 'Educator', 'Learner', 'CBO', 'Government'],
  },
]
