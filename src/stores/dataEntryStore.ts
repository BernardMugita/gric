import { del, get, set as idbSet } from 'idb-keyval'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { submitDataPoint, type SubmitDataPointInput } from '@/api/datapoints'
import { ApiRequestError } from '@/api/client'
import { generateIdempotencyKey } from '@/utils/idempotency'

export type QueuedSubmissionStatus = 'pending' | 'syncing' | 'conflict' | 'error'

export interface QueuedSubmission {
  localId: string
  input: SubmitDataPointInput
  queuedAt: string
  status: QueuedSubmissionStatus
  errorMessage?: string
}

interface DataEntryState {
  queue: QueuedSubmission[]
  isSyncing: boolean
  enqueue: (input: Omit<SubmitDataPointInput, 'idempotencyKey'>) => void
  removeFromQueue: (localId: string) => void
  syncQueue: () => Promise<void>
  resolveConflict: (localId: string, action: 'revise' | 'discard') => Promise<void>
}

// idb-keyval-backed storage — the offline queue is meant to survive well
// beyond localStorage's ~5MB string-only quota once evidence capture grows.
const idbStorage: StateStorage = {
  getItem: async (name) => (await get(name)) ?? null,
  setItem: async (name, value) => idbSet(name, value),
  removeItem: async (name) => del(name),
}

export const useDataEntryStore = create<DataEntryState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,

      enqueue: (input) => {
        const submission: QueuedSubmission = {
          localId: generateIdempotencyKey(),
          input: { ...input, idempotencyKey: generateIdempotencyKey() },
          queuedAt: new Date().toISOString(),
          status: 'pending',
        }
        set((state) => ({ queue: [...state.queue, submission] }))
      },

      removeFromQueue: (localId) => set((state) => ({ queue: state.queue.filter((q) => q.localId !== localId) })),

      syncQueue: async () => {
        if (get().isSyncing) return
        set({ isSyncing: true })

        for (const item of get().queue) {
          if (item.status === 'conflict') continue // needs an explicit user decision, see resolveConflict

          set((state) => ({
            queue: state.queue.map((q) => (q.localId === item.localId ? { ...q, status: 'syncing' } : q)),
          }))

          try {
            await submitDataPoint(item.input)
            set((state) => ({ queue: state.queue.filter((q) => q.localId !== item.localId) }))
          } catch (error) {
            // NFR-2: a sync conflict is surfaced, never silently dropped or overwritten.
            const isConflict = error instanceof ApiRequestError && error.status === 409
            set((state) => ({
              queue: state.queue.map((q) =>
                q.localId === item.localId
                  ? {
                      ...q,
                      status: isConflict ? 'conflict' : 'error',
                      errorMessage: error instanceof Error ? error.message : 'Sync failed',
                    }
                  : q,
              ),
            }))
          }
        }

        set({ isSyncing: false })
      },

      resolveConflict: async (localId, action) => {
        const item = get().queue.find((q) => q.localId === localId)
        if (!item) return

        if (action === 'discard') {
          get().removeFromQueue(localId)
          return
        }

        try {
          await submitDataPoint({ ...item.input, revise: true })
          get().removeFromQueue(localId)
        } catch (error) {
          set((state) => ({
            queue: state.queue.map((q) =>
              q.localId === localId
                ? { ...q, status: 'error', errorMessage: error instanceof Error ? error.message : 'Retry failed' }
                : q,
            ),
          }))
        }
      },
    }),
    {
      name: 'gric-data-entry-queue',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ queue: state.queue }) as DataEntryState,
    },
  ),
)
