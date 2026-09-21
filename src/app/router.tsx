import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { AdminPlaceholder } from './AdminPlaceholder'
import { HomePage } from './HomePage'
import { AppShell } from './layout/AppShell'
import { RequireAuth } from './layout/RequireAuth'
import { RequireScope } from './layout/RequireScope'

// Route tree grows feature by feature (see build plan): catalog,
// data-entry, imports, review, dashboards, reports.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <HomePage /> },
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
