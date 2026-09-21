import {
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from 'cn'
import { useScopedPermissions } from '@/hooks/useScopedPermissions'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  requiresPermission?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Indicator Catalog', icon: ClipboardList, active: false },
  { label: 'Data Entry', icon: ListChecks, active: false },
  { label: 'Imports', icon: Upload, active: false },
  { label: 'Reports', icon: ShieldCheck, active: false },
  { label: 'Admin', icon: Users, active: false, requiresPermission: 'user:manage' },
]

export function Sidebar() {
  const { hasPermission } = useScopedPermissions()

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4 font-heading text-sm font-semibold">
        GRiC MEL System
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.filter((item) => !item.requiresPermission || hasPermission(item.requiresPermission)).map(
          (item) => (
            <div
              key={item.label}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm',
                item.active
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <span className="flex items-center gap-2">
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </span>
              {!item.active && (
                <Badge variant="outline" className="text-[10px]">
                  Soon
                </Badge>
              )}
            </div>
          ),
        )}
      </nav>
    </aside>
  )
}
