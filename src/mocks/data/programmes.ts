import type { Domain } from '@/types/domain'
import type { Programme } from '@/types/programme'

export const programmes: Programme[] = [
  {
    id: 'prog_eccde',
    name: 'ECCDE',
    description: 'Early Childhood Care, Development & Education',
  },
  {
    id: 'prog_childrens_learning',
    name: "Children's Learning",
    description: 'Foundational literacy, numeracy and in-school support',
  },
  {
    id: 'prog_girls_women',
    name: 'Girls and Women',
    description:
      "Girls' education, out-of-school girls and women's economic empowerment",
  },
  {
    id: 'prog_youth',
    name: 'Youth',
    description: 'Youth leadership and positive engagement & empowerment',
  },
  {
    id: 'prog_capacity_development',
    name: 'Capacity Development',
    description: 'Strengthening CBO and partner organisational capacity',
  },
  {
    id: 'prog_policy_partnership',
    name: 'Policy and Partnership',
    description: 'Policy influence and strategic partnerships',
  },
  {
    id: 'prog_institutional_strengthening',
    name: 'Institutional Strengthening',
    description: "GRiC's own MEL framework rollout, KM and communications",
  },
]

export const domains: Domain[] = [
  // ECCDE
  { id: 'dom_childcare_0_3', name: 'Child-care (0–3 years)', programmeId: 'prog_eccde' },
  { id: 'dom_preprimary_3_5', name: 'Pre-primary (3–5 years)', programmeId: 'prog_eccde' },
  { id: 'dom_eccde_cross_cutting', name: 'Cross-cutting', programmeId: 'prog_eccde' },

  // Children's Learning
  {
    id: 'dom_foundational_literacy_numeracy',
    name: 'Foundational Literacy & Numeracy',
    programmeId: 'prog_childrens_learning',
  },
  {
    id: 'dom_in_school_support',
    name: 'In-school Support',
    programmeId: 'prog_childrens_learning',
  },
  {
    id: 'dom_learning_cross_cutting',
    name: 'Cross-cutting',
    programmeId: 'prog_childrens_learning',
  },

  // Girls and Women — the three domains behind the shared convergence Goal
  { id: 'dom_girls_education', name: "Girls' Education", programmeId: 'prog_girls_women' },
  {
    id: 'dom_out_of_school_girls',
    name: 'Out-of-School Girls',
    programmeId: 'prog_girls_women',
  },
  {
    id: 'dom_womens_economic_empowerment',
    name: "Women's Economic Empowerment",
    programmeId: 'prog_girls_women',
  },

  // Youth
  { id: 'dom_youth_leadership', name: 'Youth Leadership', programmeId: 'prog_youth' },
  { id: 'dom_pee_lsv', name: 'PE&E / LSV', programmeId: 'prog_youth' },

  // Capacity Development
  {
    id: 'dom_cbo_capacity',
    name: 'CBO Capacity',
    programmeId: 'prog_capacity_development',
  },
  {
    id: 'dom_capacity_cross_cutting',
    name: 'Cross-cutting',
    programmeId: 'prog_capacity_development',
  },

  // Policy and Partnership
  {
    id: 'dom_policy_influence',
    name: 'Policy Influence',
    programmeId: 'prog_policy_partnership',
  },
  {
    id: 'dom_strategic_partnerships',
    name: 'Strategic Partnerships',
    programmeId: 'prog_policy_partnership',
  },

  // Institutional Strengthening
  {
    id: 'dom_mel_framework_implementation',
    name: 'MEL Framework Implementation',
    programmeId: 'prog_institutional_strengthening',
  },
  {
    id: 'dom_knowledge_management',
    name: 'Knowledge Management',
    programmeId: 'prog_institutional_strengthening',
  },
]
