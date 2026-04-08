import { $fetch } from 'ofetch'
import { z } from 'zod'

export const GreetingSchema = z.object({ message: z.string() })
export type Greeting = z.infer<typeof GreetingSchema>

/// Fetches a greeting from the Rust API via the Nuxt server proxy.
export async function fetchGreeting(): Promise<Greeting> {
  const raw: unknown = await $fetch('/backend/api/v1/greetings')
  return GreetingSchema.parse(raw)
}
