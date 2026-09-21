import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useDataEntryStore } from '@/stores/dataEntryStore'

/** FR-DC-8 / NFR-2: shows the offline sync queue and surfaces conflicts — never a silent drop. */
export function OfflineQueueIndicator() {
  const online = useOnlineStatus()
  const queue = useDataEntryStore((state) => state.queue)
  const isSyncing = useDataEntryStore((state) => state.isSyncing)
  const syncQueue = useDataEntryStore((state) => state.syncQueue)
  const resolveConflict = useDataEntryStore((state) => state.resolveConflict)

  const pending = queue.filter((item) => item.status === 'pending' || item.status === 'error')
  const conflicts = queue.filter((item) => item.status === 'conflict')

  useEffect(() => {
    if (online && pending.length > 0 && !isSyncing) void syncQueue()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only on connectivity/queue-size change, not every render
  }, [online, pending.length])

  if (queue.length === 0 && online) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {isSyncing ? 'Syncing…' : queue.length > 0 ? `${queue.length} pending` : 'Online'}
          {conflicts.length > 0 && (
            <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-[10px]">
              {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {online ? 'Offline queue' : "You're offline — entries are saved locally"}
        </p>
        {queue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing queued.</p>
        ) : (
          <ul className="space-y-2">
            {queue.map((item) => (
              <li key={item.localId} className="rounded-md border p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span>
                    {item.input.indicatorId} · {item.input.period}
                  </span>
                  {item.status === 'conflict' && <AlertTriangle className="size-4 text-destructive" />}
                </div>
                {item.status === 'conflict' ? (
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-destructive">
                      Someone already submitted this indicator/period/slice.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => resolveConflict(item.localId, 'revise')}>
                        Replace it
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => resolveConflict(item.localId, 'discard')}>
                        Discard mine
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {item.status === 'error' ? (item.errorMessage ?? 'Failed — will retry') : item.status}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {online && pending.length > 0 && (
          <Button size="sm" className="mt-3 w-full gap-1.5" onClick={() => syncQueue()} disabled={isSyncing}>
            <RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync now
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
