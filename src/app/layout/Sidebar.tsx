import { cn } from 'cn'
import {
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useScopedPermissions } from '@/hooks/useScopedPermissions'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  path?: string
  requiresPermission?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Indicator Catalog', icon: ClipboardList, path: '/indicators' },
  { label: 'Data Entry', icon: ListChecks },
  { label: 'Imports', icon: Upload },
  { label: 'Reports', icon: ShieldCheck },
  { label: 'Admin', icon: Users, path: '/admin', requiresPermission: 'user:manage' },
]

export function Sidebar() {
  const { hasPermission } = useScopedPermissions()
  const location = useLocation()

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4 font-heading text-sm font-semibold">
        GRiC MEL System
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.filter((item) => !item.requiresPermission || hasPermission(item.requiresPermission)).map(
          (item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : Boolean(item.path && location.pathname.startsWith(item.path))
            const content = (
              <>
                <span className="flex items-center gap-2">
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </span>
                {!item.path && (
                  <Badge variant="outline" className="text-[10px]">
                    Soon
                  </Badge>
                )}
              </>
            )
            const className = cn(
              'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm',
              isActive
                ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                : 'text-muted-foreground',
              item.path && !isActive && 'hover:bg-sidebar-accent/50',
            )

            return item.path ? (
              <Link key={item.label} to={item.path} aria-current={isActive ? 'page' : undefined} className={className}>
                {content}
              </Link>
            ) : (
              <div key={item.label} className={className}>
                {content}
              </div>
            )
          },
        )}
      </nav>
    </aside>
  )
}
