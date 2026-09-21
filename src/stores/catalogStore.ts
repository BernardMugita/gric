import { create } from 'zustand'

export interface CatalogFilters {
  programmeId?: string
  domainId?: string
  resultLevel?: string
  status?: string
  sphereOfAccountability?: string
  genderIntegrationLevel?: string
  responsibleRoleId?: string
}

interface CatalogState {
  filters: CatalogFilters
  page: number
  setFilter: <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => void
  resetFilters: () => void
  setPage: (page: number) => void
}

export const useCatalogStore = create<CatalogState>((set) => ({
  filters: {},
  page: 1,
  setFilter: (key, value) =>
    set((state) => {
      const filters: CatalogFilters = { ...state.filters, [key]: value }
      // Domain options depend on the selected programme — clear it when the programme changes.
      if (key === 'programmeId') filters.domainId = undefined
      return { filters, page: 1 }
    }),
  resetFilters: () => set({ filters: {}, page: 1 }),
  setPage: (page) => set({ page }),
}))
