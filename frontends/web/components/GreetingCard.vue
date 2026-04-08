<script setup lang="ts">
import type { Greeting } from '~/api/greetings'

defineProps<{
  greeting: Greeting | null
  error: string | null
  pending: boolean
}>()
</script>

<template>
  <div class="greeting-card">
    <p v-if="pending">Loading...</p>
    <p v-else-if="error" class="error">Error: {{ error }}</p>
    <p v-else-if="greeting">{{ greeting.message }}</p>
    <p v-else>No greeting available.</p>
  </div>
</template>
