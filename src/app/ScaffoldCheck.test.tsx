import { renderWithProviders, screen } from '@/test/test-utils'
import { ScaffoldCheck } from './ScaffoldCheck'

describe('ScaffoldCheck', () => {
  it('renders the scaffold confirmation card', () => {
    renderWithProviders(<ScaffoldCheck />)
    expect(screen.getByText(/GRiC MEL System/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /it works/i })).toBeInTheDocument()
  })
})
