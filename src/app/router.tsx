import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { IndicatorCatalogPage } from '@/features/catalog/IndicatorCatalogPage'
import { IndicatorDetailPage } from '@/features/catalog/IndicatorDetailPage'
import { AdminPlaceholder } from './AdminPlaceholder'
import { HomePage } from './HomePage'
import { AppShell } from './layout/AppShell'
import { RequireAuth } from './layout/RequireAuth'
import { RequireScope } from './layout/RequireScope'

// Route tree grows feature by feature (see build plan): data-entry,
// imports, review, dashboards, reports.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'indicators', element: <IndicatorCatalogPage /> },
          { path: 'indicators/:indicatorId', element: <IndicatorDetailPage /> },
          {
            path: 'admin',
            element: <RequireScope permission="user:manage" />,
            children: [{ index: true, element: <AdminPlaceholder /> }],
          },
        ],
      },
    ],
  },
])
