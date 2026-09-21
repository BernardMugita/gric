import { getIndicator, listIndicators } from './indicators'
import { ApiRequestError } from './client'

describe('indicators API contract', () => {
  it('returns the §13 sample shape for GET /indicators/:id', async () => {
    const { data, meta, errors } = await getIndicator('ind_eccde_cc03_9')

    expect(errors).toEqual([])
    expect(meta).toBeDefined()
    expect(data.indicatorCode).toBe('ECCDE-CC03-9')
    expect(data.resultLevel).toBe('Output')
    expect(data.baseline.valueType).toBe('numeric')
    expect(data.targets).toHaveLength(3)
  })

  it('paginates GET /indicators and reports total in meta', async () => {
    const { data, meta } = await listIndicators({ pageSize: 10 })

    expect(data).toHaveLength(10)
    expect(meta.total).toBeGreaterThan(200)
    expect(meta.hasMore).toBe(true)
  })

  it('filters by programmeId', async () => {
    const { data } = await listIndicators({ programmeId: 'prog_eccde', pageSize: 500 })

    expect(data.length).toBeGreaterThan(0)
    expect(data.every((indicator) => indicator.programmeId === 'prog_eccde')).toBe(true)
  })

  it('throws ApiRequestError with a 404 envelope for an unknown indicator', async () => {
    await expect(getIndicator('does-not-exist')).rejects.toBeInstanceOf(ApiRequestError)
  })
})
