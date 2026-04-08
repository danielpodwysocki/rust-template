import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GreetingCard from '~/components/GreetingCard.vue'

describe('GreetingCard', () => {
  it('shows loading state when pending', () => {
    const wrapper = mount(GreetingCard, {
      props: { pending: true, greeting: null, error: null },
    })
    expect(wrapper.text()).toContain('Loading...')
  })

  it('shows error message when error is set', () => {
    const wrapper = mount(GreetingCard, {
      props: { pending: false, greeting: null, error: 'network failure' },
    })
    expect(wrapper.text()).toContain('Error: network failure')
  })

  it('shows greeting message when greeting is set', () => {
    const wrapper = mount(GreetingCard, {
      props: { pending: false, greeting: { message: 'Hello from Rust!' }, error: null },
    })
    expect(wrapper.text()).toContain('Hello from Rust!')
  })

  it('shows fallback when all are null/false', () => {
    const wrapper = mount(GreetingCard, {
      props: { pending: false, greeting: null, error: null },
    })
    expect(wrapper.text()).toContain('No greeting available.')
  })
})
