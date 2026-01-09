<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
    <div
      class="pointer-events-none fixed inset-x-0 top-0 mx-auto h-64 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl"
    />
    <div class="relative mx-auto max-w-6xl px-4 py-4 space-y-6">
      <MainNavbar />
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainNavbar from '~/components/layout/MainNavbar.vue'
</script>
