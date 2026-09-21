import { useQueryClient } from '@tanstack/react-query'
import { ApiRequestError } from '@/api/client'
import {
  submitDataPoint,
  submitDataPointsBatch,
  type SubmitDataPointInput,
} from '@/api/datapoints'
import { queryKeys } from '@/api/queryKeys'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useDataEntryStore } from '@/stores/dataEntryStore'
import { generateIdempotencyKey } from '@/utils/idempotency'

type SubmissionInput = Omit<SubmitDataPointInput, 'idempotencyKey'>

/**
 * Offline-first (FR-DC-8): offline, entries queue locally and sync later.
 * Online, they go straight to the API — but a network-level failure (not a
 * validation/duplicate error from the server) still falls back to the queue
 * rather than losing the entry.
 */
export function useSubmitDataPoint(indicatorId: string) {
  const online = useOnlineStatus()
  const enqueue = useDataEntryStore((state) => state.enqueue)
  const queryClient = useQueryClient()

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.indicators.dataPoints(indicatorId) })
  }

  async function submit(input: SubmissionInput): Promise<{ queued: boolean }> {
    if (!online) {
      enqueue(input)
      return { queued: true }
    }
    try {
      await submitDataPoint({ ...input, idempotencyKey: generateIdempotencyKey() })
      invalidate()
      return { queued: false }
    } catch (error) {
      if (error instanceof ApiRequestError) throw error
      enqueue(input)
      return { queued: true }
    }
  }

  async function submitBatch(items: SubmissionInput[]): Promise<{ queued: boolean }> {
    if (!online) {
      items.forEach((item) => enqueue(item))
      return { queued: true }
    }
    try {
      await submitDataPointsBatch(items.map((item) => ({ ...item, idempotencyKey: generateIdempotencyKey() })))
      invalidate()
      return { queued: false }
    } catch (error) {
      if (error instanceof ApiRequestError) throw error
      items.forEach((item) => enqueue(item))
      return { queued: true }
    }
  }

  return { submit, submitBatch, online }
}
