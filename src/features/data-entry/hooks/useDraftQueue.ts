import { useShallow } from 'zustand/react/shallow'
import { useDataEntryStore, type QueuedSubmission } from '@/stores/dataEntryStore'

/** The subset of the offline sync queue (FR-DC-8) waiting on this indicator. */
export function useDraftQueue(indicatorId: string): QueuedSubmission[] {
  return useDataEntryStore(
    useShallow((state) => state.queue.filter((item) => item.input.indicatorId === indicatorId)),
  )
}
