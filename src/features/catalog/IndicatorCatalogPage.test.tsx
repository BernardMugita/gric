import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useCatalogStore } from '@/stores/catalogStore'
import { IndicatorCatalogPage } from './IndicatorCatalogPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/indicators']}>
        <Routes>
          <Route path="/indicators" element={<IndicatorCatalogPage />} />
          <Route path="/indicators/:indicatorId" element={<div>Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('IndicatorCatalogPage', () => {
  afterEach(() => {
    useCatalogStore.setState({ filters: {}, page: 1 })
  })

  it('lists indicators and shows the total count', async () => {
    renderPage()

    expect(await screen.findByText('ECCDE-CC03-9')).toBeInTheDocument()
    expect(await screen.findByText(/241 indicators/i)).toBeInTheDocument()
  })

  it('filters by programme', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('ECCDE-CC03-9')

    await user.click(screen.getByRole('combobox', { name: /programmes/i }))
    await user.click(await screen.findByRole('option', { name: 'Girls and Women' }))

    await waitFor(() => {
      expect(screen.queryByText('ECCDE-CC03-9')).not.toBeInTheDocument()
    })
    expect(await screen.findByText('GW-GE09-1')).toBeInTheDocument()
  })

  it('navigates to the detail page when a row is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const row = (await screen.findByText('ECCDE-CC03-9')).closest('tr')!
    await user.click(within(row).getByText('ECCDE-CC03-9'))

    expect(await screen.findByText('Detail Page')).toBeInTheDocument()
  })
})
