import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Temporary landing screen that proves the tooling scaffold (Tailwind,
// shadcn/ui, React Router, TanStack Query) is wired correctly. Replaced by
// the real AppShell/auth flow in a later phase.
export function ScaffoldCheck() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            GRiC MEL System
            <Badge variant="secondary">scaffold</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tooling scaffold is up: Tailwind, shadcn/ui, React Router and
            TanStack Query are wired. Feature screens land next.
          </p>
          <Button>It works</Button>
        </CardContent>
      </Card>
    </div>
  )
}
