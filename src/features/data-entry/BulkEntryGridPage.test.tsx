import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { selectOption } from '@/test/test-utils'
import { useAuthStore } from '@/stores/authStore'
import type { Me } from '@/types/user'
import { BulkEntryGridPage } from './BulkEntryGridPage'

const programmeOfficer: Me = {
  id: 'user_po_eccde_ke',
  name: 'Amara Otieno',
  email: 'amara.otieno@gric.org',
  roleId: 'programme_officer',
  scopedProgrammeIds: ['prog_eccde', 'prog_capacity_development'],
  scopedCountryIds: ['country_ke'],
  permissions: ['datapoint:enter', 'datapoint:submit'],
}

async function selectFirstPeriod(trigger: HTMLElement) {
  fireEvent.pointerDown(trigger, { button: 0 })
  fireEvent.click(trigger)
  const options = await screen.findAllByRole('option')
  fireEvent.click(options[0])
}

function renderPage(indicatorId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/indicators/${indicatorId}/bulk-entry`]}>
        <Routes>
          <Route path="/indicators/:indicatorId/bulk-entry" element={<BulkEntryGridPage />} />
          <Route path="/indicators/:indicatorId" element={<div>Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BulkEntryGridPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ status: 'authenticated', token: 'tok', user: programmeOfficer })
  })
  afterEach(() => {
    useAuthStore.setState({ token: null, user: null, status: 'idle' })
  })

  it('submits multiple rows in one batch', async () => {
    const user = userEvent.setup()
    renderPage('ind_capacity_wellbeing_goal')

    expect(await screen.findByText('Number of CBOs delivering services at target quality standard')).toBeInTheDocument()

    await selectFirstPeriod(screen.getByRole('combobox', { name: 'Period' }))

    await selectOption(screen.getByRole('combobox', { name: 'Country for row 1' }), 'Kenya')
    await user.type(screen.getByLabelText('Value for row 1'), '5')

    await user.click(screen.getByRole('button', { name: /add row/i }))
    await selectOption(screen.getByRole('combobox', { name: 'Country for row 2' }), 'Kenya')
    await user.type(screen.getByLabelText('Value for row 2'), '7')

    expect(screen.getByText('2 rows')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit 2 rows/i }))

    expect(await screen.findByText('Detail Page')).toBeInTheDocument()
  })

  it('requires a period before submitting', async () => {
    const user = userEvent.setup()
    renderPage('ind_capacity_wellbeing_goal')

    expect(await screen.findByText('Number of CBOs delivering services at target quality standard')).toBeInTheDocument()
    await selectOption(screen.getByRole('combobox', { name: 'Country for row 1' }), 'Kenya')
    await user.type(screen.getByLabelText('Value for row 1'), '5')

    await user.click(screen.getByRole('button', { name: /submit 1 row/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/period is required/i))
  })

  it('removes a row and disables removing the last remaining row', async () => {
    const user = userEvent.setup()
    renderPage('ind_capacity_wellbeing_goal')
    await screen.findByText('Number of CBOs delivering services at target quality standard')

    expect(screen.getByRole('button', { name: 'Remove row 1' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /add row/i }))
    expect(screen.getByText('2 rows')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove row 2' }))
    expect(screen.getByText('1 row')).toBeInTheDocument()
  })
})
