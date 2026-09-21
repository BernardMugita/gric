import type { FrequencyLabel } from '@/types/enums'

function currentTerm(): number {
  const month = new Date().getMonth() + 1
  if (month <= 4) return 1
  if (month <= 8) return 2
  return 3
}

function currentQuarter(): number {
  return Math.ceil((new Date().getMonth() + 1) / 3)
}

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

/**
 * Suggests recent reporting periods for a frequency, most recent first — the
 * digital equivalent of the collection calendar (FR-MW-1 computes due dates
 * the same way; this just offers the same set as pickable options here).
 * "Per cycle" and "Milestone-based" have no fixed calendar shape, so callers
 * fall back to free text for those.
 */
export function generateRecentPeriods(frequency: FrequencyLabel, count = 4): string[] {
  const year = new Date().getFullYear()

  switch (frequency) {
    case 'Weekly': {
      const now = new Date()
      return Array.from({ length: count }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - i * 7)
        return `${d.getFullYear()}-W${String(isoWeek(d)).padStart(2, '0')}`
      })
    }
    case 'Termly': {
      const periods: string[] = []
      let y = year
      let t = currentTerm()
      for (let i = 0; i < count; i += 1) {
        periods.push(`${y}-T${t}`)
        t -= 1
        if (t < 1) {
          t = 3
          y -= 1
        }
      }
      return periods
    }
    case 'Quarterly': {
      const periods: string[] = []
      let y = year
      let q = currentQuarter()
      for (let i = 0; i < count; i += 1) {
        periods.push(`${y}-Q${q}`)
        q -= 1
        if (q < 1) {
          q = 4
          y -= 1
        }
      }
      return periods
    }
    case 'Bi-annually': {
      const periods: string[] = []
      let y = year
      let h = new Date().getMonth() < 6 ? 1 : 2
      for (let i = 0; i < count; i += 1) {
        periods.push(`${y}-H${h}`)
        h -= 1
        if (h < 1) {
          h = 2
          y -= 1
        }
      }
      return periods
    }
    case 'Annually':
      return Array.from({ length: count }, (_, i) => String(year - i))
    case 'Per cycle':
    case 'Milestone-based':
    default:
      return []
  }
}
