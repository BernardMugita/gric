import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { IndicatorCatalogPage } from '@/features/catalog/IndicatorCatalogPage'
import { IndicatorDetailPage } from '@/features/catalog/IndicatorDetailPage'
import { BulkEntryGridPage } from '@/features/data-entry/BulkEntryGridPage'
import { DataEntryFormPage } from '@/features/data-entry/DataEntryFormPage'
import { AdminPlaceholder } from './AdminPlaceholder'
import { HomePage } from './HomePage'
import { AppShell } from './layout/AppShell'
import { RequireAuth } from './layout/RequireAuth'
import { RequireScope } from './layout/RequireScope'

// Route tree grows feature by feature (see build plan): imports, review,
// dashboards, reports.
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
            path: 'indicators/:indicatorId',
            element: <RequireScope permission="datapoint:enter" />,
            children: [
              { path: 'data-entry', element: <DataEntryFormPage /> },
              { path: 'bulk-entry', element: <BulkEntryGridPage /> },
            ],
          },
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
