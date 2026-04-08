import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

import { $fetch } from 'ofetch'
import { fetchGreeting, GreetingSchema } from '~/api/greetings'

describe('GreetingSchema', () => {
  it('parses a valid greeting object', () => {
    const result = GreetingSchema.parse({ message: 'Hello!' })
    expect(result.message).toBe('Hello!')
  })

  it('throws on missing message field', () => {
    expect(() => GreetingSchema.parse({})).toThrow()
  })
})

describe('fetchGreeting', () => {
  beforeEach(() => {
    vi.mocked($fetch).mockReset()
  })

  it('fetches and parses a greeting', async () => {
    vi.mocked($fetch).mockResolvedValue({ message: 'Hello from Rust!' })
    const result = await fetchGreeting()
    expect(result).toEqual({ message: 'Hello from Rust!' })
    expect($fetch).toHaveBeenCalledWith('/backend/api/v1/greetings')
  })

  it('throws when response shape is invalid', async () => {
    vi.mocked($fetch).mockResolvedValue({ wrong: 'shape' })
    await expect(fetchGreeting()).rejects.toThrow()
  })
})
