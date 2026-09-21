import { generateRecentPeriods } from './period'

describe('generateRecentPeriods', () => {
  it('returns no suggestions for milestone-based or per-cycle cadences', () => {
    expect(generateRecentPeriods('Milestone-based')).toEqual([])
    expect(generateRecentPeriods('Per cycle')).toEqual([])
  })

  it('generates the requested count of quarterly periods, most recent first', () => {
    const periods = generateRecentPeriods('Quarterly', 4)
    expect(periods).toHaveLength(4)
    expect(periods[0]).toMatch(/^\d{4}-Q[1-4]$/)
    // Each period should be strictly older than the previous one.
    expect(periods).toEqual([...periods].sort().reverse())
  })

  it('generates annual periods as plain years', () => {
    const periods = generateRecentPeriods('Annually', 3)
    const currentYear = new Date().getFullYear()
    expect(periods).toEqual([String(currentYear), String(currentYear - 1), String(currentYear - 2)])
  })
})
