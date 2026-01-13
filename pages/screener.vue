<template>
  <main class="space-y-4">
    <!-- Header -->
    <section class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
        Screener
      </p>
      <h1 class="mt-1 text-lg font-semibold">
        Market screener & filters
      </h1>
      <p class="mt-1 text-xs text-slate-300 max-w-2xl">
        Filter assets by market cap, volume and performance. This is the core radar view
        powered by live data from CoinPaprika.
      </p>
    </section>

    <!-- Filters -->
    <section class="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div class="flex flex-wrap gap-3 items-end text-[11px]">
        <!-- Search -->
        <div class="flex flex-col gap-1">
          <label class="text-slate-300">Search</label>
          <input v-model="search" type="text" placeholder="Symbol or name…"
            class="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400/70" />
        </div>

        <!-- Min market cap -->
        <div class="flex flex-col gap-1">
          <label class="text-slate-300">Min market cap (M)</label>
          <input v-model.number="minMarketCapM" type="number" min="0"
            class="w-28 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400/70" />
        </div>

        <!-- Min volume -->
        <div class="flex flex-col gap-1">
          <label class="text-slate-300">Min volume 24h (M)</label>
          <input v-model.number="minVolumeM" type="number" min="0"
            class="w-28 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400/70" />
        </div>

        <!-- Min change 24h -->
        <div class="flex flex-col gap-1">
          <label class="text-slate-300">Min change 24h (%)</label>
          <input v-model.number="minChange24h" type="number"
            class="w-24 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400/70" />
        </div>

        <!-- Sort -->
        <div class="flex flex-col gap-1">
          <label class="text-slate-300">Sort by</label>
          <select v-model="sortBy"
            class="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400/70">
            <option value="marketCap">Market cap</option>
            <option value="volume24h">Volume 24h</option>
            <option value="change24h">% change 24h</option>
            <option value="change7d">% change 7d</option>
            <option value="price">Price</option>
            <option value="rank">Rank</option>
          </select>
        </div>

        <button type="button"
          class="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-white/10"
          @click="toggleSortDir">
          <span>Direction</span>
          <span class="text-emerald-300">
            {{ sortDir === 'desc' ? '↓ Desc' : '↑ Asc' }}
          </span>
        </button>

        <button type="button"
          class="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[11px] transition"
          :class="onlyFavorites ? 'bg-emerald-500/20 text-emerald-200' : 'text-slate-200 hover:bg-white/10'"
          @click="onlyFavorites = !onlyFavorites">
          <span v-if="onlyFavorites">★ Only favorites</span>
          <span v-else>☆ Only favorites</span>
          <span v-if="favorites.length" class="text-[10px] text-slate-400 ml-1">
            ({{ favorites.length }})
          </span>

        </button>


        <!-- Reset -->
        <button type="button"
          class="ml-auto inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-white/10"
          @click="resetFilters">
          Reset filters
        </button>
      </div>

      <div class="text-[11px] text-slate-400">
        Showing
        <span class="text-emerald-300 font-medium">{{ filteredAssets.length }}</span>
        of
        <span class="font-medium">{{ rawCount }}</span>
        assets.
      </div>
    </section>

    <!-- Table -->
    <section class="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div v-if="error" class="text-sm text-red-300">
        {{ errorMessage }}
      </div>

      <div v-else-if="pending" class="text-sm text-slate-300">
        Loading screener data…
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <div class="text-[10px] text-slate-500 mb-1">
            <span v-if="sparkPending">Loading trend mini-charts…</span>
            <span v-else-if="sparkError">{{ sparkError }}</span>
          </div>

          <table class="min-w-full text-left text-xs">
            <thead class="border-b border-white/10 text-[10px] uppercase tracking-wide text-slate-400">
              <tr>
                <th class="py-2 pr-2 text-center w-6">★</th>
                <th class="py-2 pr-3">#</th>
                <th class="py-2 pr-3">Asset</th>
                <th class="py-2 pr-3 text-right">Price</th>
                <th class="py-2 pr-3 text-right">% 1h</th>
                <th class="py-2 pr-3 text-right">% 24h</th>
                <th class="hidden py-2 pr-3 text-right md:table-cell">% 7d</th>
                <th class="hidden py-2 pr-3 text-right sm:table-cell">Mkt Cap</th>
                <th class="hidden py-2 pl-3 text-right sm:table-cell">Vol 24h</th>
                <th class="py-2 pl-3 text-right hidden md:table-cell">Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asset in filteredAssets" :key="asset.id" class="border-b border-white/5 hover:bg-white/5">
                <td class="py-2 pr-2 text-center text-[11px]">
                  <button type="button" class="transition" @click.stop="toggleFavorite(asset.id)">
                    <span v-if="isFavorite(asset.id)" class="text-emerald-300">
                      ★
                    </span>
                    <span v-else class="text-slate-500 hover:text-slate-300">
                      ☆
                    </span>
                  </button>
                </td>

                <td class="py-2 pr-3 text-[11px] text-slate-400">
                  {{ asset.rank }}
                </td>
                <td class="py-2 pr-3 text-[11px]">
                  <NuxtLink :to="`/asset/${asset.id}`" class="font-medium text-slate-100 hover:underline">
                    {{ asset.symbol }}
                  </NuxtLink>
                  <span class="ml-1 text-slate-400">
                    · {{ asset.name }}
                  </span>
                </td>
                <td class="py-2 pr-3 text-right text-[11px]">
                  {{ formatCurrency(asset.price) }}
                </td>
                <td class="py-2 pr-3 text-right text-[11px]" :class="changeClass(asset.change1h)">
                  {{ formatPercent(asset.change1h) }}
                </td>
                <td class="py-2 pr-3 text-right text-[11px]" :class="changeClass(asset.change24h)">
                  {{ formatPercent(asset.change24h) }}
                </td>
                <td class="hidden py-2 pr-3 text-right text-[11px] md:table-cell" :class="changeClass(asset.change7d)">
                  {{ formatPercent(asset.change7d) }}
                </td>
                <td class="hidden py-2 pr-3 text-right text-[11px] sm:table-cell">
                  {{ formatCompact(asset.marketCap) }}
                </td>
                <td class="hidden py-2 pl-3 text-right text-[11px] sm:table-cell">
                  {{ formatCompact(asset.volume24h) }}
                </td>
                <td class="hidden py-2 pl-3 text-right text-[11px] md:table-cell">
                  <MiniSparkline :points="sparklineMap[asset.id] ?? []" />
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredAssets.length === 0"
          class="mt-4 rounded-xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-3 text-[11px] text-slate-300">
          No assets match the current filters. Try lowering the thresholds or clearing the
          search.
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import MiniSparkline from '~/components/charts/MiniSparkline.vue'

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

