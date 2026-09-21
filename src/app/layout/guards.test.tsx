import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { Me } from '@/types/user'
import { RequireAuth } from './RequireAuth'
import { RequireScope } from './RequireScope'

const systemAdmin: Me = {
  id: 'user_system_admin',
  name: 'System Administrator',
  email: 'admin@gric.org',
  roleId: 'system_admin',
  scopedProgrammeIds: [],
  scopedCountryIds: [],
  permissions: ['user:manage', 'scope:manage', 'auditlog:view'],
}

const programmeOfficer: Me = {
  id: 'user_po_eccde_ke',
  name: 'Amara Otieno',
  email: 'amara.otieno@gric.org',
  roleId: 'programme_officer',
  scopedProgrammeIds: ['prog_eccde'],
  scopedCountryIds: ['country_ke'],
  permissions: ['datapoint:enter', 'datapoint:submit', 'dashboard:view_own_programme'],
}

afterEach(() => {
  useAuthStore.setState({ token: null, user: null, status: 'idle' })
})

describe('RequireAuth', () => {
  it('redirects to /login when unauthenticated', () => {
    useAuthStore.setState({ status: 'unauthenticated', token: null, user: null })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders the route when authenticated', () => {
    useAuthStore.setState({ status: 'authenticated', token: 'tok', user: systemAdmin })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})

describe('RequireScope', () => {
  function renderAdminRoute() {
    return render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<RequireScope permission="user:manage" />}>
            <Route index element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
  }

  it('blocks a role missing the required permission', () => {
    useAuthStore.setState({ status: 'authenticated', token: 'tok', user: programmeOfficer })
    renderAdminRoute()

    expect(screen.getByText('Not authorized')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('allows a role with the required permission', () => {
    useAuthStore.setState({ status: 'authenticated', token: 'tok', user: systemAdmin })
    renderAdminRoute()

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
})
