import { ref, readonly } from 'vue'
import { fetchGreeting, type Greeting } from '~/api/greetings'

/// Composable that manages greeting state and loading lifecycle.
export function useGreeting() {
  const greeting = ref<Greeting | null>(null)
  const error = ref<string | null>(null)
  const pending = ref(false)

  async function load() {
    pending.value = true
    error.value = null
    try {
      greeting.value = await fetchGreeting()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      pending.value = false
    }
  }

  return {
    greeting: readonly(greeting),
    error: readonly(error),
    pending: readonly(pending),
    load,
  }
}