type SparkPoint = {
  time: number
  value: number
}

const sparklineMap = ref<Record<string, SparkPoint[]>>({})
const sparkPending = ref(false)
const sparkError = ref<string | null>(null)

const { data, pending, error } = await useFetch<AssetSummary[]>('/api/assets/list', {
  query: { limit: 200 } // pedimos más que en el dashboard
})

const rawAssets = computed(() => data.value ?? [])
const rawCount = computed(() => rawAssets.value.length)

watch(
  () => rawAssets.value,
  async (assets) => {
    if (!assets || !assets.length) return

    const ids = assets.map((a) => a.id).join(',')
    sparkPending.value = true
    sparkError.value = null
    try {
      const res = await $fetch<{ id: string; points: SparkPoint[] }[]>('/api/assets/sparkline', {
        params: {
          ids,
          days: 30
        }
      })
      const map: Record<string, SparkPoint[]> = {}
      for (const s of res) {
        map[s.id] = s.points
      }
      sparklineMap.value = map
    } catch (e) {
      console.error(e)
      sparkError.value = 'Failed to load sparklines.'
    } finally {
      sparkPending.value = false
    }
  },
  { immediate: true }
)

// Filters
const search = ref('')
const minMarketCapM = ref<number | null>(500) // 500M por defecto
const minVolumeM = ref<number | null>(50)     // 50M por defecto
const minChange24h = ref<number | null>(null)

// Sorting
const sortBy = ref<'marketCap' | 'volume24h' | 'change24h' | 'change7d' | 'price' | 'rank'>('marketCap')
const sortDir = ref<'asc' | 'desc'>('desc')

//  Favorites
const { favorites, isFavorite, toggleFavorite } = useFavorites()
const onlyFavorites = ref(false)


const errorMessage = computed(() => {
  if (!error.value) return ''
  return typeof error.value === 'string'
    ? error.value
    : 'Failed to load screener data.'
})

const toggleSortDir = () => {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
}

const resetFilters = () => {
  search.value = ''
  minMarketCapM.value = 500
  minVolumeM.value = 50
  minChange24h.value = null
  sortBy.value = 'marketCap'
  sortDir.value = 'desc'
}

// Helpers
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

// Core computed: filtered & sorted assets
const filteredAssets = computed(() => {
  let result = [...rawAssets.value]

  // Search by symbol/name
  const term = search.value.trim().toLowerCase()
  if (term) {
    result = result.filter((a) =>
      a.symbol.toLowerCase().includes(term) ||
      a.name.toLowerCase().includes(term)
    )
  }

  // Market cap filter (convert M to real number)
  if (minMarketCapM.value != null && !Number.isNaN(minMarketCapM.value)) {
    const threshold = minMarketCapM.value * 1_000_000
    result = result.filter((a) => a.marketCap >= threshold)
  }

  // Volume filter
  if (minVolumeM.value != null && !Number.isNaN(minVolumeM.value)) {
    const threshold = minVolumeM.value * 1_000_000
    result = result.filter((a) => a.volume24h >= threshold)
  }

  // Min change 24h
  if (minChange24h.value != null && !Number.isNaN(minChange24h.value)) {
    result = result.filter((a) => a.change24h >= minChange24h.value!)
  }

  // Only favorites
  if (onlyFavorites.value) {
    result = result.filter((a) => isFavorite(a.id))
  }
  // Sorting
  result.sort((a, b) => {
    const key = sortBy.value
    const da = a[key]
    const db = b[key]

    if (da === db) return 0
    if (sortDir.value === 'asc') {
      return da < db ? -1 : 1
    } else {
      return da > db ? -1 : 1
    }
  })

  return result
})
</script>
