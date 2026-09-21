import type { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

/**
 * Opens a shadcn/Radix Select and picks an option via `fireEvent` rather than
 * `userEvent.click`. Radix Select + userEvent's pointer-capture simulation
 * leaves the *next* test's identical interaction unable to open the same
 * Select — reproducible even in a bare, app-free repro — while `fireEvent`
 * sidesteps it entirely. Use this for every Select in a test file that
 * exercises more than one Select interaction.
 */
export async function selectOption(trigger: HTMLElement, optionName: string | RegExp) {
  fireEvent.pointerDown(trigger, { button: 0 })
  fireEvent.click(trigger)
  const option = await screen.findByRole('option', { name: optionName })
  fireEvent.click(option)
}

export * from '@testing-library/react'
