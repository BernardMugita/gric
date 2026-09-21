import { computeSum, sumMismatches } from './disaggregation'

describe('computeSum', () => {
  it('sums defined values and ignores undefined ones', () => {
    expect(computeSum([10, 20, undefined])).toBe(30)
    expect(computeSum([])).toBe(0)
  })
})

describe('sumMismatches', () => {
  it('flags a manual total that disagrees with the computed sum', () => {
    expect(sumMismatches(30, 25)).toBe(true)
  })

  it('does not flag when the manual total matches', () => {
    expect(sumMismatches(30, 30)).toBe(false)
  })

  it('does not flag when no manual total was entered', () => {
    expect(sumMismatches(30, undefined)).toBe(false)
  })
})
