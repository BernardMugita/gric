import type {
  GenderIntegrationLevel,
  IndicatorStatus,
  ResultLevel,
  SphereOfAccountability,
} from '@/types/enums'
import type { Indicator } from '@/types/indicator'
import { domains } from './programmes'
import { mulberry32, pick, weightedPick } from './rng'

let seq = 0
function nextId(prefix: string): string {
  seq += 1
  return `${prefix}_${seq.toString(36)}`
}

/**
 * Hand-authored indicators exercising every edge case the FRD calls out by
 * name: the §13 sample payload verbatim, narrative-only targets, a
 * "not previously tracked" baseline, milestone-based cadence, and both
 * convergence groups from §1 principle 5 (spanning domains within one
 * programme, and spanning two different programmes).
 */
const handAuthored: Indicator[] = [
  {
    id: 'ind_eccde_cc03_9',
    indicatorCode: 'ECCDE-CC03-9',
    programmeId: 'prog_eccde',
    domainId: 'dom_childcare_0_3',
    resultLevel: 'Output',
    resultStatement: 'Increased number of operational childcare centres',
    indicatorText: 'Number of new childcare centres operational',
    monitoringQuestion: 'How many childcare centres are open?',
    dataSource: 'Centre registers',
    frequency: { label: 'Quarterly' },
    responsibleRoleId: 'programme_officer',
    disaggregationDims: ['dim_country'],
    sphereOfAccountability: 'Direct Delivery',
    genderIntegrationLevel: 'Unintentional',
    status: 'Ready',
    evidenceRequired: true,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_eccde_cc03_9',
      indicatorId: 'ind_eccde_cc03_9',
      valueType: 'numeric',
      numericValue: 41,
      asOfDate: '2025-01-01',
      note: '41 centres operational (Kenya)',
      version: 1,
    },
    targets: [
      { id: 'tgt_eccde_cc03_9_2026', indicatorId: 'ind_eccde_cc03_9', period: '2026', valueType: 'numeric', numericValue: 45 },
      { id: 'tgt_eccde_cc03_9_2027', indicatorId: 'ind_eccde_cc03_9', period: '2027', valueType: 'numeric', numericValue: 50 },
      { id: 'tgt_eccde_cc03_9_2028', indicatorId: 'ind_eccde_cc03_9', period: '2028', valueType: 'numeric', numericValue: 55 },
    ],
  },
  {
    id: 'ind_eccde_activity_registers',
    indicatorCode: 'ECCDE-CC01-2',
    programmeId: 'prog_eccde',
    domainId: 'dom_childcare_0_3',
    resultLevel: 'Activity',
    resultStatement: 'Caregivers trained on early stimulation practices',
    indicatorText: 'Number of caregiver coaching sessions delivered',
    monitoringQuestion: 'How many coaching sessions ran this term?',
    dataSource: 'Facilitator attendance registers',
    frequency: { label: 'Termly' },
    responsibleRoleId: 'programme_officer',
    disaggregationDims: ['dim_country', 'dim_stakeholder_type'],
    sphereOfAccountability: 'Direct Delivery',
    genderIntegrationLevel: 'Responsive',
    status: 'Pending',
    evidenceRequired: true,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_eccde_activity_registers',
      indicatorId: 'ind_eccde_activity_registers',
      valueType: 'notYetTracked',
      asOfDate: '2026-01-01',
      note: 'Not previously tracked',
      version: 1,
    },
    targets: [
      {
        id: 'tgt_eccde_activity_registers_2026',
        indicatorId: 'ind_eccde_activity_registers',
        period: '2026',
        valueType: 'narrative',
        narrativeText: 'Growth target set with programme plan',
      },
    ],
  },
  {
    id: 'ind_learning_flnl_pct',
    indicatorCode: 'CL-FLN01-4',
    programmeId: 'prog_childrens_learning',
    domainId: 'dom_foundational_literacy_numeracy',
    resultLevel: 'Outcome',
    resultStatement: 'Improved foundational literacy among supported learners',
    indicatorText: '% of assessed learners reading at grade level',
    monitoringQuestion: 'What % of assessed learners read at grade level?',
    dataSource: 'EGRA assessment results',
    frequency: { label: 'Annually' },
    responsibleRoleId: 'programme_officer',
    disaggregationDims: ['dim_sex', 'dim_country'],
    sphereOfAccountability: 'Coaching / Influence',
    genderIntegrationLevel: 'Intentional',
    status: 'Ready',
    evidenceRequired: false,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_learning_flnl_pct',
      indicatorId: 'ind_learning_flnl_pct',
      valueType: 'percentage',
      numericValue: 32,
      asOfDate: '2025-06-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_learning_flnl_pct_2026', indicatorId: 'ind_learning_flnl_pct', period: '2026', valueType: 'percentage', numericValue: 45 },
    ],
  },
  {
    id: 'ind_learning_outcome_not_tracked',
    indicatorCode: 'CL-ISS02-1',
    programmeId: 'prog_childrens_learning',
    domainId: 'dom_in_school_support',
    resultLevel: 'Outcome',
    resultStatement: 'Reduced grade repetition among supported learners',
    indicatorText: '% of supported learners repeating a grade',
    monitoringQuestion: 'What % of supported learners repeated a grade this year?',
    dataSource: 'School records',
    frequency: { label: 'Annually' },
    responsibleRoleId: 'programme_officer',
    disaggregationDims: ['dim_sex'],
    sphereOfAccountability: 'Coaching / Influence',
    genderIntegrationLevel: 'Responsive',
    status: 'Pending',
    evidenceRequired: false,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_learning_outcome_not_tracked',
      indicatorId: 'ind_learning_outcome_not_tracked',
      valueType: 'notYetTracked',
      asOfDate: '2026-01-01',
      note: 'Baseline study pending',
      version: 1,
    },
    targets: [],
  },

  // --- Convergence group 1: shared Goal across three Girls and Women domains ---
  {
    id: 'ind_girls_education_goal',
    indicatorCode: 'GW-GE09-1',
    programmeId: 'prog_girls_women',
    domainId: 'dom_girls_education',
    resultLevel: 'Goal',
    resultStatement: 'Women and girls are economically stable',
    indicatorText: 'Number of girls completing secondary education',
    monitoringQuestion: 'How many supported girls completed secondary school?',
    dataSource: 'School completion records',
    frequency: { label: 'Annually' },
    responsibleRoleId: 'mel_lead',
    disaggregationDims: ['dim_country'],
    sphereOfAccountability: 'Advocacy / Strategic Interest',
    genderIntegrationLevel: 'Transformative',
    status: 'Aspirational',
    evidenceRequired: false,
    convergenceGroupId: 'goal_women_girls_stability',
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_girls_education_goal',
      indicatorId: 'ind_girls_education_goal',
      valueType: 'numeric',
      numericValue: 120,
      asOfDate: '2025-01-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_girls_education_goal_2028', indicatorId: 'ind_girls_education_goal', period: '2028', valueType: 'numeric', numericValue: 200 },
    ],
  },
  {
    id: 'ind_out_of_school_goal',
    indicatorCode: 'GW-OOS04-2',
    programmeId: 'prog_girls_women',
    domainId: 'dom_out_of_school_girls',
    resultLevel: 'Goal',
    resultStatement: 'Women and girls are economically stable',
    indicatorText: 'Number of out-of-school girls re-enrolled or in vocational training',
    monitoringQuestion: 'How many out-of-school girls re-enrolled or entered vocational training?',
    dataSource: 'CBO tracking sheets',
    frequency: { label: 'Bi-annually' },
    responsibleRoleId: 'mel_lead',
    disaggregationDims: ['dim_country'],
    sphereOfAccountability: 'Advocacy / Strategic Interest',
    genderIntegrationLevel: 'Transformative',
    status: 'Aspirational',
    evidenceRequired: false,
    convergenceGroupId: 'goal_women_girls_stability',
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_out_of_school_goal',
      indicatorId: 'ind_out_of_school_goal',
      valueType: 'numeric',
      numericValue: 60,
      asOfDate: '2025-01-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_out_of_school_goal_2028', indicatorId: 'ind_out_of_school_goal', period: '2028', valueType: 'numeric', numericValue: 110 },
    ],
  },
  {
    id: 'ind_wee_goal',
    indicatorCode: 'GW-WEE07-3',
    programmeId: 'prog_girls_women',
    domainId: 'dom_womens_economic_empowerment',
    resultLevel: 'Goal',
    resultStatement: 'Women and girls are economically stable',
    indicatorText: 'Number of women in active savings/lending groups',
    monitoringQuestion: 'How many women are active in a savings/lending group?',
    dataSource: 'Group registers',
    frequency: { label: 'Quarterly' },
    responsibleRoleId: 'mel_lead',
    disaggregationDims: ['dim_country'],
    sphereOfAccountability: 'Advocacy / Strategic Interest',
    genderIntegrationLevel: 'Transformative',
    status: 'Aspirational',
    evidenceRequired: false,
    convergenceGroupId: 'goal_women_girls_stability',
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_wee_goal',
      indicatorId: 'ind_wee_goal',
      valueType: 'numeric',
      numericValue: 340,
      asOfDate: '2025-01-01',
      version: 1,
    },
    targets: [
      {
        id: 'tgt_wee_goal_2028',
        indicatorId: 'ind_wee_goal',
        period: '2028',
        valueType: 'narrative',
        narrativeText: 'Growth including Uganda and Tanzania',
      },
    ],
  },

  // --- Youth ---
  {
    id: 'ind_youth_milestone',
    indicatorCode: 'YTH-LDR02-5',
    programmeId: 'prog_youth',
    domainId: 'dom_youth_leadership',
    resultLevel: 'Outcome',
    resultStatement: 'Youth graduates sustain leadership engagement post-programme',
    indicatorText: '% of graduates active in community leadership roles',
    monitoringQuestion: 'Are graduates still active in leadership roles 6 and 12 months on?',
    dataSource: 'Post-graduation tracer survey',
    frequency: { label: 'Milestone-based', cadenceRule: '6 and 12 months post-graduation' },
    responsibleRoleId: 'programme_officer',
    disaggregationDims: ['dim_sex', 'dim_age_band'],
    sphereOfAccountability: 'Coaching / Influence',
    genderIntegrationLevel: 'Intentional',
    status: 'Pending',
    evidenceRequired: false,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_youth_milestone',
      indicatorId: 'ind_youth_milestone',
      valueType: 'notYetTracked',
      asOfDate: '2026-01-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_youth_milestone_2026', indicatorId: 'ind_youth_milestone', period: '2026', valueType: 'percentage', numericValue: 60 },
    ],
  },
  {
    id: 'ind_youth_pee_activity',
    indicatorCode: 'YTH-PEE05-1',
    programmeId: 'prog_youth',
    domainId: 'dom_pee_lsv',
    resultLevel: 'Activity',
    resultStatement: 'Youth complete life-skills and values sessions',
    indicatorText: 'Number of PE&E / LSV sessions delivered',
    monitoringQuestion: 'How many sessions ran this cycle?',
    dataSource: 'Facilitator logs',
    frequency: { label: 'Per cycle' },
    responsibleRoleId: 'programme_officer',
    disaggregationDims: ['dim_sex'],
    sphereOfAccountability: 'Direct Delivery',
    genderIntegrationLevel: 'Responsive',
    status: 'Ready',
    evidenceRequired: false,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_youth_pee_activity',
      indicatorId: 'ind_youth_pee_activity',
      valueType: 'numeric',
      numericValue: 18,
      asOfDate: '2025-01-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_youth_pee_activity_2026', indicatorId: 'ind_youth_pee_activity', period: '2026', valueType: 'numeric', numericValue: 24 },
    ],
  },

  // --- Convergence group 2: shared Goal across two programmes ---
  {
    id: 'ind_capacity_wellbeing_goal',
    indicatorCode: 'CD-CBO06-1',
    programmeId: 'prog_capacity_development',
    domainId: 'dom_cbo_capacity',
    resultLevel: 'Goal',
    resultStatement: 'Communities experience improved well-being',
    indicatorText: 'Number of CBOs delivering services at target quality standard',
    monitoringQuestion: 'How many partner CBOs meet the quality standard?',
    dataSource: 'CBO capacity assessments',
    frequency: { label: 'Annually' },
    responsibleRoleId: 'mel_lead',
    disaggregationDims: ['dim_country'],
    sphereOfAccountability: 'Coaching / Influence',
    genderIntegrationLevel: 'Responsive',
    status: 'Pending',
    evidenceRequired: false,
    convergenceGroupId: 'goal_community_wellbeing',
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_capacity_wellbeing_goal',
      indicatorId: 'ind_capacity_wellbeing_goal',
      valueType: 'numeric',
      numericValue: 14,
      asOfDate: '2025-01-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_capacity_wellbeing_goal_2028', indicatorId: 'ind_capacity_wellbeing_goal', period: '2028', valueType: 'numeric', numericValue: 25 },
    ],
  },
  {
    id: 'ind_policy_wellbeing_goal',
    indicatorCode: 'PP-POL03-1',
    programmeId: 'prog_policy_partnership',
    domainId: 'dom_policy_influence',
    resultLevel: 'Goal',
    resultStatement: 'Communities experience improved well-being',
    indicatorText: 'Number of policy positions adopted reflecting GRiC recommendations',
    monitoringQuestion: 'How many advocated policy positions were adopted?',
    dataSource: 'Government gazette / partner reports',
    frequency: { label: 'Annually' },
    responsibleRoleId: 'policy_partnerships_lead',
    disaggregationDims: ['dim_country'],
    sphereOfAccountability: 'Advocacy / Strategic Interest',
    genderIntegrationLevel: 'Responsive',
    status: 'Aspirational',
    evidenceRequired: false,
    convergenceGroupId: 'goal_community_wellbeing',
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_policy_wellbeing_goal',
      indicatorId: 'ind_policy_wellbeing_goal',
      valueType: 'numeric',
      numericValue: 2,
      asOfDate: '2025-01-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_policy_wellbeing_goal_2028', indicatorId: 'ind_policy_wellbeing_goal', period: '2028', valueType: 'numeric', numericValue: 6 },
    ],
  },
  {
    id: 'ind_policy_output_narrative',
    indicatorCode: 'PP-SP08-2',
    programmeId: 'prog_policy_partnership',
    domainId: 'dom_strategic_partnerships',
    resultLevel: 'Output',
    resultStatement: 'Strategic partnerships deliver co-funded programming',
    indicatorText: 'Value of co-funded partnership agreements signed',
    monitoringQuestion: 'What partnership agreements were signed this year?',
    dataSource: 'Signed MOUs',
    frequency: { label: 'Annually' },
    responsibleRoleId: 'policy_partnerships_lead',
    disaggregationDims: [],
    sphereOfAccountability: 'Advocacy / Strategic Interest',
    genderIntegrationLevel: 'Unintentional',
    status: 'Pending',
    evidenceRequired: true,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_policy_output_narrative',
      indicatorId: 'ind_policy_output_narrative',
      valueType: 'notYetTracked',
      asOfDate: '2026-01-01',
      version: 1,
    },
    targets: [
      {
        id: 'tgt_policy_output_narrative_2026',
        indicatorId: 'ind_policy_output_narrative',
        period: '2026',
        valueType: 'narrative',
        narrativeText: 'Sustained on-schedule delivery',
      },
    ],
  },

  // --- Institutional Strengthening: the framework tracking itself (FR-MW-7) ---
  {
    id: 'ind_inst_baseline_established_pct',
    indicatorCode: 'IS-MEL01-1',
    programmeId: 'prog_institutional_strengthening',
    domainId: 'dom_mel_framework_implementation',
    resultLevel: 'Output',
    resultStatement: 'The MEL framework has established, trustworthy baselines',
    indicatorText: '% of indicators with an established baseline',
    monitoringQuestion: 'What % of the 241 indicators have a real (non-placeholder) baseline?',
    dataSource: 'MEL system',
    frequency: { label: 'Quarterly' },
    responsibleRoleId: 'mel_systems_lead',
    disaggregationDims: [],
    sphereOfAccountability: 'Direct Delivery',
    genderIntegrationLevel: 'Unintentional',
    status: 'Ready',
    evidenceRequired: false,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_inst_baseline_established_pct',
      indicatorId: 'ind_inst_baseline_established_pct',
      valueType: 'percentage',
      numericValue: 12,
      asOfDate: '2026-01-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_inst_baseline_established_pct_2026', indicatorId: 'ind_inst_baseline_established_pct', period: '2026', valueType: 'percentage', numericValue: 80 },
    ],
  },
  {
    id: 'ind_inst_system_adoption_pct',
    indicatorCode: 'IS-MEL02-2',
    programmeId: 'prog_institutional_strengthening',
    domainId: 'dom_mel_framework_implementation',
    resultLevel: 'Output',
    resultStatement: 'Users report through the MEL system rather than in parallel',
    indicatorText: '% of active users submitting through the system vs. offline',
    monitoringQuestion: 'What % of active users submitted via the system this quarter?',
    dataSource: 'MEL system usage logs',
    frequency: { label: 'Quarterly' },
    responsibleRoleId: 'mel_systems_lead',
    disaggregationDims: [],
    sphereOfAccountability: 'Direct Delivery',
    genderIntegrationLevel: 'Unintentional',
    status: 'Pending',
    evidenceRequired: false,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_inst_system_adoption_pct',
      indicatorId: 'ind_inst_system_adoption_pct',
      valueType: 'notYetTracked',
      asOfDate: '2026-01-01',
      note: 'System not yet live at baseline',
      version: 1,
    },
    targets: [
      { id: 'tgt_inst_system_adoption_pct_2026', indicatorId: 'ind_inst_system_adoption_pct', period: '2026', valueType: 'percentage', numericValue: 90 },
    ],
  },

  // --- Capacity Development: evidence-required + stakeholder disaggregation ---
  {
    id: 'ind_capacity_activity_training',
    indicatorCode: 'CD-CBO02-4',
    programmeId: 'prog_capacity_development',
    domainId: 'dom_cbo_capacity',
    resultLevel: 'Activity',
    resultStatement: 'CBO staff complete organisational development training',
    indicatorText: 'Number of CBO staff trained',
    monitoringQuestion: 'How many CBO staff completed training this quarter?',
    dataSource: 'Training attendance sheets',
    frequency: { label: 'Quarterly' },
    responsibleRoleId: 'programme_officer',
    disaggregationDims: ['dim_stakeholder_type', 'dim_country'],
    sphereOfAccountability: 'Direct Delivery',
    genderIntegrationLevel: 'Unintentional',
    status: 'Ready',
    evidenceRequired: true,
    currentVersion: 1,
    effectiveFrom: '2026-01-01',
    baseline: {
      id: 'bl_capacity_activity_training',
      indicatorId: 'ind_capacity_activity_training',
      valueType: 'numeric',
      numericValue: 96,
      asOfDate: '2025-01-01',
      version: 1,
    },
    targets: [
      { id: 'tgt_capacity_activity_training_2026', indicatorId: 'ind_capacity_activity_training', period: '2026', valueType: 'numeric', numericValue: 130 },
    ],
  },
]

