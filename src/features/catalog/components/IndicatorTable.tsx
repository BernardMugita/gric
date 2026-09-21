import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Indicator } from '@/types/indicator'

interface IndicatorTableProps {
  indicators: Indicator[]
  programmeNames: Record<string, string>
  isLoading: boolean
}

export function IndicatorTable({ indicators, programmeNames, isLoading }: IndicatorTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Indicator</TableHead>
          <TableHead>Programme</TableHead>
          <TableHead>Result level</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Frequency</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <TableCell key={`skeleton-cell-${cellIndex}`}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}

        {!isLoading && indicators.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
              No indicators match these filters.
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          indicators.map((indicator) => (
            <TableRow
              key={indicator.id}
              className="cursor-pointer"
              onClick={() => navigate(`/indicators/${indicator.id}`)}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {indicator.indicatorCode}
              </TableCell>
              <TableCell className="max-w-md">
                <p className="truncate font-medium">{indicator.indicatorText}</p>
                <p className="truncate text-xs text-muted-foreground">{indicator.resultStatement}</p>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {programmeNames[indicator.programmeId] ?? '—'}
              </TableCell>
              <TableCell className="text-sm">{indicator.resultLevel}</TableCell>
              <TableCell>
                <StatusBadge status={indicator.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{indicator.frequency.label}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
