import { StatusBadge } from '@/components/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { DataPoint } from '@/types/datapoint'
import { formatIndicatorValue } from '@/utils/formatValue'

interface DataPointHistoryTableProps {
  dataPoints: DataPoint[]
  countryNames: Record<string, string>
  isLoading: boolean
}

export function DataPointHistoryTable({ dataPoints, countryNames, isLoading }: DataPointHistoryTableProps) {
  const sorted = [...dataPoints].sort((a, b) => b.period.localeCompare(a.period))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Comment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={5}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          </TableRow>
        )}
        {!isLoading && sorted.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
              No data reported yet.
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          sorted.map((dataPoint) => (
            <TableRow key={dataPoint.id}>
              <TableCell>{dataPoint.period}</TableCell>
              <TableCell>{countryNames[dataPoint.countryId] ?? dataPoint.countryId}</TableCell>
              <TableCell>{formatIndicatorValue(dataPoint.value)}</TableCell>
              <TableCell>
                <StatusBadge status={dataPoint.status} />
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {dataPoint.comment ?? '—'}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
