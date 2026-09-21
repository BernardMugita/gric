import { useAuthStore } from './authStore'

function resetStore() {
  useAuthStore.setState({ token: null, user: null, status: 'idle' })
  localStorage.clear()
}

describe('authStore', () => {
  beforeEach(resetStore)
  afterEach(resetStore)

  it('logs in a known demo account and stores the token + user', async () => {
    await useAuthStore.getState().login('sarah.nakato@gric.org', 'anything')

    const state = useAuthStore.getState()
    expect(state.status).toBe('authenticated')
    expect(state.token).toBeTruthy()
    expect(state.user?.roleId).toBe('mel_lead')
    expect(state.user?.permissions).toContain('baseline:establish')
  })

  it('rejects an unknown email and leaves the store unauthenticated', async () => {
    await expect(useAuthStore.getState().login('nobody@gric.org', 'x')).rejects.toThrow()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('hydrates from a persisted token by calling /me', async () => {
    await useAuthStore.getState().login('admin@gric.org', 'anything')
    const token = useAuthStore.getState().token

    // Simulate a fresh page load: user is gone, only the token persisted.
    useAuthStore.setState({ user: null, status: 'idle', token })
    await useAuthStore.getState().hydrate()

    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.roleId).toBe('system_admin')
  })

  it('logout clears the session', async () => {
    await useAuthStore.getState().login('admin@gric.org', 'anything')
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.status).toBe('unauthenticated')
  })
})
