import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('~/api/greetings', () => ({
  fetchGreeting: vi.fn(),
}))

import { fetchGreeting } from '~/api/greetings'
import { useGreeting } from '~/composables/useGreeting'

describe('useGreeting', () => {
  beforeEach(() => {
    vi.mocked(fetchGreeting).mockReset()
  })

  it('sets greeting on successful load', async () => {
    vi.mocked(fetchGreeting).mockResolvedValue({ message: 'Hello!' })
    const { greeting, error, pending, load } = useGreeting()

    expect(pending.value).toBe(false)
    const promise = load()
    expect(pending.value).toBe(true)
    await promise
    expect(pending.value).toBe(false)
    expect(greeting.value).toEqual({ message: 'Hello!' })
    expect(error.value).toBeNull()
  })

  it('sets error message when fetch throws an Error', async () => {
    vi.mocked(fetchGreeting).mockRejectedValue(new Error('network failure'))
    const { greeting, error, pending, load } = useGreeting()

    await load()
    expect(pending.value).toBe(false)
    expect(greeting.value).toBeNull()
    expect(error.value).toBe('network failure')
  })

  it('sets generic error for non-Error throws', async () => {
    vi.mocked(fetchGreeting).mockRejectedValue('string error')
    const { greeting, error, load } = useGreeting()

    await load()
    expect(error.value).toBe('Unknown error')
  })
})
