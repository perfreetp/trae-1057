<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { initMockData } from '@/utils/mockData'

onMounted(() => {
  initMockData()
})
</script>
