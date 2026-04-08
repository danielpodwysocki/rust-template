<script setup lang="ts">
import { onMounted } from 'vue'
import { useGreeting } from '~/composables/useGreeting'

const { greeting, error, pending, load } = useGreeting()

onMounted(() => {
  load()
})
</script>

<template>
  <main>
    <h1>Rust Template</h1>
    <GreetingCard
      :greeting="greeting"
      :error="error"
      :pending="pending"
    />
  </main>
</template>
