<template>
  <main class="space-y-6">
    <!-- Hero -->
    <section class="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
        Overview
      </p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight">
        Market radar for crypto assets
      </h1>
      <p class="mt-2 text-sm text-slate-300 max-w-2xl">
        Scan the market by market cap, volume and momentum. This is the high-level
        dashboard – move to the Screener for deeper filters.
      </p>
    </section>

    <!-- Table with top assets -->
    <section class="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-100">
          Top {{ limitedCount }} assets by market cap
        </h2>
        <div class="text-[11px] text-slate-400">
          Data source: CoinPaprika · Live
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-300">
        {{ errorMessage }}
      </div>

      <div v-else-if="pending" class="text-sm text-slate-300">
        Loading market data…
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-xs">
            <thead class="border-b border-white/10 text-[10px] uppercase tracking-wide text-slate-400">
              <tr>
                <th class="py-2 pr-3">#</th>
                <th class="py-2 pr-3">Asset</th>
                <th class="py-2 pr-3">Price</th>
                <th class="py-2 pr-3">% 24h</th>
                <th class="py-2 pr-3 hidden md:table-cell">% 7d</th>
                <th class="py-2 pr-3 text-right hidden sm:table-cell">Mkt Cap</th>
                <th class="py-2 pl-3 text-right hidden sm:table-cell">Vol 24h</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="asset in limitedAssets"
                :key="asset.id"
                class="border-b border-white/5 hover:bg-white/5"
              >
                <td class="py-2 pr-3 text-[11px] text-slate-400">
                  {{ asset.rank }}
                </td>
                <td class="py-2 pr-3 text-[11px]">
                  <span class="font-medium text-slate-100">
                    {{ asset.symbol }}
                  </span>
                  <span class="ml-1 text-slate-400">
                    · {{ asset.name }}
                  </span>
                </td>
                <td class="py-2 pr-3 text-[11px]">
                  {{ formatCurrency(asset.price) }}
                </td>
                <td
                  class="py-2 pr-3 text-[11px]"
                  :class="changeClass(asset.change24h)"
                >
                  {{ formatPercent(asset.change24h) }}
                </td>
                <td
                  class="hidden py-2 pr-3 text-[11px] md:table-cell"
                  :class="changeClass(asset.change7d)"
                >
                  {{ formatPercent(asset.change7d) }}
                </td>
                <td class="hidden py-2 pr-3 text-right text-[11px] sm:table-cell">
                  {{ formatCompact(asset.marketCap) }}
                </td>
                <td class="hidden py-2 pl-3 text-right text-[11px] sm:table-cell">
                  {{ formatCompact(asset.volume24h) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 text-[11px] text-slate-400">
          For advanced filters and sorting, the
          <span class="text-emerald-300">
            Screener
          </span>
          page is coming next.
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
type AssetSummary = {
  id: string
  name: string
  symbol: string
  rank: number
  price: number
  volume24h: number
  marketCap: number
  change1h: number
  change24h: number
  change7d: number
}

const { data, pending, error } = await useFetch<AssetSummary[]>('/api/assets/list', {
  query: { limit: 50 }
})

const limitedAssets = computed(() => data.value?.slice(0, 25) ?? [])
const limitedCount = computed(() => limitedAssets.value.length)

const errorMessage = computed(() => {
  if (!error.value) return ''
  return typeof error.value === 'string'
    ? error.value
    : 'Failed to load market data.'
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)

const formatPercent = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}%`

const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

const changeClass = (v: number) => {
  if (v > 0) return 'text-emerald-300'
  if (v < 0) return 'text-red-300'
  return 'text-slate-300'
}
</script>