const PROGRAMME_CODE: Record<string, string> = {
  prog_eccde: 'ECCDE',
  prog_childrens_learning: 'CL',
  prog_girls_women: 'GW',
  prog_youth: 'YTH',
  prog_capacity_development: 'CD',
  prog_policy_partnership: 'PP',
  prog_institutional_strengthening: 'IS',
}

const RESULT_LEVEL_WEIGHTS: Record<ResultLevel, number> = {
  Activity: 0.28,
  Output: 0.38,
  Outcome: 0.26,
  Goal: 0.08,
}

const STATUS_WEIGHTS: Record<IndicatorStatus, number> = {
  Pending: 0.68,
  Ready: 0.26,
  Aspirational: 0.06,
}

const SPHERE_WEIGHTS: Record<SphereOfAccountability, number> = {
  'Direct Delivery': 0.5,
  'Coaching / Influence': 0.35,
  'Advocacy / Strategic Interest': 0.15,
}

const GENDER_LEVEL_WEIGHTS: Record<GenderIntegrationLevel, number> = {
  Unintentional: 0.45,
  Responsive: 0.3,
  Intentional: 0.18,
  Transformative: 0.07,
}

const FREQUENCIES = [
  { label: 'Weekly' as const },
  { label: 'Termly' as const },
  { label: 'Quarterly' as const },
  { label: 'Bi-annually' as const },
  { label: 'Annually' as const },
  { label: 'Per cycle' as const },
]

