import { del } from 'idb-keyval'
import { useDataEntryStore } from './dataEntryStore'

const baseInput = {
  indicatorId: 'ind_eccde_cc03_9',
  period: '2026-Q2',
  countryId: 'country_ke',
  disaggregationSlice: { dim_country: 'KE' },
  value: { valueType: 'numeric' as const, numericValue: 47 },
  status: 'submitted' as const,
}

async function resetStore() {
  useDataEntryStore.setState({ queue: [], isSyncing: false })
  await del('gric-data-entry-queue')
}

describe('dataEntryStore', () => {
  beforeEach(resetStore)
  afterEach(resetStore)

  it('enqueues a submission with a generated idempotency key', () => {
    useDataEntryStore.getState().enqueue(baseInput)

    const { queue } = useDataEntryStore.getState()
    expect(queue).toHaveLength(1)
    expect(queue[0].status).toBe('pending')
    expect(queue[0].input.idempotencyKey).toBeTruthy()
  })

  it('syncs a queued submission and removes it once accepted', async () => {
    useDataEntryStore.getState().enqueue(baseInput)

    await useDataEntryStore.getState().syncQueue()

    expect(useDataEntryStore.getState().queue).toHaveLength(0)
  })

  it('marks a duplicate submission as a conflict instead of dropping or overwriting it', async () => {
    // First one goes straight to the "server" so the queued one collides with it.
    useDataEntryStore.getState().enqueue(baseInput)
    await useDataEntryStore.getState().syncQueue()

    useDataEntryStore.getState().enqueue(baseInput)
    await useDataEntryStore.getState().syncQueue()

    const { queue } = useDataEntryStore.getState()
    expect(queue).toHaveLength(1)
    expect(queue[0].status).toBe('conflict')
  })

  it('resolveConflict "revise" resubmits with revise:true and clears the queue entry', async () => {
    useDataEntryStore.getState().enqueue(baseInput)
    await useDataEntryStore.getState().syncQueue()
    useDataEntryStore.getState().enqueue(baseInput)
    await useDataEntryStore.getState().syncQueue()

    const conflictId = useDataEntryStore.getState().queue[0].localId
    await useDataEntryStore.getState().resolveConflict(conflictId, 'revise')

    expect(useDataEntryStore.getState().queue).toHaveLength(0)
  })

  it('resolveConflict "discard" just removes the queue entry', async () => {
    useDataEntryStore.getState().enqueue(baseInput)
    await useDataEntryStore.getState().syncQueue()
    useDataEntryStore.getState().enqueue(baseInput)
    await useDataEntryStore.getState().syncQueue()

    const conflictId = useDataEntryStore.getState().queue[0].localId
    await useDataEntryStore.getState().resolveConflict(conflictId, 'discard')

    expect(useDataEntryStore.getState().queue).toHaveLength(0)
  })
})
