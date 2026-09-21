import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { IndicatorDetailPage } from './IndicatorDetailPage'

function renderDetail(indicatorId: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/indicators/${indicatorId}`]}>
        <Routes>
          <Route path="/indicators/:indicatorId" element={<IndicatorDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('IndicatorDetailPage', () => {
  it('renders the §13 sample indicator with definition, targets and history', async () => {
    renderDetail('ind_eccde_cc03_9')

    expect(await screen.findByText('Number of new childcare centres operational')).toBeInTheDocument()
    expect(screen.getByText('Centre registers')).toBeInTheDocument()
    expect(screen.getByText('2026 target')).toBeInTheDocument()
    expect(screen.getByText('Latest reported value')).toBeInTheDocument()
    // Reported history table has real approved/submitted rows for this indicator.
    expect(screen.getAllByText('2026-Q1').length).toBeGreaterThan(0)
  })

  it('falls back to a narrative message for a notYetTracked baseline with no numeric history', async () => {
    renderDetail('ind_eccde_activity_registers')

    expect(await screen.findByText('Number of caregiver coaching sessions delivered')).toBeInTheDocument()
    expect(screen.getByText(/not yet tracked/i)).toBeInTheDocument()
  })

  it('shows convergence siblings for a shared-Goal indicator', async () => {
    renderDetail('ind_girls_education_goal')

    expect(await screen.findByText('Shares this Goal with')).toBeInTheDocument()
    expect(screen.getByText('GW-OOS04-2')).toBeInTheDocument()
    expect(screen.getByText('GW-WEE07-3')).toBeInTheDocument()
  })
})
