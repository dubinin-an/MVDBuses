<template>
  <router-view />
</template>

<script setup>
import { getLineNumbers, getStops } from 'src/lib/basesUtils'

defineOptions({
  name: 'App'
});
  getStops()
  // getLineNumbers()
</script>
