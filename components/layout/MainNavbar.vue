<template>
  <header class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <div class="flex items-center gap-2">
      <div class="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500" />
      <div>
        <div class="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
          Radar
        </div>
        <div class="text-sm font-semibold">
          Crypto Market Radar
        </div>
      </div>
    </div>

    <nav class="flex items-center gap-3 text-xs">
      <NuxtLink
        to="/"
        class="rounded-full px-3 py-1.5 transition hover:bg-white/10"
        :class="isActive('/')"
      >
        Dashboard
      </NuxtLink>
      <NuxtLink
        to="/screener"
        class="rounded-full px-3 py-1.5 transition hover:bg-white/10"
        :class="isActive('/screener')"
      >
        Screener
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()

const isActive = (path: string) => {
  return route.path === path ? 'bg-white/10' : 'text-slate-300'
}
</script>
