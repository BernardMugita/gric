import { createBrowserRouter } from 'react-router-dom'
import { ScaffoldCheck } from './ScaffoldCheck'

// Route tree grows feature by feature (see build plan): auth, catalog,
// data-entry, imports, review, dashboards, reports, admin.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <ScaffoldCheck />,
  },
])