/**
 * Pads the catalog up to a target size (241, matching the workbook) so
 * pagination, filtering and completeness dashboards have real volume to
 * work with. Deterministic — same seed always produces the same set.
 */
function generateFillerIndicators(count: number): Indicator[] {
  const rng = mulberry32(20260918)
  const generated: Indicator[] = []

  for (let i = 0; i < count; i += 1) {
    const domain = pick(rng, domains)
    const programmeId = domain.programmeId
    const resultLevel = weightedPick(rng, RESULT_LEVEL_WEIGHTS)
    const status = weightedPick(rng, STATUS_WEIGHTS)
    const sphereOfAccountability = weightedPick(rng, SPHERE_WEIGHTS)
    const genderIntegrationLevel = weightedPick(rng, GENDER_LEVEL_WEIGHTS)
    const frequency = pick(rng, FREQUENCIES)
    const hasBaseline = status !== 'Pending' || rng() > 0.5
    const indicatorId = nextId('ind_gen')
    const code = `${PROGRAMME_CODE[programmeId]}-GEN-${i + 1}`

    const baseline = hasBaseline
      ? {
          id: nextId('bl_gen'),
          indicatorId,
          valueType: 'numeric' as const,
          numericValue: Math.round(rng() * 200),
          asOfDate: '2025-01-01',
          version: 1,
        }
      : {
          id: nextId('bl_gen'),
          indicatorId,
          valueType: 'notYetTracked' as const,
          asOfDate: '2026-01-01',
          note: 'Not previously tracked',
          version: 1,
        }

    generated.push({
      id: indicatorId,
      indicatorCode: code,
      programmeId,
      domainId: domain.id,
      resultLevel,
      resultStatement: `${domain.name} results statement ${i + 1}`,
      indicatorText: `${domain.name} indicator ${i + 1}`,
      monitoringQuestion: `Monitoring question for ${domain.name} indicator ${i + 1}`,
      dataSource: 'Programme records',
      frequency,
      responsibleRoleId: 'programme_officer',
      disaggregationDims: rng() > 0.5 ? ['dim_country'] : [],
      sphereOfAccountability,
      genderIntegrationLevel,
      status,
      evidenceRequired: rng() > 0.7,
      currentVersion: 1,
      effectiveFrom: '2026-01-01',
      baseline,
      targets: hasBaseline
        ? [
            {
              id: nextId('tgt_gen'),
              indicatorId,
              period: '2026',
              valueType: 'numeric',
              numericValue: Math.round((baseline.numericValue ?? 0) * 1.2),
            },
          ]
        : [],
    })
  }

  return generated
}

export const TOTAL_INDICATOR_COUNT = 241

export const indicators: Indicator[] = [
  ...handAuthored,
  ...generateFillerIndicators(TOTAL_INDICATOR_COUNT - handAuthored.length),
]
