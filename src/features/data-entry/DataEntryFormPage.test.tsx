import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { selectOption } from '@/test/test-utils'
import { useAuthStore } from '@/stores/authStore'
import { useDataEntryStore } from '@/stores/dataEntryStore'
import type { Me } from '@/types/user'
import { DataEntryFormPage } from './DataEntryFormPage'

const programmeOfficer: Me = {
  id: 'user_po_eccde_ke',
  name: 'Amara Otieno',
  email: 'amara.otieno@gric.org',
  roleId: 'programme_officer',
  scopedProgrammeIds: ['prog_eccde'],
  scopedCountryIds: ['country_ke'],
  permissions: ['datapoint:enter', 'datapoint:submit', 'dashboard:view_own_programme'],
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
      <MemoryRouter initialEntries={[`/indicators/${indicatorId}/data-entry`]}>
        <Routes>
          <Route path="/indicators/:indicatorId/data-entry" element={<DataEntryFormPage />} />
          <Route path="/indicators/:indicatorId" element={<div>Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DataEntryFormPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ status: 'authenticated', token: 'tok', user: programmeOfficer })
  })
  afterEach(() => {
    useAuthStore.setState({ token: null, user: null, status: 'idle' })
    useDataEntryStore.setState({ queue: [], isSyncing: false })
  })

  it('submits a simple numeric indicator for review', async () => {
    const user = userEvent.setup()
    // No evidence requirement and no Sex breakdown — keeps this test focused on the plain path.
    renderPage('ind_capacity_wellbeing_goal')

    expect(await screen.findByText('Number of CBOs delivering services at target quality standard')).toBeInTheDocument()

    await selectFirstPeriod(screen.getByRole('combobox', { name: 'Period' }))
    await selectOption(screen.getByRole('combobox', { name: 'Country' }), 'Kenya')
    await user.type(screen.getByLabelText('Value'), '18')
    await user.click(screen.getByRole('button', { name: /submit for review/i }))

    expect(await screen.findByText('Detail Page')).toBeInTheDocument()
  })

  it('blocks submission when evidence is required but missing', async () => {
    const user = userEvent.setup()
    // ind_capacity_activity_training has evidenceRequired: true.
    renderPage('ind_capacity_activity_training')

    expect(await screen.findByText('Number of CBO staff trained')).toBeInTheDocument()

    await selectFirstPeriod(screen.getByRole('combobox', { name: 'Period' }))
    await selectOption(screen.getByRole('combobox', { name: 'Country' }), 'Kenya')
    await user.type(screen.getByLabelText('Value'), '10')

    await user.click(screen.getByRole('button', { name: /submit for review/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/evidence is required/i)
  })

  it('renders a per-sex breakdown with a computed total for Sex-disaggregated indicators', async () => {
    renderPage('ind_learning_flnl_pct')

    expect(await screen.findByText('% of assessed learners reading at grade level')).toBeInTheDocument()
    expect(screen.getByLabelText('Male')).toBeInTheDocument()
    expect(screen.getByLabelText('Female')).toBeInTheDocument()
    expect(screen.getByText(/computed total: 0/i)).toBeInTheDocument()
  })

  it('queues the entry offline when there is no connection', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    // No evidence requirement and no Sex breakdown — keeps this test focused on the offline path.
    renderPage('ind_capacity_wellbeing_goal')

    expect(await screen.findByText(/you're offline/i)).toBeInTheDocument()

    await selectFirstPeriod(screen.getByRole('combobox', { name: 'Period' }))
    await selectOption(screen.getByRole('combobox', { name: 'Country' }), 'Kenya')
    await user.type(screen.getByLabelText('Value'), '15')
    await user.click(screen.getByRole('button', { name: /submit for review/i }))

    await waitFor(() => expect(useDataEntryStore.getState().queue).toHaveLength(1))

    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })
})
